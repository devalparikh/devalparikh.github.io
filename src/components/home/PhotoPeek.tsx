"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import clsx from "clsx";
import { Reveal } from "@/components/primitives/Reveal";
import { formatExifLine, type Photo } from "@/lib/photos";
import { playInterfaceSound } from "@/lib/interface-sound";

interface PhotoPeekProps {
  photos: Photo[];
  /** How many photographs the full page holds, for the "All n" link. */
  total: number;
}

/**
 * A sneak peek of the photography page, framed as a macOS Preview window: the
 * thumbnail sidebar picks the photo, the title bar reads out its file name and
 * camera settings, and the photo itself opens the full gallery.
 *
 * On narrow screens the sidebar turns into a filmstrip under the photo, the
 * way Preview's own thumbnails would have to on a phone.
 */
export function PhotoPeek({ photos, total }: PhotoPeekProps) {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const warmed = useRef(new Set<string>());

  if (photos.length === 0) return null;
  const photo = photos[active];
  const settings = formatExifLine(photo.exif);

  const select = (index: number) => {
    if (index === active) return;
    setActive(index);
    playInterfaceSound("tap");
  };

  /** Starts fetching the full-size file the moment a thumbnail is pointed at. */
  const warm = (target: Photo) => {
    if (warmed.current.has(target.src)) return;
    warmed.current.add(target.src);
    new Image().src = target.src;
  };

  // Arrow keys walk the sidebar like a real tab list.
  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (active + step + photos.length) % photos.length;
    select(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <Reveal onScroll as="section" className="mt-16">
      <div className="mb-4 flex items-baseline justify-between gap-6">
        <h2 className="display text-xl sm:text-2xl">Photography</h2>
        <Link
          href="/photography"
          onClick={() => playInterfaceSound("tap")}
          className="shrink-0 text-xs text-neutral-content transition-colors duration-150 hover:text-primary"
        >
          All {total} <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="preview-window">
        <div className="preview-titlebar">
          <span className="preview-lights" aria-hidden="true">
            <i data-light="close" />
            <i data-light="minimize" />
            <i data-light="zoom" />
          </span>

          <SidebarIcon className="preview-tool hidden sm:block" />

          <div className="preview-title">
            <span className="preview-filename">{photo.alt}.webp</span>
            <span className="preview-subtitle">
              {settings || `${photo.width} × ${photo.height}`}
            </span>
          </div>

          <span className="preview-tools" aria-hidden="true">
            <InfoIcon className="preview-tool hidden sm:block" />
            <ZoomIcon className="preview-tool hidden sm:block" sign="minus" />
            <ZoomIcon className="preview-tool" sign="plus" />
            <ShareIcon className="preview-tool" />
          </span>
        </div>

        <div className="preview-body">
          <div
            role="tablist"
            aria-label="Photographs"
            aria-orientation="vertical"
            className="preview-sidebar"
            onKeyDown={onKeyDown}
          >
            {photos.map((item, index) => (
              <button
                key={item.id}
                ref={(node) => {
                  tabsRef.current[index] = node;
                }}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={item.alt}
                tabIndex={index === active ? 0 : -1}
                onClick={() => select(index)}
                onPointerEnter={() => warm(item)}
                onFocus={() => warm(item)}
                className="preview-thumb"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumb}
                  alt=""
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  decoding="async"
                  style={{ aspectRatio: `${item.width} / ${item.height}` }}
                />
                <span className="preview-thumb-index">{index + 1}</span>
              </button>
            ))}
          </div>

          <Link
            href="/photography"
            role="tabpanel"
            aria-label={`${photo.alt} - open the photography page`}
            onClick={() => playInterfaceSound("tap")}
            className="preview-stage"
          >
            <span
              className="preview-photo"
              style={{
                aspectRatio: `${photo.width} / ${photo.height}`,
                backgroundImage: `url(${photo.placeholder})`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={photo.id}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                ref={(node) => {
                  // A cached file can finish before React attaches onLoad.
                  if (node?.complete && !loaded[photo.id]) {
                    setLoaded((state) => ({ ...state, [photo.id]: true }));
                  }
                }}
                onLoad={() => setLoaded((state) => ({ ...state, [photo.id]: true }))}
                className={clsx(loaded[photo.id] ? "opacity-100" : "opacity-0")}
              />
            </span>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function SidebarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M9 5v14M5.5 8.5h1.5M5.5 11h1.5" />
    </svg>
  );
}

function InfoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function ZoomIcon({ className, sign }: IconProps & { sign: "plus" | "minus" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...stroke}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4.5 4.5M8 10.5h5" />
      {sign === "plus" && <path d="M10.5 8v5" />}
    </svg>
  );
}

function ShareIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...stroke}>
      <path d="M8.5 9H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.5" />
      <path d="M12 14V3.5M8.5 7 12 3.5 15.5 7" />
    </svg>
  );
}
