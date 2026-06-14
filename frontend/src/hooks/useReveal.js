import { useEffect } from "react";

// Attaches a shared IntersectionObserver that toggles "in-view" on every
// .reveal element. The .reveal class in index.css has a 1.4s failsafe, so a
// missed observer can never leave content hidden.
export function useReveal(deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal:not(.in-view)"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}