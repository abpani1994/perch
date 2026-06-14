import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const TIERS = [
  {
    name: "Free",
    sub: "Discovery",
    price: "$0",
    period: "forever",
    desc: "Read the building before you commute. Everything you need to never waste a session.",
    cta: "Start free",
    to: "/register",
    highlighted: false,
    features: [
      ["Full campus café map", true],
      ["Live outlet, noise, and laptop readouts", true],
      ["One-tap check-ins", true],
      ["Real-time alerts on favorites", false],
      ["Saved session presets", false],
    ],
  },
  {
    name: "Pro",
    sub: "For the deadline crowd",
    price: "$4.99",
    period: "per month",
    annual: "or $39 a year · save about 35%",
    desc: "Less than one wasted oat latte a month.",
    cta: "Go Pro",
    to: "/settings",
    highlighted: true,
    features: [
      ["Everything in Free", true],
      ["Real-time alerts when a favorite opens up", true],
      ["Saved session preference presets", true],
      ["Notify toggles per favorite venue", true],
      ["Early access to new campuses", true],
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28" style={{ background: "var(--surface-2)" }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="pill">Pricing</span>
          <h2 className="mt-5 text-2xl md:text-4xl font-semibold tracking-tight">
            Convert the habit into Pro
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
            Free reads the building. Pro pings you the moment your favorite opens up.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="card flex flex-col !p-7"
              style={
                t.highlighted
                  ? { borderColor: "var(--brand)", boxShadow: "0 20px 50px -20px var(--brand-glow)" }
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="mono text-[11px] uppercase tracking-wide" style={{ color: "var(--text-2)" }}>
                    {t.sub}
                  </span>
                  <h3 className="text-xl font-semibold mt-1">{t.name}</h3>
                </div>
                {t.highlighted && (
                  <span className="pill !bg-[color:var(--brand-soft)] !text-[color:var(--brand-600)] !border-[color:var(--brand)]">
                    Most chosen
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight tabular-nums">{t.price}</span>
                <span className="text-sm" style={{ color: "var(--text-2)" }}>{t.period}</span>
              </div>
              {t.annual && (
                <p className="mono text-xs mt-1.5" style={{ color: "var(--brand-600)" }}>{t.annual}</p>
              )}
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{t.desc}</p>

              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map(([text, on]) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm">
                    <Icon
                      icon={on ? "ph:check-circle-fill" : "ph:minus-circle"}
                      width="18"
                      style={{ color: on ? "var(--brand)" : "var(--text-2)", flexShrink: 0, marginTop: 1 }}
                    />
                    <span style={{ color: on ? "var(--text-1)" : "var(--text-2)" }}>{text}</span>
                  </li>
                ))}
              </ul>

              <Link to={t.to} className={`mt-7 w-full ${t.highlighted ? "btn-primary" : "btn-secondary"}`}>
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}