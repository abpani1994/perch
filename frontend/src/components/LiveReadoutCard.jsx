import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { FreshnessRing } from "./telemetry";

// A continuously-running, state-driven simulation of one café's live readout.
// Illustrative marketing demo (not backend data): the freshness ring ticks
// down toward stale, and every so often a fresh check-in resets it. Honors
// prefers-reduced-motion with a calm static state.
const SEQUENCE = [
  { outletsFree: 2, noise: "ambient", crowd: "moderate", laptopOk: true },
  { outletsFree: 4, noise: "silent", crowd: "quiet", laptopOk: true },
  { outletsFree: 1, noise: "ambient", crowd: "moderate", laptopOk: true },
  { outletsFree: 3, noise: "silent", crowd: "quiet", laptopOk: true },
];

const NOISE_TONE = { silent: "#16a34a", ambient: "#d97706", loud: "#dc2626" };
const NOISE_LABEL = { silent: "Silent", ambient: "Ambient", loud: "Loud" };

export default function LiveReadoutCard() {
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [idx, setIdx] = useState(0);
  const [age, setAge] = useState(0); // minutes since last check-in, 0..90
  const state = SEQUENCE[idx];

  useEffect(() => {
    if (reduced.current) {
      setAge(11);
      return;
    }
    // age ticks up; when it crosses a threshold, a new check-in lands (reset).
    const tick = setInterval(() => {
      setAge((a) => {
        const next = a + 1;
        if (next >= 22) {
          setIdx((i) => (i + 1) % SEQUENCE.length);
          return 0;
        }
        return next;
      });
    }, 900);
    return () => clearInterval(tick);
  }, []);

  const freshness = Math.max(0, 1 - age / 90);
  const minutesAgo = Math.round(age);

  return (
    <div className="card !p-5 relative overflow-hidden" style={{ maxWidth: 380 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="mono text-[11px] uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
            Live readout
          </span>
        </div>
        <span className="mono text-[11px]" style={{ color: "var(--text-2)" }}>
          {minutesAgo === 0 ? "just now" : `${minutesAgo}m ago`}
        </span>
      </div>

      <h3 className="font-semibold text-lg mt-3" style={{ color: "var(--text-1)" }}>
        Mighty Good Coffee
      </h3>
      <p className="mono text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
        0.3 mi · Ann Arbor
      </p>

      {/* outlet density bar */}
      <div className="mt-5">
        <div className="flex items-end justify-between mb-1.5">
          <span className="mono text-[11px] uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
            Outlets free
          </span>
          <span className="tabular-nums text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            {state.outletsFree} of 6
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${(state.outletsFree / 6) * 100}%`,
              background: "var(--brand)",
              transition: "width var(--dur-slow) var(--ease-entrance)",
            }}
          />
        </div>
      </div>

      {/* signals row */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <span className="mono text-[10px] uppercase tracking-wide block" style={{ color: "var(--text-2)" }}>
            Noise now
          </span>
          <span className="inline-flex items-center gap-1.5 mt-1 text-sm font-medium" style={{ color: NOISE_TONE[state.noise] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: NOISE_TONE[state.noise] }} />
            {NOISE_LABEL[state.noise]}
          </span>
        </div>
        <div>
          <span className="mono text-[10px] uppercase tracking-wide block" style={{ color: "var(--text-2)" }}>
            Laptops
          </span>
          <span className="inline-flex items-center gap-1.5 mt-1 text-sm font-medium" style={{ color: "#16a34a" }}>
            <Icon icon="ph:laptop" width="15" /> Welcome
          </span>
        </div>
      </div>

      {/* freshness ring footer */}
      <div className="mt-5 pt-4 hairline-t flex items-center justify-between">
        <div>
          <span className="mono text-[10px] uppercase tracking-wide block" style={{ color: "var(--text-2)" }}>
            Signal freshness
          </span>
          <span className="text-sm font-medium mt-0.5 block" style={{ color: freshness >= 0.66 ? "#16a34a" : "#d97706" }}>
            {Math.round(freshness * 90)} min of trust left
          </span>
        </div>
        <FreshnessRing freshness={freshness} size={48} label={`${Math.round(freshness * 90)}m`} />
      </div>
    </div>
  );
}