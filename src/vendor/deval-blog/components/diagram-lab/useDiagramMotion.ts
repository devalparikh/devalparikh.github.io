"use client";

import { type RefObject, useEffect, useState } from "react";

export { usePrefersReducedMotion } from "@blog/hooks/usePrefersReducedMotion";

export function useDiagramVisibility<T extends Element>(ref: RefObject<T | null>) {
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    const updatePageVisibility = () => setPageVisible(!document.hidden);
    updatePageVisibility();
    document.addEventListener("visibilitychange", updatePageVisibility);
    return () => document.removeEventListener("visibilitychange", updatePageVisibility);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setInView(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return inView && pageVisible;
}
