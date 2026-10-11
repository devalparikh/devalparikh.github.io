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
  const geometryRef = useRef<{ left: number; width: number } | null>(null);
  const positionRef = useRef<(animate: boolean) => void>(() => {});
  const readyRef = useRef(false);

  const registerItem = useCallback(
    (id: string) => (node: HTMLElement | null) => {
      if (node) itemRefs.current.set(id, node);
      else itemRefs.current.delete(id);
    },
    [],
  );

  const position = useCallback((animate: boolean) => {
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
    const left = targetRect.left - trackRect.left;
    const previous = geometryRef.current;
    if (!previous || Math.abs(previous.left - left) > 0.01 || Math.abs(previous.width - targetRect.width) > 0.01) {
      // First paint and layout corrections snap into place. Only an actual
      // change of target glides from the pill's current on-screen position.
      indicator.dataset.animate = String(animate && readyRef.current && indicator.dataset.visible === "true");
      indicator.style.width = `${targetRect.width}px`;
      indicator.style.transform = `translate3d(${left}px, 0, 0)`;
      geometryRef.current = { left, width: targetRect.width };
    }
    indicator.dataset.visible = "true";
  }, [targetId]);

  useLayoutEffect(() => {
    positionRef.current = position;
    position(true);
  }, [position]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let mounted = true;
    // Let the first paint and overflow-nav measurement settle before allowing
    // movement, including layout effects that change the target on mount.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => { readyRef.current = true; });
    });
    const measure = () => { if (mounted) positionRef.current(false); };
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    // Read the latest target when fonts land, never the hover target captured
    // by an earlier effect. Keep the observer stable during hover changes.
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => {
      mounted = false;
      readyRef.current = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return { trackRef, indicatorRef, registerItem };
}
