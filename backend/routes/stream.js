import { Router } from "express";

const router = Router();

// In-process SSE client registry. Correct for a single-node deployment;
// would need Postgres LISTEN/NOTIFY fan-out to survive horizontal scale-out.
const clients = new Set();

export function broadcastCheckIn(payload) {
  const data = `event: checkin\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    try {
      res.write(data);
    } catch {
      clients.delete(res);
    }
  }
}

// GET /api/stream — Server-Sent Events of live check-ins
router.get("/", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  clients.add(res);

  const ping = setInterval(() => {
    try {
      res.write(`event: ping\ndata: {}\n\n`);
    } catch {
      /* ignore */
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(ping);
    clients.delete(res);
  });
});

export default router;