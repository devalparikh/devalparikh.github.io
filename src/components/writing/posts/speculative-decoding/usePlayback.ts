"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
/** Must match the breakpoint in figures.css that swaps the wide and narrow drawings. */
const COMPACT = "(max-width: 639px)";

function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const usePrefersReducedMotion = () => useMedia(REDUCED);
export const useCompactLayout = () => useMedia(COMPACT);

const FRAME_MS = 1000 / 30;
const MAX_STEP_MS = 80;
/** Share of the drawing that must be on screen before the loop starts or resumes. */
export const START_SHARE = 0.75;
/** Once playing, the loop keeps going until less than this share is on screen. */
export const STOP_SHARE = 0.25;

/** How much of the drawing a reader can see, 0 to 1; a drawing taller than the screen counts as full when it fills it. */
export function visibleShare(entry: Pick<IntersectionObserverEntry, "isIntersecting" | "intersectionRect" | "boundingClientRect">, viewportHeight: number) {
  if (!entry.isIntersecting) return 0;
  const room = Math.min(entry.boundingClientRect.height, viewportHeight);
  return room > 0 ? Math.min(1, entry.intersectionRect.height / room) : 0;
}

export const nextOnScreen = (was: boolean, share: number) => (was ? share >= STOP_SHARE : share >= START_SHARE);

const THRESHOLDS = Array.from({ length: 21 }, (_, index) => index / 20);

interface Frame {
  t: number;
  /** True when a reader picked this frame. */
  picked: boolean;
}

/**
 * One looping clock per figure. Everything in the drawing reads the same
 * normalised time, so pausing freezes it all together.
 *
 * The clock waits on its first frame until most of the drawing is on screen,
 * so the loop is seen from its start, and it only runs while the figure is on
 * screen and the tab is visible. The server render and reduced motion show
 * `stillT`. A frame the reader picked with `seek` stays either way.
 */
export function useSceneClock(durationMs: number, stillT: number) {
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  const [frame, setFrame] = useState<Frame>({ t: 0, picked: false });
  const [wantsPlay, setWantsPlay] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setHydrated(true);
      setOnScreen((was) => nextOnScreen(was, visibleShare(entry, window.innerHeight)));
    }, { threshold: THRESHOLDS });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const running = wantsPlay && onScreen && !reducedMotion;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let sincePublish = FRAME_MS;
    const tick = (now: number) => {
      const elapsed = Math.min(now - last, MAX_STEP_MS);
      last = now;
      if (document.visibilityState === "visible") {
        position.current = (position.current + elapsed / durationMs) % 1;
        sincePublish += elapsed;
        if (sincePublish >= FRAME_MS) {
          sincePublish = 0;
          setFrame({ t: position.current, picked: false });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, durationMs]);

  const seek = useCallback((t: number) => {
    position.current = t;
    setFrame({ t, picked: true });
    setWantsPlay(false);
  }, []);

  const toggle = useCallback(() => setWantsPlay((value) => !value), []);

  /** Start again from the first frame, e.g. when the example changes. */
  const restart = useCallback(() => {
    position.current = 0;
    setFrame({ t: 0, picked: false });
    setWantsPlay(true);
  }, []);

  // Before the observer has reported (the server render, no JS) and with
  // reduced motion, show the still unless the reader picked a frame.
  const resting = !frame.picked && (!hydrated || reducedMotion);

  return {
    stageRef,
    t: resting ? stillT : frame.t,
    playing: wantsPlay && !reducedMotion,
    reducedMotion,
    seek,
    toggle,
    restart,
  };
}
