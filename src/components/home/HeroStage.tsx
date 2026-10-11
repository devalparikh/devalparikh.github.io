"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Publishes how far the hero has scrolled away as `--hero-progress`, 0 at the
 * top of the page and 1 once a full viewport has passed. CSS does the rest:
 * the globe settles into the background and the name's lines drift apart.
 *
 * The property is set on this wrapper rather than on the root so a scroll only
 * restyles the hero and the globe, not the whole document. The wrapper is
 * `display: contents`, so it adds no box and no stacking context - the globe
 * inside it can still sit behind everything on the page.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let written = -1;
    // Cached on resize: reading it inside the scroll handler would force a
    // layout on every frame of a scroll.
    let travel = window.innerHeight;

    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / travel));
      // Rounded so the long tail of a settled scroll does not keep writing.
      const rounded = Math.round(progress * 1000) / 1000;
      if (rounded === written) return;
      written = rounded;
      element.style.setProperty("--hero-progress", String(rounded));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      travel = Math.max(1, window.innerHeight);
      schedule();
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
