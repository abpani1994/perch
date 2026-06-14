import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import PgBoss from "pg-boss";

import prisma from "./config/db.js";
import authRoutes from "./routes/auth.js";
import campusRoutes from "./routes/campuses.js";
import venueRoutes from "./routes/venues.js";
import streamRoutes from "./routes/stream.js";
import favoriteRoutes from "./routes/favorites.js";
import prefRoutes from "./routes/prefs.js";
import billingRoutes from "./routes/billing.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Signing-secret boot check (S7) ────────────────────────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters.");
}

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));

// Stripe webhook needs the raw body — mount BEFORE express.json().
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

// ── Rate limiting (S9) ─────────────────────────────────────────────────────
app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false }));
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/stream",
  })
);

// ── Health (S4) ─────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok" });
  } catch {
    res.status(503).json({ status: "down", db: "fail" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/campuses", campusRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/prefs", prefRoutes);
app.use("/api/billing", billingRoutes);

// ── SPA static serving (S6) ─────────────────────────────────────────────────
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

// ── Error sanitization (S10) ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Perch API listening on :${PORT}`);
});

// ── Background expiry cleanup via pg-boss ────────────────────────────────────
// Query-time filtering (expiresAt > now) is the source of truth, so the app is
// correct even if this job never runs; this just keeps the table lean.
let boss;
(async () => {
  try {
    boss = new PgBoss({ connectionString: process.env.DATABASE_URL });
    boss.on("error", (e) => console.error("pg-boss:", e.message));
    await boss.start();
    await boss.work("expire-checkins", async () => {
      const result = await prisma.checkIn.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      if (result.count) console.log(`Expired ${result.count} stale check-ins.`);
    });
    await boss.schedule("expire-checkins", "*/10 * * * *");
    console.log("pg-boss expiry job scheduled.");
  } catch (e) {
    console.error("pg-boss failed to start (non-fatal):", e.message);
  }
})();

// ── Graceful shutdown (S11) ─────────────────────────────────────────────────
async function shutdown() {
  server.close(async () => {
    try {
      if (boss) await boss.stop({ graceful: true });
    } catch {
      /* ignore */
    }
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;