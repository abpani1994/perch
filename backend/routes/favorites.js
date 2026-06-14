import { Router } from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { buildReadout } from "../utils/telemetry.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        venue: {
          include: {
            checkIns: { where: { expiresAt: { gt: now } }, orderBy: { createdAt: "desc" } },
          },
        },
      },
    });
    return res.json({
      favorites: favorites.map((f) => ({
        id: f.id,
        notify: f.notify,
        venue: { id: f.venue.id, name: f.venue.name, address: f.venue.address, ...buildReadout(f.venue, f.venue.checkIns) },
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { venueId, notify } = req.body || {};
    if (!venueId) return res.status(400).json({ error: "Pick a café to save." });
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) return res.status(404).json({ error: "That café is not on Perch yet." });

    const fav = await prisma.favorite.upsert({
      where: { userId_venueId: { userId: req.user.id, venueId } },
      update: { notify: typeof notify === "boolean" ? notify : undefined },
      create: { userId: req.user.id, venueId, notify: !!notify },
    });
    return res.status(201).json({ favorite: { id: fav.id, venueId: fav.venueId, notify: fav.notify } });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { notify } = req.body || {};
    const existing = await prisma.favorite.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "That saved café is gone." });
    const fav = await prisma.favorite.update({
      where: { id: existing.id, userId: req.user.id },
      data: { notify: !!notify },
    });
    return res.json({ favorite: { id: fav.id, notify: fav.notify } });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.favorite.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "That saved café is gone." });
    await prisma.favorite.delete({ where: { id: existing.id, userId: req.user.id } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;