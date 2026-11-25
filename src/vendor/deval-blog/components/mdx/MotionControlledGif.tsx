"use client";

import Image from "next/image";
import { useId, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return true;
}

type MotionControlledGifProps = {
  animatedSrc: string;
  posterSrc: string;
  alt: string;
  caption: string;
  sourceHref: string;
  sourceLabel: string;
  width: number;
  height: number;
};

export function MotionControlledGif({
  animatedSrc,
  posterSrc,
  alt,
  caption,
  sourceHref,
  sourceLabel,
  width,
  height,
}: MotionControlledGifProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [manualPlayback, setManualPlayback] = useState<boolean | null>(null);
  const statusId = useId();
  const isPlaying = manualPlayback ?? !prefersReducedMotion;

  const controlLabel = isPlaying ? "Pause rollout animation" : "Play rollout animation";

  return (
    <figure className="not-prose my-10" data-motion-controlled-gif>
      <div className="relative mx-auto w-fit max-w-full">
        <Image
          unoptimized
          src={isPlaying ? animatedSrc : posterSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className="block h-auto max-w-full rounded-2xl border border-base-content/10 bg-black"
        />
        <button
          type="button"
          aria-label={controlLabel}
          aria-pressed={isPlaying}
          aria-describedby={statusId}
          onClick={() => setManualPlayback(!isPlaying)}
          className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/25 bg-black/80 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
      <figcaption className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-base-content/65">
        {caption}{" "}
        <a
          className="font-medium text-base-content underline decoration-primary underline-offset-2"
          href={sourceHref}
        >
          {sourceLabel}
        </a>
        .
      </figcaption>
      <span id={statusId} role="status" className="sr-only">
        Rollout animation {isPlaying ? "playing" : "paused"}.
      </span>
    </figure>
  );
}
