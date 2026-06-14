import { Router } from "express";
import Stripe from "stripe";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const PRICE_ID = process.env.STRIPE_PRICE_ID;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4000";

const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY) : null;

// Tells the frontend whether to show the upgrade flow or a "not connected" state.
router.get("/status", (req, res) => {
  res.json({ configured: Boolean(stripe && PRICE_ID) });
});

router.post("/checkout", requireAuth, async (req, res) => {
  try {
    if (!stripe || !PRICE_ID) {
      return res.status(503).json({
        error: "Payments are not connected on this deployment.",
        configured: false,
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${CLIENT_URL}/settings?upgrade=success`,
      cancel_url: `${CLIENT_URL}/settings?upgrade=cancelled`,
      client_reference_id: req.user.id,
      metadata: { userId: req.user.id },
    });
    return res.json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

// Stripe webhook — needs the raw body (mounted with express.raw in server.js).
router.post("/webhook", async (req, res) => {
  try {
    if (!stripe || !WEBHOOK_SECRET) {
      return res.status(503).json({ error: "Payments are not connected." });
    }
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ error: `Webhook signature failed: ${(process.env.NODE_ENV === "production" ? "Internal server error" : err.message)}` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId || session.client_reference_id;
      if (userId) {
        await prisma.user.update({ where: { id: userId }, data: { plan: "pro" } }).catch(() => {});
      }
    }
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      if (userId) {
        await prisma.user.update({ where: { id: userId }, data: { plan: "free" } }).catch(() => {});
      }
    }
    return res.json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;