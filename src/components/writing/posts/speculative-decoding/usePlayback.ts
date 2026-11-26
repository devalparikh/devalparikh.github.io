"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

const noopSubscribe = () => () => {};

/** False during the server render and hydration, true afterwards. */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** Publish at most this often; the clock itself runs every frame. */
const FRAME_MS = 1000 / 30;

/**
 * One scene clock per figure. `progress` runs 0 to 1 over `durationMs`, holds
 * the last frame for `holdMs`, then loops.
 *
 * - The server render and reduced motion show the final still.
 * - With motion allowed the clock waits on the first frame until most of the
 *   figure is on screen, so the reader sees the round from its start.
 * - Offscreen and in a hidden tab the clock stops and later resumes where it
 *   was, without jumping ahead.
 * - `select(i)` pauses on stop i; `toggle()` pauses, resumes or replays.
 */
export function usePlayback(stops: readonly number[], durationMs: number, holdMs = 2400) {
  const reducedMotion = usePrefersReducedMotion();
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const [clockProgress, setClockProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  /** Set once the reader picks a stop, so reduced motion can leave the final still. */
  const [picked, setPicked] = useState(false);
  const clock = useRef({ elapsed: 0, visible: false, started: false });

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clock.current.visible = entry.isIntersecting;
        const enough = Math.min(entry.boundingClientRect.height, window.innerHeight) * 0.6;
        if (!clock.current.started && entry.intersectionRect.height >= enough) {
          clock.current.started = true;
          setPlaying(true);
        }
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    let frame = 0;
    let last = performance.now();
    let published = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const state = clock.current;
      if (state.visible && !document.hidden) {
        state.elapsed += dt;
        if (state.elapsed >= durationMs + holdMs) state.elapsed = 0;
        if (now - published >= FRAME_MS) {
          published = now;
          setClockProgress(Math.min(state.elapsed / durationMs, 1));
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, reducedMotion, durationMs, holdMs]);

  const select = useCallback(
    (index: number) => {
      const value = stops[index] ?? 1;
      clock.current.started = true;
      clock.current.elapsed = value * durationMs;
      setPlaying(false);
      setPicked(true);
      setClockProgress(value);
    },
    [stops, durationMs],
  );

  const toggle = useCallback(() => {
    clock.current.started = true;
    if (playing) {
      setPlaying(false);
      return;
    }
    if (clock.current.elapsed >= durationMs) {
      clock.current.elapsed = 0;
      setClockProgress(0);
    }
    setPlaying(true);
  }, [playing, durationMs]);

  /** Start the round again from its first frame (used when the example changes). */
  const restart = useCallback(() => {
    if (reducedMotion) return;
    clock.current.started = true;
    clock.current.elapsed = 0;
    setClockProgress(0);
    setPlaying(true);
  }, [reducedMotion]);

  const progress = !hydrated ? 1 : reducedMotion ? (picked ? clockProgress : 1) : clockProgress;
  // Each stop ends a stage, so the current stage is the first stop not yet passed.
  let phase = stops.length - 1;
  for (let index = stops.length - 1; index >= 0; index--) if (progress <= stops[index] + 1e-6) phase = index;

  return { ref, progress, playing: playing && !reducedMotion, phase, select, toggle, restart, reducedMotion };
}

/** 0 before `start`, 1 after `end`, linear between. */
export function fraction(progress: number, start: number, end: number) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}
