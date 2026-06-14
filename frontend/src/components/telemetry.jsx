import { Icon } from "@iconify/react";
import { NOISE_LABEL, LAPTOP_LABEL, CROWD_LABEL, relativeTime, freshnessLabel } from "../lib/format";

// ── Freshness ring — 90-min decay indicator ──────────────────────────────────
export function FreshnessRing({ freshness = 0, size = 44, stroke = 4, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, freshness)));
  const color = freshness >= 0.66 ? "#16a34a" : freshness >= 0.25 ? "#d97706" : "var(--text-2)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hairline)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset var(--dur-slow) var(--ease-entrance), stroke var(--dur-base)" }}
        />
      </svg>
      {label && (
        <span className="absolute text-[9px] font-medium tabular-nums" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ── Outlet density gauge — horizontal bar ────────────────────────────────────
export function OutletGauge({ outletCount = 0, outletsFree = null, max = 14 }) {
  const pct = Math.max(0, Math.min(1, outletCount / max));
  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-1.5">
        <span className="font-mono text-xs uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
          Outlets
        </span>
        <span className="tabular-nums text-sm font-semibold" style={{ color: "var(--text-1)" }}>
          {outletsFree != null ? `${outletsFree} free` : `${outletCount} seats wired`}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct * 100}%`,
            background: "var(--brand)",
            transition: "width var(--dur-slow) var(--ease-entrance)",
          }}
        />
      </div>
    </div>
  );
}

// ── Laptop policy flag ────────────────────────────────────────────────────────
export function LaptopFlag({ policy = "welcome", timeLimitMinutes }) {
  const map = {
    welcome: { icon: "ph:laptop", color: "#16a34a" },
    limited: { icon: "ph:timer", color: "#d97706" },
    banned: { icon: "ph:prohibit", color: "#dc2626" },
  };
  const m = map[policy] || map.welcome;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: m.color }}>
      <Icon icon={m.icon} width="15" />
      {LAPTOP_LABEL[policy]}
      {policy === "limited" && timeLimitMinutes ? ` · ${timeLimitMinutes}m` : ""}
    </span>
  );
}

// ── Noise tier chip ───────────────────────────────────────────────────────────
export function NoiseChip({ tier }) {
  if (!tier) return <span className="pill">No live signal</span>;
  const tone = { silent: "#16a34a", ambient: "#d97706", loud: "#dc2626" }[tier];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: tone }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone }} />
      {NOISE_LABEL[tier]}
    </span>
  );
}

// ── Venue readout card — the reusable "instrument panel" ─────────────────────
export function VenueReadoutCard({ venue, onClick, active }) {
  const fresh = venue.freshness ?? 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="card w-full text-left !p-4 hover:-translate-y-0.5"
      style={{
        outline: active ? "2px solid var(--brand)" : "none",
        outlineOffset: 2,
        transition: "border-color var(--dur-base) var(--ease-hover), transform var(--dur-base) var(--ease-hover)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-base truncate" style={{ color: "var(--text-1)" }}>
            {venue.name}
          </h3>
          {venue.distanceMiles != null && (
            <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
              {venue.distanceMiles} mi
            </p>
          )}
        </div>
        <FreshnessRing freshness={fresh} label={`${Math.round(fresh * 90)}m`} />
      </div>

      <div className="mt-3">
        <OutletGauge outletCount={venue.outletCount} outletsFree={venue.outletsFree} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <NoiseChip tier={venue.liveNoise} />
        <LaptopFlag policy={venue.laptopPolicy} timeLimitMinutes={venue.timeLimitMinutes} />
      </div>

      <div className="mt-3 pt-3 hairline-t flex items-center justify-between">
        <span className="font-mono text-[11px]" style={{ color: "var(--text-2)" }}>
          {venue.verifiedAt ? `verified ${relativeTime(venue.verifiedAt)}` : "no recent check-in"}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wide" style={{ color: fresh >= 0.66 ? "#16a34a" : "var(--text-2)" }}>
          {freshnessLabel(fresh)}
        </span>
      </div>
    </button>
  );
}

// ── Crowding pill ─────────────────────────────────────────────────────────────
export function CrowdingPill({ crowding }) {
  if (!crowding) return null;
  const tone = { quiet: "#16a34a", moderate: "#d97706", packed: "#dc2626" }[crowding];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: tone }}>
      <Icon icon="ph:users-three" width="14" />
      {CROWD_LABEL[crowding]}
    </span>
  );
}

// ── 24-hour noise heatmap strip with draggable hour cursor ───────────────────
export { NoiseHeatmap } from "./NoiseHeatmap.jsx";