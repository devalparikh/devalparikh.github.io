"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

interface EntryMediaProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  poster?: string;
}

function isVideo(src: string) {
  return VIDEO_EXTENSIONS.some((extension) => src.toLowerCase().endsWith(extension));
}

/**
 * Media is mounted only inside the open drawer. Videos attach their source
 * when visible or explicitly played, keeping large files out of page loads.
 */
export function EntryMedia({ src, alt, width, height, poster }: EntryMediaProps) {
  const className =
    "w-full rounded-lg border border-[var(--rule)] bg-base-200 object-cover";

  if (isVideo(src)) {
    return (
      <DeferredVideo
        src={src} alt={alt} width={width} height={height}
        poster={poster} className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
    />
  );
}

function DeferredVideo({ src, alt, width, height, poster, className }: EntryMediaProps & { className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [requested, setRequested] = useState(false);

  const play = () => {
    const video = ref.current;
    if (!video) return;
    if (!video.hasAttribute("src")) video.src = src;
    setRequested(true);
    void video.play().catch(() => {
      // Native controls remain available when playback is blocked.
    });
  };

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    let visible = false;
    let resume = false;

    const sync = () => {
      if (!visible || document.hidden) {
        if (!video.paused) {
          resume = true;
          video.pause();
        }
        return;
      }
      if (motion.matches || connection?.saveData) return;
      if (!video.hasAttribute("src") || resume) {
        resume = false;
        if (!video.hasAttribute("src")) video.src = src;
        setRequested(true);
        void video.play().catch(() => {
          // The viewer can use the play control.
        });
      }
    };
    const preferenceChanged = () => {
      if (motion.matches || connection?.saveData) {
        video.pause();
        resume = false;
      } else sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      sync();
    }, { threshold: [0, 0.15] });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", preferenceChanged);
    connection?.addEventListener("change", preferenceChanged);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", preferenceChanged);
      connection?.removeEventListener("change", preferenceChanged);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <div className="relative">
      <video
        ref={ref} poster={poster} width={width} height={height} className={className}
        controls={requested} loop muted playsInline preload="none" aria-label={alt}
        style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
      />
      {!requested && (
        <button
          type="button" onClick={play} aria-label={`Play ${alt}`}
          className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-[var(--rule)] bg-base-100 px-4 py-2 text-xs text-base-content shadow-sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3 1.5 10 6l-7 4.5z" />
          </svg>
          Play video
        </button>
      )}
    </div>
  );
}
