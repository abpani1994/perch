import React from "react";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function MagicCTA({
  heading = "Find your next favorite café in the neighborhood.",
  description = "Join thousands of locals using Perch to discover cozy spots, hidden gems, and the perfect pour-over — all within walking distance.",
  buttons = {
    primary: { text: "Get Started", url: "#" },
    secondary: { text: "Learn More", url: "#" },
  },
}) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div
          className="relative flex flex-col items-center overflow-hidden rounded-3xl p-8 text-center md:p-16"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--hairline)",
            borderRadius: "calc(var(--radius) * 1.5)",
          }}
        >
          {/* Telemetry grid backdrop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(circle at 50% 40%, black, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 40%, black, transparent 75%)",
            }}
          />
          {/* Glow accent */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl opacity-30"
            style={{ background: "var(--brand)" }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <span
              className="pill mb-6 inline-flex items-center gap-2"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline)",
                color: "var(--text-2)",
              }}
            >
              <span
                className="inline-block h-2 w-2 animate-pulse rounded-full"
                style={{ background: "var(--brand)" }}
              />
              Live in 120+ neighborhoods
            </span>

            <h3
              className="mb-4 max-w-3xl text-3xl font-semibold tracking-tight md:mb-6 md:text-5xl"
              style={{ color: "var(--text-1)" }}
            >
              {heading}
            </h3>

            <p
              className="mb-8 max-w-2xl text-base md:text-lg"
              style={{ color: "var(--text-2)" }}
            >
              {description}
            </p>

            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              {buttons.primary && (
                <a
                  href={buttons.primary.url}
                  className={cn(
                    "btn-primary hover-lift inline-flex items-center justify-center gap-2 transition-transform"
                  )}
                >
                  {buttons.primary.text}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              )}
              {buttons.secondary && (
                <a
                  href={buttons.secondary.url}
                  className="btn-secondary inline-flex items-center justify-center gap-2 transition-colors"
                >
                  {buttons.secondary.text}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}