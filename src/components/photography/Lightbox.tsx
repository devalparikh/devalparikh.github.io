"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Portal } from "@/components/primitives/Portal";
import { playInterfaceSound } from "@/lib/interface-sound";
import { formatExifLine, formatTakenAt, type Photo } from "@/lib/photos";

interface LightboxProps {
  photos: Photo[];
  startIndex: number;
  onClose: () => void;
}

const SWIPE_THRESHOLD_PX = 48;

export function Lightbox({ photos, startIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + photos.length) % photos.length);
      playInterfaceSound("tap");
    },
    [photos.length],
  );

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, step]);

  const photo = photos[index];
  const settings = formatExifLine(photo.exif);
  const taken = formatTakenAt(photo.exif);

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={photo.alt}
        className="fixed inset-0 z-[70] flex flex-col bg-base-100/97 backdrop-blur-md"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start === null) return;

          const delta = event.changedTouches[0].clientX - start;
          if (Math.abs(delta) > SWIPE_THRESHOLD_PX) step(delta < 0 ? 1 : -1);
        }}
      >
        <div className="flex shrink-0 items-center justify-between px-5 py-3 sm:px-8">
          <p className="font-mono text-[0.65rem] tabular-nums text-neutral-content">
            {index + 1} / {photos.length}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-xs text-neutral-content transition-colors duration-150 hover:text-primary"
          >
            Close <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-4 sm:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={photo.src}
            alt={photo.alt}
            className="max-h-full max-w-full animate-[revealIn_400ms_var(--ease-out-quint)_both] object-contain"
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            {photo.exif?.camera && (
              <p className="truncate text-xs text-base-content">{photo.exif.camera}</p>
            )}
            {(settings || taken) && (
              <p className="mt-0.5 truncate font-mono text-[0.65rem] text-neutral-content">
                {[settings, taken].filter(Boolean).join("  ·  ")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="grid size-9 place-items-center rounded-lg text-neutral-content transition-colors duration-150 hover:bg-base-200 hover:text-base-content"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="grid size-9 place-items-center rounded-lg text-neutral-content transition-colors duration-150 hover:bg-base-200 hover:text-base-content"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
