import React, { useEffect, useRef, useState } from "react";

const cn = (...c) => c.filter(Boolean).join(" ");

function IconAperture() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="10" />
      <path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
      <path d="M9 3v15M15 6v15" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconActivity() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function MagicFeatures(props) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "magic-features-anim";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes mf-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6%)} }
      @keyframes mf-pulse { 0%,100%{transform:scale(1);opacity:.85} 50%{transform:scale(1.08);opacity:1} }
      @keyframes mf-tilt { 0%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} 100%{transform:rotate(-2deg)} }
      @keyframes mf-drift { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(6%,-6%,0)} }
      @keyframes mf-glow { 0%,100%{opacity:.7} 50%{opacity:1} }
      @keyframes mf-intro { 0%{opacity:0;transform:translate3d(0,28px,0)} 100%{opacity:1;transform:translate3d(0,0,0)} }
      @keyframes mf-card { 0%{opacity:0;transform:translate3d(0,18px,0) scale(.96)} 100%{opacity:1;transform:translate3d(0,0,0) scale(1)} }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") return;
    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const features = props.features || [
    {
      title: "Live Café Map",
      blurb: "See open cafés near you in real time, with walking distance, vibe tags, and live seat availability.",
      meta: "Discover",
      icon: <IconMap />,
      animation: "mf-float 6s ease-in-out infinite",
      seed: "perch-map",
      desc: "stylized neighborhood map dotted with café pins",
    },
    {
      title: "Curated Reviews",
      blurb: "Honest signal from real neighbors — espresso quality, wifi, seating, and the all-important laptop policy.",
      meta: "Trust",
      icon: <IconStar />,
      animation: "mf-pulse 4s ease-in-out infinite",
      seed: "perch-reviews",
      desc: "cozy café interior with a latte on a wooden table",
    },
    {
      title: "Vibe Match",
      blurb: "Tell Perch your mood and we surface the spot that fits — quiet focus, buzzy energy, or sunny patio.",
      meta: "Match",
      icon: <IconAperture />,
      animation: "mf-tilt 5.5s ease-in-out infinite",
      seed: "perch-vibe",
      desc: "warm sunlit café corner with plants",
    },
    {
      title: "Live Crowd Pulse",
      blurb: "Real-time crowd levels so you always know whether to grab a table or order ahead for pickup.",
      meta: "Pulse",
      icon: <IconActivity />,
      animation: "mf-drift 8s ease-in-out infinite",
      seed: "perch-pulse",
      desc: "busy café counter scene with baristas",
    },
    {
      title: "Local Community",
      blurb: "Follow neighbors, save favorite haunts, and build a shared map of the best corners in your city.",
      meta: "Connect",
      icon: <IconUsers />,
      animation: "mf-glow 7s ease-in-out infinite",
      seed: "perch-community",
      desc: "friends chatting over coffee at a café",
    },
  ];

  const spans = [
    "md:col-span-4 md:row-span-2",
    "md:col-span-2 md:row-span-1",
    "md:col-span-2 md:row-span-1",
    "md:col-span-3 md:row-span-1",
    "md:col-span-3 md:row-span-1",
  ];

  return (
    <div
      className="relative w-full"
      style={{ background: "var(--surface)", color: "var(--text-1)" }}
    >
      <div className="absolute inset-0 -z-30 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 12% 0%, color-mix(in srgb, var(--brand) 10%, transparent), transparent 65%), radial-gradient(ellipse 40% 80% at 88% 0%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%), var(--surface)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--hairline) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(circle at center, black 0%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 0%, transparent 80%)",
            opacity: 0.5,
          }}
        />
      </div>

      <section
        ref={sectionRef}
        className={cn(
          "relative mx-auto max-w-6xl px-6 py-20 motion-safe:opacity-0",
          visible && "motion-safe:animate-[mf-intro_0.9s_ease-out_forwards]"
        )}
      >
        <header
          className="mb-10 flex flex-col gap-6 border-b pb-6 md:flex-row md:items-end md:justify-between"
          style={{ borderColor: "var(--hairline)" }}
        >
          <div className="flex flex-col gap-3">
            <span
              className="pill w-fit text-xs uppercase tracking-[0.3em]"
              style={{ color: "var(--brand)" }}
            >
              Why Perch
            </span>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Find your <span className="text-gradient">perfect perch</span>
            </h2>
          </div>
          <p
            className="max-w-sm text-sm md:text-base"
            style={{ color: "var(--text-2)" }}
          >
            Real-time café intelligence for your neighborhood — built on live
            signals, honest reviews, and a community that knows the good spots.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 md:auto-rows-[minmax(140px,auto)] md:grid-cols-6">
          {features.map((feature, index) => (
            <BentoItem
              key={feature.title}
              span={spans[index] || "md:col-span-2"}
              feature={feature}
              index={index}
              isVisible={visible}
            />
          ))}
        </div>

        <footer
          className="mt-14 border-t pt-6 text-xs uppercase tracking-[0.2em]"
          style={{ borderColor: "var(--hairline)", color: "var(--text-2)" }}
        >
          Discover. Sip. Belong. — Perch
        </footer>
      </section>
    </div>
  );
}

function BentoItem(props) {
  const { feature, span = "", index = 0, isVisible = false } = props;
  const animationDelay = `${Math.max(index * 0.12, 0)}s`;
  const hasImage = !!feature.seed;

  return (
    <article
      className={cn(
        "group card relative flex h-full flex-col justify-between overflow-hidden p-5 transition-transform duration-300 ease-out hover:-translate-y-1 motion-safe:opacity-0",
        isVisible && "motion-safe:animate-[mf-card_0.8s_ease-out_forwards]",
        span
      )}
      style={{ animationDelay }}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 12% 0%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 72%)",
          }}
        />
      </div>

      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
          style={{
            borderColor: "var(--hairline)",
            background: "var(--surface)",
            color: "var(--brand)",
          }}
        >
          <span style={{ animation: feature.animation, display: "inline-flex" }}>
            {feature.icon}
          </span>
        </div>
        <div className="flex-1">
          <header className="flex items-start gap-3">
            <h3 className="text-base font-semibold tracking-wide">
              {feature.title}
            </h3>
            {feature.meta && (
              <span
                className="ml-auto rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.25em]"
                style={{ borderColor: "var(--hairline)", color: "var(--text-2)" }}
              >
                {feature.meta}
              </span>
            )}
          </header>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            {feature.blurb}
          </p>
        </div>
      </div>

      {hasImage && index === 0 && (
        <div
          className="mt-5 w-full overflow-hidden border"
          style={{ aspectRatio: "16 / 9", borderRadius: "var(--radius)", borderColor: "var(--hairline)" }}
        >
          <img
            data-godmode-img
            data-desc={feature.desc}
            alt={feature.desc}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={`https://picsum.photos/seed/${feature.seed}/1200/900`}
          />
        </div>
      )}
    </article>
  );
}