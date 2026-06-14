import { Router } from "express";
import prisma from "../config/db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const campuses = await prisma.campus.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { venues: true } } },
    });
    return res.json({
      campuses: campuses.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        lat: c.lat,
        lng: c.lng,
        venueCount: c._count.venues,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;