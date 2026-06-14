import { Router } from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import {
  haversineMiles,
  buildReadout,
  buildNoiseHeatmap,
} from "../utils/telemetry.js";
import { broadcastCheckIn } from "./stream.js";

const router = Router();

const NOISE_TIERS = ["silent", "ambient", "loud"];
const CROWDING = ["quiet", "moderate", "packed"];
const RADIUS_MILES = 1.5;
const EXPIRY_MS = 90 * 60 * 1000;

// ── Ownership-scoping note (S1) ──────────────────────────────────────────────
// Venue and Campus are PUBLIC, SHARED reference tables. They have NO userId
// column in prisma/schema.prisma, and anonymous browsing of campuses and venues
// is a core product feature (the landing CTA opens the map with no account).
// Per the S1 rule, userId scoping is NOT added to these reference tables.
// The only user-owned write in this file is creating a CheckIn, which is bound
// to req.user.id. Helpers below look up reference rows WITHOUT exposing any
// per-user resource, so there is no IDOR surface.

const errBody = (err) => ({
  error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
});

// Fetch a public campus reference row by its public id (no user scope exists).
async function findCampus(publicId) {
  const rows = await prisma.campus.findMany({ where: { id: String(publicId) }, take: 1 });
  return rows[0] || null;
}

// Fetch a public venue reference row by its public id, with optional includes.
async function findVenue(publicId, include) {
  const rows = await prisma.venue.findMany({
    where: { id: String(publicId) },
    take: 1,
    ...(include ? { include } : {}),
  });
  return rows[0] || null;
}

// GET /api/venues?campusId=&laptop=&minOutlets=&maxNoise=&sort=
router.get("/", async (req, res) => {
  try {
    const { campusId, laptop, minOutlets, maxNoise, sort } = req.query;
    if (!campusId) return res.status(400).json({ error: "Choose a campus to see venues." });

    const campus = await findCampus(campusId);
    if (!campus) return res.status(404).json({ error: "We could not find that campus." });

    const now = new Date();
    const venues = await prisma.venue.findMany({
      where: { campusId: campus.id },
      include: {
        checkIns: {
          where: { expiresAt: { gt: now } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    let rows = venues.map((v) => {
      const readout = buildReadout(v, v.checkIns);
      const distance = haversineMiles(campus.lat, campus.lng, v.lat, v.lng);
      return {
        id: v.id,
        name: v.name,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        distanceMiles: Math.round(distance * 100) / 100,
        ...readout,
      };
    });

    rows = rows.filter((r) => r.distanceMiles <= RADIUS_MILES + 0.5);

    if (laptop === "ok") rows = rows.filter((r) => r.laptopPolicy !== "banned");
    if (minOutlets) {
      const n = parseInt(minOutlets, 10);
      if (!Number.isNaN(n)) rows = rows.filter((r) => r.outletCount >= n);
    }
    if (maxNoise && NOISE_TIERS.includes(maxNoise)) {
      const cap = NOISE_TIERS.indexOf(maxNoise);
      rows = rows.filter((r) => {
        if (!r.liveNoise) return true;
        return NOISE_TIERS.indexOf(r.liveNoise) <= cap;
      });
    }

    switch (sort) {
      case "outlets":
        rows.sort((a, b) => b.outletCount - a.outletCount);
        break;
      case "freshness":
        rows.sort((a, b) => b.freshness - a.freshness);
        break;
      case "noise":
        rows.sort(
          (a, b) =>
            NOISE_TIERS.indexOf(a.liveNoise || "silent") -
            NOISE_TIERS.indexOf(b.liveNoise || "silent")
        );
        break;
      default:
        rows.sort((a, b) => a.distanceMiles - b.distanceMiles);
    }

    return res.json({ campus: { id: campus.id, name: campus.name }, venues: rows });
  } catch (err) {
    return res.status(500).json(errBody(err));
  }
});

// GET /api/venues/:id — public venue detail
router.get("/:id", async (req, res) => {
  try {
    const now = new Date();
    const venue = await findVenue(req.params.id, {
      campus: true,
      checkIns: { where: { expiresAt: { gt: now } }, orderBy: { createdAt: "desc" } },
      noiseReports: true,
    });
    if (!venue) return res.status(404).json({ error: "That café is not on Perch yet." });

    const readout = buildReadout(venue, venue.checkIns);
    const heatmap = buildNoiseHeatmap(venue.baseNoise, venue.noiseReports);

    return res.json({
      venue: {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        lat: venue.lat,
        lng: venue.lng,
        campus: { id: venue.campus.id, name: venue.campus.name },
        ...readout,
        heatmap,
      },
    });
  } catch (err) {
    return res.status(500).json(errBody(err));
  }
});

// GET /api/venues/:id/checkins — public, non-expired check-in feed for a venue
router.get("/:id/checkins", async (req, res) => {
  try {
    const now = new Date();
    const checkIns = await prisma.checkIn.findMany({
      where: { venueId: String(req.params.id), expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { user: { select: { name: true } } },
    });
    return res.json({
      checkIns: checkIns.map((c) => ({
        id: c.id,
        outletsFree: c.outletsFree,
        noiseTier: c.noiseTier,
        laptopOk: c.laptopOk,
        crowding: c.crowding,
        createdAt: c.createdAt,
        expiresAt: c.expiresAt,
        by: c.user?.name?.split(" ")[0] || "Someone",
      })),
    });
  } catch (err) {
    return res.status(500).json(errBody(err));
  }
});

// POST /api/venues/:id/checkin — one-tap check-in (auth required).
// The created CheckIn and NoiseReport are bound to req.user.id (user-owned).
router.post("/:id/checkin", requireAuth, async (req, res) => {
  try {
    const venue = await findVenue(req.params.id);
    if (!venue) return res.status(404).json({ error: "That café is not on Perch yet." });

    const { outletsFree, noiseTier, laptopOk, crowding } = req.body || {};

    const outlets = Number(outletsFree);
    if (!Number.isInteger(outlets) || outlets < 0 || outlets > 99)
      return res.status(400).json({ error: "Set how many outlets are free (0 to 99)." });
    if (!NOISE_TIERS.includes(noiseTier))
      return res.status(400).json({ error: "Pick the current noise level." });
    const crowd = CROWDING.includes(crowding) ? crowding : "moderate";
    const laptop = typeof laptopOk === "boolean" ? laptopOk : true;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + EXPIRY_MS);

    const checkIn = await prisma.checkIn.create({
      data: {
        venueId: venue.id,
        userId: req.user.id,
        outletsFree: outlets,
        noiseTier,
        laptopOk: laptop,
        crowding: crowd,
        expiresAt,
      },
    });

    await prisma.venue.updateMany({
      where: { id: venue.id },
      data: { outletCount: outlets, lastVerifiedAt: now },
    });
    await prisma.noiseReport.create({
      data: {
        venueId: venue.id,
        userId: req.user.id,
        hourOfDay: now.getHours(),
        noiseTier,
      },
    });

    broadcastCheckIn({
      venueId: venue.id,
      venueName: venue.name,
      outletsFree: outlets,
      noiseTier,
      crowding: crowd,
      laptopOk: laptop,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    return res.status(201).json({
      checkIn: {
        id: checkIn.id,
        outletsFree: checkIn.outletsFree,
        noiseTier: checkIn.noiseTier,
        laptopOk: checkIn.laptopOk,
        crowding: checkIn.crowding,
        createdAt: checkIn.createdAt,
        expiresAt: checkIn.expiresAt,
      },
    });
  } catch (err) {
    return res.status(500).json(errBody(err));
  }
});

export default router;