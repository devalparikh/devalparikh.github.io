"use client";

import { useEffect, useRef } from "react";
import type { Sticker } from "@/content/studio";
import type { Photo } from "@/lib/photos";

/** How far the pointer travels between one polaroid and the next, in px. */
const SPAWN_DISTANCE = 110;
/** On touch screens, where there is no hover, the trail plays on its own. */
const AUTOPLAY_INTERVAL_MS = 720;
const LIFETIME_MS = 1500;
const MAX_TILT_DEG = 9;

type TrailItem =
  | { kind: "photo"; key: string; src: string }
  | { kind: "sticker"; key: string; src: string; alt: string; width: number; height: number };

/**
 * Photographs and stickers alternate, so cut-outs added later are spread
 * through the trail rather than bunched at its end.
 */
function interleave(photos: Photo[], stickers: Sticker[]): TrailItem[] {
  const items: TrailItem[] = [];
  const longest = Math.max(photos.length, stickers.length);

  for (let i = 0; i < longest; i += 1) {
    const photo = photos[i];
    if (photo) items.push({ kind: "photo", key: photo.id, src: photo.thumb });
    const sticker = stickers[i];
    if (sticker) items.push({ kind: "sticker", key: sticker.src, ...sticker });
  }
  return items;
}

/**
 * The hero's cursor trail. Every `SPAWN_DISTANCE` of pointer travel, the next
 * item pops up under the cursor at a slight tilt, holds, and falls away -
 * cycling through the photographs as small polaroids.
 *
 * One element per item, reused in turn, and animated with the Web Animations
 * API: nothing re-renders while the pointer moves. The items sit in the DOM
 * from the start, so their thumbnails are already loaded by the first lap.
 */
export function PhotoTrail({ photos, stickers }: { photos: Photo[]; stickers: Sticker[] }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const items = interleave(photos, stickers);

  useEffect(() => {
    const layer = layerRef.current;
    const hero = layer?.parentElement;
    if (!layer || !hero) return;

    const nodes = Array.from(layer.children) as HTMLElement[];
    if (nodes.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let next = 0;
    // Newest on top, however the reuse order falls.
    let depth = 1;

    const spawn = (x: number, y: number) => {
      const node = nodes[next];
      next = (next + 1) % nodes.length;

      const tilt = (Math.random() * 2 - 1) * MAX_TILT_DEG;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.zIndex = String((depth += 1));

      node.getAnimations().forEach((animation) => animation.cancel());
      node.animate(
        [
          { opacity: 0, transform: `translate(-50%, -50%) rotate(${tilt * 0.4}deg) scale(0.5)` },
          {
            opacity: 1,
            transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`,
            offset: 0.14,
            easing: "linear",
          },
          {
            opacity: 1,
            transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(1)`,
            offset: 0.62,
            easing: "cubic-bezier(0.55, 0, 1, 0.45)",
          },
          {
            opacity: 0,
            transform: `translate(-50%, -38%) rotate(${tilt * 1.6}deg) scale(0.82)`,
          },
        ],
        { duration: LIFETIME_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
      );
    };

    // Hover devices: follow the pointer.
    let lastX: number | null = null;
    let lastY = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (lastX === null) {
        lastX = x;
        lastY = y;
        return;
      }
      if (Math.hypot(x - lastX, y - lastY) < SPAWN_DISTANCE) return;
      lastX = x;
      lastY = y;
      spawn(x, y);
    };

    const onPointerLeave = () => {
      lastX = null;
    };

    hero.addEventListener("pointermove", onPointerMove);
    hero.addEventListener("pointerleave", onPointerLeave);

    // Touch devices: play on a timer while the hero is in view.
    let timer = 0;
    let inView = true;
    const canHover = window.matchMedia("(hover: hover)");

    const autoplay = () => {
      if (!inView || document.hidden || canHover.matches) return;
      const { width, height } = hero.getBoundingClientRect();
      spawn(width * (0.15 + Math.random() * 0.7), height * (0.18 + Math.random() * 0.6));
    };
    timer = window.setInterval(autoplay, AUTOPLAY_INTERVAL_MS);

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    observer.observe(hero);

    return () => {
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={layerRef} className="trail-layer" aria-hidden="true">
      {items.map((item) =>
        item.kind === "photo" ? (
          <figure key={item.key} className="trail-polaroid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt="" decoding="async" draggable={false} />
          </figure>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={item.key}
            src={item.src}
            alt=""
            width={item.width}
            height={item.height}
            decoding="async"
            draggable={false}
            className="trail-sticker"
          />
        ),
      )}
    </div>
  );
}
