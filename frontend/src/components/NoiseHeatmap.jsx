import { useRef, useState, useCallback, useEffect } from "react";
import { hourLabel, NOISE_LABEL } from "../lib/format";

// Tier 0=silent (dim) → 2=loud (brand). The "session window" brightens.
const TIER_BG = ["var(--surface-2)", "var(--brand-soft)", "var(--brand)"];
const TIER_TEXT = ["var(--text-2)", "var(--brand-600)", "#ffffff"];

// data: [{ hour, tier, reports }] length 24
// windowHours: number of hours the planned session spans (default 3)
export function NoiseHeatmap({ data = [], cursorHour = 14, onCursorChange, windowHours = 3, compact = false }) {
  const stripRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const hours = data.length === 24 ? data : Array.from({ length: 24 }, (_, h) => ({ hour: h, tier: 0, reports: 0 }));

  const inWindow = (h) => h >= cursorHour && h < cursorHour + windowHours;

  const hourFromEvent = useCallback((clientX) => {
    const el = stripRef.current;
    if (!el) return cursorHour;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    let h = Math.floor(ratio * 24);
    h = Math.max(0, Math.min(23, h));
    return Math.min(h, 24 - windowHours);
  }, [cursorHour, windowHours]);

  const updateFrom = useCallback(
    (clientX) => {
      const h = hourFromEvent(clientX);
      onCursorChange && onCursorChange(h);
    },
    [hourFromEvent, onCursorChange]
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      updateFrom(x);
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, updateFrom]);

  return (
    <div className="select-none">
      <div
        ref={stripRef}
        className="relative flex items-end gap-[3px] cursor-ew-resize touch-none"
        style={{ height: compact ? 56 : 96 }}
        onPointerDown={(e) => {
          setDragging(true);
          updateFrom(e.clientX);
        }}
        role="slider"
        aria-label="Drag to plan your session hour"
        aria-valuemin={0}
        aria-valuemax={23}
        aria-valuenow={cursorHour}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onCursorChange && onCursorChange(Math.max(0, cursorHour - 1));
          if (e.key === "ArrowRight") onCursorChange && onCursorChange(Math.min(24 - windowHours, cursorHour + 1));
        }}
      >
        {hours.map((cell) => {
          const lit = inWindow(cell.hour);
          return (
            <div key={cell.hour} className="flex-1 flex flex-col items-stretch justify-end h-full">
              <div
                className="rounded-sm"
                style={{
                  height: `${30 + cell.tier * 33}%`,
                  background: TIER_BG[cell.tier],
                  opacity: lit ? 1 : 0.4,
                  outline: lit ? "1px solid var(--brand)" : "none",
                  transition: "opacity var(--dur-base) var(--ease-hover), background var(--dur-base)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* hour axis */}
      <div className="flex justify-between mt-2 font-mono text-[10px]" style={{ color: "var(--text-2)" }}>
        {[0, 6, 12, 18, 23].map((h) => (
          <span key={h}>{hourLabel(h)}</span>
        ))}
      </div>

      {/* readout for the window */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="pill !bg-[color:var(--brand-soft)] !text-[color:var(--brand-600)] !border-[color:var(--brand)]">
          {hourLabel(cursorHour)}–{hourLabel(Math.min(23, cursorHour + windowHours))}
        </span>
        <span className="font-mono text-xs" style={{ color: "var(--text-2)" }}>
          mostly {NOISE_LABEL[["silent", "ambient", "loud"][windowTier(hours, cursorHour, windowHours)]].toLowerCase()} in this window
        </span>
      </div>
    </div>
  );
}

function windowTier(hours, start, span) {
  let sum = 0;
  let n = 0;
  for (let h = start; h < start + span && h < 24; h++) {
    sum += hours[h]?.tier ?? 0;
    n++;
  }
  return n ? Math.round(sum / n) : 0;
}

export default NoiseHeatmap;