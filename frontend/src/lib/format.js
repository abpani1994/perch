// Telemetry formatting helpers shared across app + landing.

export const NOISE_LABEL = { silent: "Silent", ambient: "Ambient", loud: "Loud" };
export const LAPTOP_LABEL = { welcome: "Laptops welcome", limited: "Time limited", banned: "Laptops banned" };
export const CROWD_LABEL = { quiet: "Quiet", moderate: "Moderate", packed: "Packed" };

export function relativeTime(date) {
  if (!date) return "never verified";
  const m = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m === 1) return "1 min ago";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h === 1) return "1 hr ago";
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

export function minutesLeft(expiresAt) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000));
}

// freshness 0..1 -> label
export function freshnessLabel(f) {
  if (f >= 0.66) return "fresh";
  if (f >= 0.25) return "aging";
  if (f > 0) return "stale";
  return "unverified";
}

export function hourLabel(h) {
  const ampm = h < 12 ? "am" : "pm";
  let hr = h % 12;
  if (hr === 0) hr = 12;
  return `${hr}${ampm}`;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}