import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import MarketingNav from "../components/MarketingNav";
import LiveReadoutCard from "../components/LiveReadoutCard";
import SessionPlannerStrip from "../components/SessionPlannerStrip";
import { ProblemSection, FreshnessBand, HowItWorks, Footer } from "../components/landing/Sections";
import Pricing from "../components/landing/Pricing";
import MagicFeatures from "../components/magic/MagicFeatures";
import MagicCTA from "../components/magic/MagicCTA";
import { useReveal } from "../hooks/useReveal";

const CAMPUSES = ["Ann Arbor", "Berkeley", "Madison", "Austin"];

const FEATURES = [
  {
    title: "Outlet density",
    blurb: "How many seats are actually wired, and how many are free right now — each stamped with the minute it was last verified.",
    meta: "Power",
    icon: <Icon icon="ph:plug" width="24" />,
    animation: "mf-float 6s ease-in-out infinite",
  },
  {
    title: "Laptop policy flag",
    blurb: "Welcome, time-limited, or banned. The policy lives on the venue, so you never arrive to a no-laptops sign.",
    meta: "Policy",
    icon: <Icon icon="ph:laptop" width="24" />,
    animation: "mf-pulse 4s ease-in-out infinite",
  },
  {
    title: "Noise tier by hour",
    blurb: "Silent, ambient, or loud — aggregated from real check-ins across the day so you can plan around the lunch rush.",
    meta: "Sound",
    icon: <Icon icon="ph:waveform" width="24" />,
    animation: "mf-tilt 5.5s ease-in-out infinite",
  },
  {
    title: "Real-time crowding",
    blurb: "Voluntary one-tap check-ins that auto-expire after 90 minutes, so the crowd reading is always current.",
    meta: "Live",
    icon: <Icon icon="ph:users-three" width="24" />,
    animation: "mf-drift 8s ease-in-out infinite",
  },
];

export default function Landing() {
  useReveal([]);
  const navigate = useNavigate();
  const [campus, setCampus] = useState("Ann Arbor");

  return (
    <div className="min-h-[100dvh]">
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="aurora-spill" style={{ width: 520, height: 520, top: -120, right: -80 }} aria-hidden />
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <span className="live-dot" />
              <span className="mono text-xs uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                Campus telemetry · live
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]" style={{ overflowWrap: "anywhere" }}>
              Know your café
              <br />
              <span style={{ color: "var(--brand)" }}>before you leave</span>
              <br />
              the building.
            </h1>
            <p className="mt-6 text-lg leading-relaxed max-w-md" style={{ color: "var(--text-2)" }}>
              Stop gambling twenty minutes on a dead commute. Perch reads outlet density, noise by hour, and the
              laptop policy of every café near your campus &mdash; verified by the person who just sat down.
            </p>
            <div className="mt-8 flex flex-nowrap items-center gap-3">
              <button
                onClick={() => navigate("/map")}
                className="quad-cta group shrink-0"
                aria-label="See cafés near my quad"
              >
                <span className="quad-cta__icon">
                  <Icon icon="ph:map-trifold-fill" width="18" />
                  <span className="quad-cta__ping" aria-hidden />
                </span>
                <span className="quad-cta__label">See cafés near my quad</span>
                <Icon
                  icon="ph:arrow-right"
                  width="16"
                  className="quad-cta__arrow"
                />
              </button>
              <Link to="/register" className="mono-cta shrink-0" aria-label="Create an account">
                <span className="mono-cta__icon">
                  <Icon icon="ph:user-plus" width="18" />
                </span>
                <span>Create an account</span>
                <Icon icon="ph:arrow-up-right" width="16" className="mono-cta__arrow" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex lg:justify-end min-w-0">
            <div className="w-full max-w-sm" style={{ animation: "float 6s ease-in-out infinite" }}>
              <LiveReadoutCard />
            </div>
          </div>
        </div>
      </section>

      <ProblemSection />

      {/* SIGNATURE */}
      <SessionPlannerStrip />

      {/* Features (Magic) */}
      <MagicFeatures features={FEATURES} title="The four signals that decide your session" />

      <FreshnessBand />

      <HowItWorks />

      <Pricing />

      {/* Final CTA with campus chips */}
      <section className="pt-20 md:pt-28">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mono text-xs uppercase tracking-wide mr-1 self-center" style={{ color: "var(--text-2)" }}>
              Pick your campus
            </span>
            {CAMPUSES.map((c) => (
              <button
                key={c}
                onClick={() => setCampus(c)}
                className="pill hover:border-[color:var(--brand)] transition-colors"
                style={campus === c ? { background: "var(--brand-soft)", color: "var(--brand-600)", borderColor: "var(--brand)" } : {}}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <MagicCTA
          heading="Open Perch first. Pack your bag second."
          description={`15 to 30 venues seeded within 1.5 miles of ${campus} — read the building before you commit to the commute.`}
          buttons={{
            primary: { text: "Open my campus map", url: "/map" },
            secondary: { text: "Sign in", url: "/login" },
          }}
        />
      </section>

      <Footer />
    </div>
  );
}
