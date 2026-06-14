import prisma from "../config/db.js";

// Build a plausible 24-hour noise seed (0=silent,1=ambient,2=loud) for a venue.
function noiseCurve(profile) {
  // profile shifts the busy window
  const curve = [];
  for (let h = 0; h < 24; h++) {
    let tier = 0; // silent
    if (h >= 7 && h < 10) tier = profile === "morning" ? 2 : 1;
    else if (h >= 10 && h < 12) tier = 1;
    else if (h >= 12 && h < 14) tier = 2; // lunch rush
    else if (h >= 14 && h < 17) tier = profile === "quiet" ? 0 : 1;
    else if (h >= 17 && h < 20) tier = profile === "evening" ? 2 : 1;
    else if (h >= 20 || h < 6) tier = 0;
    curve.push(tier);
  }
  return curve;
}

const CAMPUSES = [
  { name: "Ann Arbor", slug: "ann-arbor", lat: 42.278, lng: -83.738 },
  { name: "Berkeley", slug: "berkeley", lat: 37.8719, lng: -122.2585 },
  { name: "Madison", slug: "madison", lat: 43.0766, lng: -89.4125 },
  { name: "Austin", slug: "austin", lat: 30.2849, lng: -97.7341 },
];

const VENUE_NAMES = [
  ["Mighty Good Coffee", "morning", "welcome"],
  ["Comet Coffee", "quiet", "limited"],
  ["RoosRoast Liberty", "evening", "welcome"],
  ["Sweetwaters Kerrytown", "quiet", "welcome"],
  ["Lab Café", "morning", "banned"],
  ["Hatcher Commons", "quiet", "welcome"],
  ["Argus Bakery", "evening", "limited"],
  ["Drip House", "morning", "welcome"],
  ["Marginal Notes", "quiet", "welcome"],
  ["Press Room", "evening", "limited"],
  ["Quad Roasters", "morning", "welcome"],
  ["Footnote Espresso", "quiet", "banned"],
  ["The Annotated Bean", "evening", "welcome"],
  ["Stacks Coffee", "quiet", "welcome"],
  ["Carrel & Co.", "morning", "limited"],
  ["Thesis Brews", "evening", "welcome"],
  ["Office Hours Café", "quiet", "welcome"],
  ["Defense Day Roasters", "morning", "limited"],
];

function jitter(base, amount) {
  return base + (Math.random() - 0.5) * amount;
}

async function main() {
  const existing = await prisma.campus.count();
  if (existing > 0) {
    console.log("Seed: campuses already present, skipping.");
    return;
  }

  for (const c of CAMPUSES) {
    const campus = await prisma.campus.create({ data: c });
    const count = 16 + Math.floor(Math.random() * 8); // 16-23 venues
    for (let i = 0; i < count; i++) {
      const [name, profile, policy] = VENUE_NAMES[i % VENUE_NAMES.length];
      const suffix = i >= VENUE_NAMES.length ? ` ${Math.floor(i / VENUE_NAMES.length) + 1}` : "";
      await prisma.venue.create({
        data: {
          campusId: campus.id,
          name: name + suffix,
          address: `${100 + i} Campus Ave, ${c.name}`,
          lat: jitter(c.lat, 0.02),
          lng: jitter(c.lng, 0.02),
          laptopPolicy: policy,
          timeLimitMinutes: policy === "limited" ? [60, 90, 120][i % 3] : null,
          outletCount: Math.floor(Math.random() * 14),
          lastVerifiedAt: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 3600_000) : null,
          baseNoise: noiseCurve(profile),
        },
      });
    }
    console.log(`Seed: ${c.name} -> ${count} venues`);
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());