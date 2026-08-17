"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Drives the pill that glides between items in a horizontal control.
 *
 * The pill is positioned against the track element, which is also the scroll
 * container's content box, so the maths stays correct while the track is
 * scrolled horizontally on narrow screens.
 */
export function useGlidingIndicator(targetId: string | undefined) {
  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());

  const registerItem = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      if (node) itemRefs.current.set(id, node);
      else itemRefs.current.delete(id);
    },
    [],
  );

  const position = useCallback(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    const target = targetId ? itemRefs.current.get(targetId) : undefined;
    if (!target) {
      indicator.dataset.visible = "false";
      return;
    }

    indicator.style.width = `${target.offsetWidth}px`;
    indicator.style.transform = `translate3d(${target.offsetLeft}px, 0, 0)`;
    indicator.dataset.visible = "true";
  }, [targetId]);

  useLayoutEffect(() => {
    position();

    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(position);
    observer.observe(track);
    return () => observer.disconnect();
  }, [position]);

  /**
   * Centres an item in its own scroller. `scrollIntoView` is deliberately
   * avoided here: it also scrolls ancestors vertically, which would jump the
   * page past the hero when the bar starts below the fold.
   */
  const scrollItemIntoView = useCallback((id: string) => {
    const item = itemRefs.current.get(id);
    const scroller = trackRef.current?.parentElement;
    if (!item || !scroller) return;
    if (scroller.scrollWidth <= scroller.clientWidth) return;

    scroller.scrollTo({
      left: Math.max(0, item.offsetLeft - (scroller.clientWidth - item.offsetWidth) / 2),
      behavior: "auto",
    });
  }, []);

  return { trackRef, indicatorRef, registerItem, scrollItemIntoView };
}
