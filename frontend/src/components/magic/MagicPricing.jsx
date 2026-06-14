import React from "react";

const cn = (...c) => c.filter(Boolean).join(" ");

const Check = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const Info = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const defaultTiers = [
  {
    name: "Free",
    subtitle: "EXPLORER",
    description: "Perfect for casual coffee lovers discovering nearby cafés.",
    features: [
      { text: "Browse café map", included: true },
      { text: "Save up to 10 favorites", included: true, hasInfo: true },
      { text: "Community reviews", included: true },
      { text: "Real-time busy meter", included: false },
      { text: "Priority support", included: false },
    ],
    buttonText: "Get started",
  },
  {
    name: "$6",
    subtitle: "REGULAR",
    price: "$6",
    period: "/month",
    description: "For everyday explorers who want the full Perch experience.",
    badge: { text: "14 DAY FREE TRIAL" },
    features: [
      { text: "Everything in Explorer", included: true },
      { text: "Unlimited favorites & lists", included: true, hasInfo: true },
      { text: "Real-time busy meter", included: true },
      { text: "Exclusive local perks", included: true },
      { text: "Priority support", included: true },
    ],
    buttonText: "Start free trial",
    highlighted: true,
    footerText: "Need a team plan?",
    footerLink: "See below.",
  },
  {
    name: "Roaster",
    subtitle: "BUSINESS",
    description: "For café owners who want to reach new neighbors.",
    features: [
      { text: "Verified café profile", included: true },
      { text: "Promote events & offers", included: true, hasInfo: true },
      { text: "Customer insights dashboard", included: true },
      { text: "Featured map placement", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    buttonText: "Contact sales",
  },
];

export default function MagicPricing(props) {
  const title = props.title || "Pricing that brews with you";
  const subtitle =
    props.subtitle ||
    "Pick the plan that fits your café-hopping habits. Cancel anytime.";
  const tiers = props.tiers || defaultTiers;

  return (
    <section className="w-full py-20 lg:py-28" style={{ background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <span className="pill inline-flex mb-5">Pricing</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
            {title}
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-stretch max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                "card relative flex flex-col h-full transition-all duration-300 hover-lift",
                tier.highlighted ? "md:-translate-y-2 z-20" : "z-10"
              )}
              style={
                tier.highlighted
                  ? {
                      borderColor: "var(--brand)",
                      boxShadow: "0 20px 50px -12px color-mix(in srgb, var(--brand) 35%, transparent)",
                    }
                  : undefined
              }
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div
                    className="text-xs font-bold px-4 py-1.5 rounded-full text-white whitespace-nowrap"
                    style={{ background: "var(--brand)" }}
                  >
                    {tier.badge.text}
                  </div>
                </div>
              )}

              <div className="text-center pt-10 pb-6">
                <div
                  className="text-xs font-medium uppercase tracking-[0.2em] mb-4"
                  style={{ color: "var(--text-2)" }}
                >
                  {tier.subtitle}
                </div>
                <div className="mb-5">
                  {tier.price ? (
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-light" style={{ color: "var(--text-1)" }}>
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className="text-lg font-light ml-2" style={{ color: "var(--text-2)" }}>
                          {tier.period}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-5xl font-light" style={{ color: "var(--text-1)" }}>
                      {tier.name}
                    </div>
                  )}
                </div>
                <p
                  className="text-base font-light leading-relaxed px-4"
                  style={{ color: "var(--text-2)" }}
                >
                  {tier.description}
                </p>
              </div>

              <div className="flex-1 px-2">
                <h4
                  className="text-xs font-medium uppercase tracking-[0.2em] mb-5"
                  style={{ color: "var(--text-2)" }}
                >
                  Plan highlights
                </h4>
                <ul className="space-y-4">
                  {tier.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check
                          className="h-4 w-4 flex-shrink-0 mt-0.5"
                          style={{ color: "var(--brand)" }}
                        />
                      ) : (
                        <XIcon
                          className="h-4 w-4 flex-shrink-0 mt-0.5"
                          style={{ color: "var(--text-2)" }}
                        />
                      )}
                      <span
                        className="text-sm font-light flex items-center gap-2 leading-relaxed"
                        style={{ color: feature.included ? "var(--text-1)" : "var(--text-2)" }}
                      >
                        {feature.text}
                        {feature.hasInfo && (
                          <Info className="h-3.5 w-3.5 opacity-60" />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-6">
                <button
                  type="button"
                  className={cn("w-full", tier.highlighted ? "btn-primary" : "btn-secondary")}
                >
                  {tier.buttonText}
                </button>
                {tier.footerText && (
                  <div className="text-center mt-5">
                    <p className="text-xs font-light" style={{ color: "var(--text-2)" }}>
                      {tier.footerText}{" "}
                      {tier.footerLink && (
                        <button
                          type="button"
                          className="underline transition-colors"
                          style={{ color: "var(--brand)" }}
                        >
                          {tier.footerLink}
                        </button>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}