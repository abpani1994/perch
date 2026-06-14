// Shared telemetry helpers: distance, freshness, live-readout aggregation.

const TIER_INDEX = { silent: 0, ambient: 1, loud: 2 };
const TIER_NAME = ["silent", "ambient", "loud"];

export function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function tierName(i) {
  return TIER_NAME[i] ?? "silent";
}
export function tierIndex(name) {
  return TIER_INDEX[name] ?? 0;
}

// Minutes since a timestamp, or null if never verified.
export function minutesSince(date) {
  if (!date) return null;
  return Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
}

// Freshness 0..1 where 1 = just now, 0 = >=90 min (the auto-expiry window).
export function freshness(date) {
  const m = minutesSince(date);
  if (m === null) return 0;
  return Math.max(0, Math.min(1, 1 - m / 90));
}

// Build a live readout for a venue given its non-expired check-ins (newest first)
// and aggregated hourly noise. Returns the merged "instrument panel" object.
export function buildReadout(venue, activeCheckIns) {
  const latest = activeCheckIns[0] || null;
  const outletsFree = latest ? latest.outletsFree : null;
  const liveNoise = latest ? latest.noiseTier : null;
  const crowding = latest ? latest.crowding : null;
  const verifiedAt = latest ? latest.createdAt : venue.lastVerifiedAt;

  return {
    outletCount: venue.outletCount,
    outletsFree,
    liveNoise,
    crowding,
    laptopPolicy: venue.laptopPolicy,
    timeLimitMinutes: venue.timeLimitMinutes,
    verifiedAt,
    minutesSinceVerified: minutesSince(verifiedAt),
    freshness: freshness(verifiedAt),
    activeCount: activeCheckIns.length,
  };
}

// Merge base seed curve with user noise reports into a 24-length tier array.
export function buildNoiseHeatmap(baseNoise, noiseReports) {
  const base = Array.isArray(baseNoise) ? baseNoise.slice(0, 24) : new Array(24).fill(0);
  while (base.length < 24) base.push(0);

  // tally reports per hour
  const tally = Array.from({ length: 24 }, () => [0, 0, 0]);
  for (const r of noiseReports) {
    if (r.hourOfDay >= 0 && r.hourOfDay < 24) {
      tally[r.hourOfDay][tierIndex(r.noiseTier)]++;
    }
  }
  return base.map((seed, h) => {
    const counts = tally[h];
    const total = counts[0] + counts[1] + counts[2];
    if (total === 0) return { hour: h, tier: seed, reports: 0 };
    let max = 0;
    let idx = 0;
    counts.forEach((c, i) => {
      if (c > max) {
        max = c;
        idx = i;
      }
    });
    return { hour: h, tier: idx, reports: total };
  });
}