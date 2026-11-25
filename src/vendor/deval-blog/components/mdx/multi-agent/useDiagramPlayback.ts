import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@blog/hooks/usePrefersReducedMotion";

const renderIntervalMs = 1000 / 24;

export function useDiagramPlayback(stops: readonly number[], durationMs = 16000, loopHoldMs?: number) {
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const progressRef = useRef(1);
  const holdElapsed = useRef(0);
  const lastFrameTime = useRef<number | null>(null);
  const inView = useRef(false);
  const [playback, setPlayback] = useState({ progress: 1, playing: false });
  const [visible, setVisible] = useState(false);
  const subscribePageVisibility = useCallback((onChange: () => void) => {
    const update = () => {
      lastFrameTime.current = null;
      onChange();
    };
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const pageVisible = useSyncExternalStore(
    subscribePageVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
  const running = playback.playing && !reducedMotion && visible && pageVisible;
  const progress = reducedMotion && playback.playing ? 1 : playback.progress;
  const phase = stops.reduce((current, stop, index) => progress >= stop ? index : current, 0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let disposed = false;
    const updateVisibility = (nextVisible: boolean) => {
      if (disposed) return;
      if (inView.current !== nextVisible) lastFrameTime.current = null;
      inView.current = nextVisible;
      setVisible(nextVisible);
      if (nextVisible && !started.current && !reducedMotion) {
        started.current = true;
        progressRef.current = 0;
        holdElapsed.current = 0;
        setPlayback({ progress: 0, playing: true });
      }
    };
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => updateVisibility(true));
      return () => { disposed = true; };
    }
    const observer = new IntersectionObserver(([entry]) => {
      updateVisibility(entry.isIntersecting && entry.intersectionRatio >= 0.25);
    }, { threshold: [0, 0.25] });
    observer.observe(stage);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!reducedMotion || !playback.playing) return;
    let disposed = false;
    queueMicrotask(() => {
      if (disposed) return;
      // Finish an interrupted animation on a useful still. Manual selections
      // made with reduced motion enabled retain their chosen position.
      progressRef.current = 1;
      holdElapsed.current = 0;
      setPlayback({ progress: 1, playing: false });
    });
    return () => { disposed = true; };
  }, [reducedMotion, playback.playing]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let disposed = false;
    let lastPublishedTime: number | null = null;
    lastFrameTime.current = null;
    const tick = (timestamp: number) => {
      if (disposed) return;
      if (!inView.current || document.visibilityState === "hidden") {
        lastFrameTime.current = null;
      } else {
        const previous = lastFrameTime.current;
        lastFrameTime.current = timestamp;
        if (previous === null) {
          lastPublishedTime = timestamp;
        } else {
          const elapsed = Math.max(0, timestamp - previous);
          const duration = Math.max(1, durationMs);
          const previousProgress = progressRef.current;
          let next: number;
          if (loopHoldMs !== undefined) {
            const cycleDuration = duration + Math.max(0, loopHoldMs);
            const cyclePosition = (previousProgress * duration + holdElapsed.current + elapsed) % cycleDuration;
            next = Math.min(1, cyclePosition / duration);
            holdElapsed.current = Math.max(0, cyclePosition - duration);
          } else {
            next = Math.min(1, previousProgress + elapsed / duration);
          }
          progressRef.current = next;
          // Accumulate every frame; only publish expensive SVG renders at 24fps.
          const boundary = (next === 1 && previousProgress < 1) || next < previousProgress;
          if (boundary || lastPublishedTime === null || timestamp - lastPublishedTime >= renderIntervalMs) {
            lastPublishedTime = timestamp;
            const playing = next < 1 || loopHoldMs !== undefined;
            setPlayback((current) => current.progress === next && current.playing === playing
              ? current
              : { progress: next, playing });
          }
        }
      }
      if (progressRef.current < 1 || loopHoldMs !== undefined) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      disposed = true;
      lastFrameTime.current = null;
      window.cancelAnimationFrame(frame);
    };
  }, [durationMs, loopHoldMs, running]);

  function select(next: number) {
    started.current = true;
    const index = Math.max(0, Math.min(stops.length - 1, Math.trunc(next)));
    const selected = stops[index] ?? 1;
    progressRef.current = selected;
    holdElapsed.current = 0;
    lastFrameTime.current = null;
    setPlayback({ progress: selected, playing: false });
  }

  function toggle() {
    if (reducedMotion) return;
    started.current = true;
    const replay = !playback.playing && progressRef.current >= 1;
    const next = replay ? 0 : progressRef.current;
    progressRef.current = next;
    if (replay) holdElapsed.current = 0;
    lastFrameTime.current = null;
    setPlayback({ progress: next, playing: !playback.playing });
  }

  return {
    stageRef,
    phase,
    progress,
    playing: playback.playing && !reducedMotion,
    reducedMotion,
    running,
    select,
    toggle,
  };
}
