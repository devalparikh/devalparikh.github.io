"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Drives the pill that glides between items in a horizontal control.
 *
 * Position is measured as a rect delta against the track rather than with
 * `offsetLeft`, because some items (the overflow menu's trigger) sit inside
 * their own positioned wrapper and so report offsets against that instead.
 * Rect deltas are also unaffected by the track being scrolled.
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
    const track = trackRef.current;
    if (!indicator || !track) return;

    const target = targetId ? itemRefs.current.get(targetId) : undefined;
    if (!target) {
      indicator.dataset.visible = "false";
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    indicator.style.width = `${targetRect.width}px`;
    indicator.style.transform = `translate3d(${targetRect.left - trackRect.left}px, 0, 0)`;
    indicator.dataset.visible = "true";
  }, [targetId]);

  useLayoutEffect(() => {
    position();

    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(position);
    observer.observe(track);

    // Web fonts land after first paint and shift every item.
    document.fonts?.ready.then(position).catch(() => undefined);

    return () => observer.disconnect();
  }, [position]);

  return { trackRef, indicatorRef, registerItem };
}
