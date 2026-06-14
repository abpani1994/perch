import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

// ── Problem: quiet, static "failure log" ─────────────────────────────────────
const FAILURES = [
  { stamp: "log · 13:42", line: "Arrived. Every outlet taken. Sat near the door for the cord.", note: "4.6 stars told you nothing about the outlets." },
  { stamp: "log · 09:15", line: "Laptops banned 8–11am on weekends. Sign on the door, not the listing.", note: "Or the laptop ban." },
  { stamp: "log · 14:08", line: "Packed mid-afternoon. Couldn't hear yourself think, let alone write.", note: "Or the 2pm crowd." },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <span className="mono text-xs uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
          The wasted commute
        </span>
        <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">
          You gambled twenty minutes on a star rating.
        </h2>
        <div className="mt-10 space-y-px">
          {FAILURES.map((f) => (
            <div key={f.stamp} className="py-5 hairline-t first:border-t-0 first:pt-0">
              <span className="mono text-[11px] uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
                {f.stamp}
              </span>
              <p className="mt-1.5 text-base md:text-lg" style={{ color: "var(--text-1)" }}>
                {f.line}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-2)" }}>{f.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
          Perch reads the building before you pack your bag &mdash; outlet density, noise by hour, and the
          laptop policy, each stamped with the last time a real person verified it.
        </p>
      </div>
    </section>
  );
}

// ── Freshness band: a check-in chip that decays on scroll ────────────────────
const CHIPS = [
  { by: "Maya", mins: 6, fresh: true },
  { by: "Devin", mins: 31 },
  { by: "Priya", mins: 58 },
  { by: "Omar", mins: 84, stale: true },
];

export function FreshnessBand() {
  const ref = useRef(null);
  const [decayed, setDecayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setDecayed(true)),
      { threshold: 0.3 }
    );
    io.observe(el);
    const failsafe = setTimeout(() => setDecayed(true), 1400);
    return () => { io.disconnect(); clearTimeout(failsafe); };
  }, []);

  return (
    <section id="freshness" className="py-20 md:py-28" ref={ref} style={{ background: "var(--surface-2)" }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <span className="mono text-xs uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
          The trust mechanic · 90 minutes
        </span>
        <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
          Someone was just there. In 90 minutes, that fact expires.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
          Because so does the truth. Every check-in auto-expires after an hour and a half, so the readout you
          see is always &ldquo;as of right now&rdquo; &mdash; never a stale rating from last spring.
        </p>

        <div className="mt-10 flex items-stretch gap-3 overflow-x-auto pb-2">
          {CHIPS.map((c, i) => {
            const faded = decayed && c.stale;
            return (
              <div
                key={c.by}
                className="rounded-[var(--radius)] px-4 py-3 flex-shrink-0 min-w-[150px]"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  opacity: faded ? 0.3 : decayed ? 1 - i * 0.16 : 1,
                  transition: "opacity 900ms var(--ease-entrance)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c.mins < 30 ? "#4ade80" : c.mins < 70 ? "#fbbf24" : "var(--text-2)" }}
                  />
                  <span className="mono text-[11px]" style={{ color: "var(--text-1)" }}>
                    {c.mins}m ago
                  </span>
                </div>
                <p className="text-sm mt-2" style={{ color: "var(--text-1)" }}>{c.by} checked in</p>
                <p className="mono text-[11px] mt-0.5" style={{ color: "var(--text-2)" }}>
                  {c.stale ? "expiring" : `${90 - c.mins}m of trust left`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How it works: 3-step offset flow ─────────────────────────────────────────
const STEPS = [
  { n: "01", icon: "ph:map-pin-line", title: "Pre-loaded for your quad", body: "We seed the 15 to 30 most-visited cafés within 1.5 miles of your campus, so day one is never empty." },
  { n: "02", icon: "ph:gauge", title: "Read the readout", body: "Outlets free, noise by hour, laptop policy, crowding — each stamped with how long ago it was verified." },
  { n: "03", icon: "ph:hand-tap", title: "Keep it honest", body: "One tap when you sit down. Your signal helps the next person, then quietly expires in 90 minutes." },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <span className="mono text-xs uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
          The flywheel
        </span>
        <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight max-w-2xl">
          Pre-loaded for your quad. Kept honest by whoever sits down next.
        </h2>
        <div className="reveal-stagger reveal mt-12 grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ marginTop: i % 2 === 1 ? "1.5rem" : 0 }}>
              <div className="flex items-center gap-3">
                <span className="mono text-sm" style={{ color: "var(--brand)" }}>{s.n}</span>
                <span className="w-9 h-9 grid place-items-center rounded-[var(--radius)]" style={{ background: "var(--surface-2)" }}>
                  <Icon icon={s.icon} width="18" style={{ color: "var(--text-1)" }} />
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="hairline-t py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon icon="ph:coffee-fill" width="20" style={{ color: "var(--brand)" }} />
          <span className="font-semibold tracking-tight">Perch</span>
          <span className="mono text-xs ml-2" style={{ color: "var(--text-2)" }}>
            campus café telemetry
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>
          Built for people who hate gambling a writing block.
        </p>
      </div>
    </footer>
  );
}
