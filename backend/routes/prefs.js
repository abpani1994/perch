import { Router } from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const NOISE_TIERS = ["silent", "ambient", "loud"];

router.get("/", requireAuth, async (req, res) => {
  try {
    const prefs = await prisma.sessionPref.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ prefs });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { label, hour, minNoise, minOutlets, laptopRequired } = req.body || {};
    if (!label || !label.trim()) return res.status(400).json({ error: "Name this preset." });
    const h = Number(hour);
    if (!Number.isInteger(h) || h < 0 || h > 23)
      return res.status(400).json({ error: "Choose an hour of the day." });
    const noise = NOISE_TIERS.includes(minNoise) ? minNoise : "ambient";
    const outlets = Number.isInteger(Number(minOutlets)) ? Number(minOutlets) : 1;

    const pref = await prisma.sessionPref.create({
      data: {
        userId: req.user.id,
        label: label.trim(),
        hour: h,
        minNoise: noise,
        minOutlets: outlets,
        laptopRequired: !!laptopRequired,
      },
    });
    return res.status(201).json({ pref });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.sessionPref.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "That preset is gone." });
    await prisma.sessionPref.delete({ where: { id: existing.id, userId: req.user.id } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;