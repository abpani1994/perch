import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Sign in to continue." });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, plan: payload.plan };
    next();
  } catch {
    return res.status(401).json({ error: "Your session expired. Sign in again." });
  }
}

// Soft auth: attaches req.user if a valid token is present, but never blocks.
export function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.id, email: payload.email, plan: payload.plan };
    }
  } catch {
    /* ignore — anonymous */
  }
  next();
}