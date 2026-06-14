import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    plan: u.plan,
    campusId: u.campusId,
    reducedMotion: u.reducedMotion,
    notifyEnabled: u.notifyEnabled,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, campusId } = req.body || {};
    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ error: "Enter a valid email address." });
    if (!password || password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    if (!name || !name.trim())
      return res.status(400).json({ error: "Tell us your name." });

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: "That email is already registered. Sign in instead." });

    let validCampus = null;
    if (campusId) {
      validCampus = await prisma.campus.findUnique({ where: { id: campusId } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name.trim(),
        campusId: validCampus ? validCampus.id : null,
      },
    });
    return res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Enter your email and password." });
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user) return res.status(401).json({ error: "No account with that email and password." });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "No account with that email and password." });
    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "Account not found." });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const { name, campusId, reducedMotion, notifyEnabled } = req.body || {};
    const data = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof reducedMotion === "boolean") data.reducedMotion = reducedMotion;
    if (typeof notifyEnabled === "boolean") data.notifyEnabled = notifyEnabled;
    if (campusId !== undefined) {
      if (campusId === null) data.campusId = null;
      else {
        const c = await prisma.campus.findUnique({ where: { id: campusId } });
        if (!c) return res.status(400).json({ error: "Pick a campus from the list." });
        data.campusId = c.id;
      }
    }
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;