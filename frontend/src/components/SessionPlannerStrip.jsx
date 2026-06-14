import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { NoiseHeatmap } from "./NoiseHeatmap";
import { hourLabel } from "../lib/format";

// One seeded café's day, hand-built. Each hour carries the three session-critical
// readouts so the panel above re-renders as you scrub. tier: 0 silent..2 loud.
const DAY = Array.from({ length: 24 }, (_, h) => {
  let tier = 0;
  let outlets = 5;
  let crowd = "quiet";
  if (h >= 7 && h < 10) { tier = 2; outlets = 1; crowd = "packed"; }
  else if (h >= 10 && h < 12) { tier = 1; outlets = 3; crowd = "moderate"; }
  else if (h >= 12 && h < 14) { tier = 2; outlets = 0; crowd = "packed"; }
  else if (h >= 14 && h < 17) { tier = 1; outlets = 4; crowd = "quiet"; }
  else if (h >= 17 && h < 20) { tier = 1; outlets = 2; crowd = "moderate"; }
  else if (h >= 20 || h < 6) { tier = 0; outlets = 5; crowd = "quiet"; }
  return { hour: h, tier, outlets, crowd, reports: 0 };
});

const WINDOW = 3;
const CROWD_TONE = { quiet: "#16a34a", moderate: "#d97706", packed: "#dc2626" };
const NOISE_LABEL = ["Silent", "Ambient", "Loud"];
const NOISE_TONE = ["#16a34a", "#d97706", "#dc2626"];

const PRESETS = [
  { label: "9am sprint", hour: 9 },
  { label: "2pm session", hour: 14 },
  { label: "evening edit", hour: 18 },
];

export default function SessionPlannerStrip() {
  const [cursor, setCursor] = useState(14);

  const summary = useMemo(() => {
    const slice = DAY.slice(cursor, Math.min(24, cursor + WINDOW));
    const avgTier = Math.round(slice.reduce((s, c) => s + c.tier, 0) / slice.length);
    const minOutlets = Math.min(...slice.map((c) => c.outlets));
    // worst crowd in window
    const order = ["quiet", "moderate", "packed"];
    const worstCrowd = slice.reduce(
      (worst, c) => (order.indexOf(c.crowd) > order.indexOf(worst) ? c.crowd : worst),
      "quiet"
    );
    return { avgTier, minOutlets, worstCrowd };
  }, [cursor]);

  return (
    <section id="planner" className="py-20 md:py-28" style={{ background: "var(--surface-2)" }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="reveal flex items-center gap-2 mb-3">
          <span className="live-dot" />
          <span className="mono text-xs uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
            Session planner · drag the cursor
          </span>
        </div>
        <h2 className="reveal text-2xl md:text-4xl font-semibold tracking-tight max-w-2xl">
          Drag to your writing block. Watch the café change its mind.
        </h2>
        <p className="reveal mt-3 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
          A café&rsquo;s truth is a function of time, not a star average. Scrub across the day for Comet Coffee and
          the outlet count, noise tier, and crowding all re-render to the hour you plan to work.
        </p>

        {/* live readout that re-renders with the cursor */}
        <div className="card mt-8 !p-5 md:!p-7">
          <div className="grid sm:grid-cols-3 gap-4 mb-7">
            <Readout
              label="Planned window"
              value={`${hourLabel(cursor)}–${hourLabel(Math.min(23, cursor + WINDOW))}`}
              tone="var(--text-1)"
              mono
            />
            <Readout
              label="Outlets free (worst)"
              value={`${summary.minOutlets}`}
              tone={summary.minOutlets >= 2 ? "#16a34a" : "#dc2626"}
            />
            <Readout
              label="Noise in window"
              value={NOISE_LABEL[summary.avgTier]}
              tone={NOISE_TONE[summary.avgTier]}
            />
          </div>

          <NoiseHeatmap data={DAY} cursorHour={cursor} onCursorChange={setCursor} windowHours={WINDOW} />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mono text-[11px] uppercase tracking-wide mr-1" style={{ color: "var(--text-2)" }}>
              Presets
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.hour}
                onClick={() => setCursor(p.hour)}
                className="pill hover:border-[color:var(--brand)] transition-colors"
                style={cursor === p.hour ? { background: "var(--brand-soft)", color: "var(--brand-600)", borderColor: "var(--brand)" } : {}}
              >
                {p.label}
              </button>
            ))}
            <span className="ml-auto inline-flex items-center gap-1.5 mono text-[11px]" style={{ color: CROWD_TONE[summary.worstCrowd] }}>
              <Icon icon="ph:users-three" width="14" />
              {summary.worstCrowd} at peak
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Readout({ label, value, tone, mono }) {
  return (
    <div>
      <span className="mono text-[10px] uppercase tracking-wide block" style={{ color: "var(--text-2)" }}>
        {label}
      </span>
      <span
        className={`block mt-1 text-xl font-semibold tabular-nums ${mono ? "mono !text-lg" : ""}`}
        style={{ color: tone, transition: "color var(--dur-base)" }}
      >
        {value}
      </span>
    </div>
  );
}