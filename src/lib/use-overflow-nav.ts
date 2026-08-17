"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Splits a horizontal list into the items that fit and the ones that spill into
 * an overflow menu ("priority+" navigation).
 *
 * Item widths are read from a hidden copy of the full list that is never
 * re-laid-out by the split, which keeps measurement stable — measuring the
 * visible row instead would feed its own result back in and oscillate.
 */
export function useOverflowNav(itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const measurer = measureRef.current;
    if (!container || !measurer) return;

    const children = Array.from(measurer.children) as HTMLElement[];
    // The trailing child is the overflow trigger, measured alongside the items
    // so the reserved space is always exact.
    const triggerWidth = children.at(-1)?.offsetWidth ?? 0;
    const itemWidths = children.slice(0, itemCount).map((child) => child.offsetWidth);

    const gap = Number.parseFloat(getComputedStyle(measurer).columnGap) || 0;
    const available = container.clientWidth;

    let used = 0;
    let fits = 0;

    for (const width of itemWidths) {
      const next = used + width + (fits > 0 ? gap : 0);
      if (next > available) break;
      used = next;
      fits += 1;
    }

    if (fits < itemCount) {
      // Make room for the trigger, dropping items until it also fits.
      while (fits > 1 && used + gap + triggerWidth > available) {
        used -= itemWidths[fits - 1] + gap;
        fits -= 1;
      }
    }

    setVisibleCount(Math.max(1, fits));
  }, [itemCount]);

  useLayoutEffect(() => {
    measure();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(measure);
    observer.observe(container);

    // Web fonts land after first paint and change every item's width.
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, measureRef, visibleCount };
}
