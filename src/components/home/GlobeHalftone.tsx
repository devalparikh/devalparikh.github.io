"use client";

import { useEffect, useRef } from "react";
import {
  DEFAULT_OPTIONS,
  dotSize,
  FRAMES_PER_SECOND,
  SPRITE,
  type HalftoneOptions,
} from "@/lib/halftone";

/**
 * Renders the rotating globe as a halftone dot field.
 *
 * The source is a sprite sheet of greyscale frames rather than a video: at this
 * dot pitch only luminance is ever read, so 120 frames cost ~180KB and need no
 * video decoding, autoplay permission, or codec fallbacks.
 *
 * Each frame is drawn once into a small sampling canvas - one pixel per dot -
 * and the dots are then filled as a single path, which keeps ~10k of them
 * inside a frame budget.
 */
export function GlobeHalftone({
  className,
  options = DEFAULT_OPTIONS,
}: {
  className?: string;
  options?: HalftoneOptions;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const sampler = document.createElement("canvas");
    const samplerContext = sampler.getContext("2d", { willReadFrequently: true });
    if (!samplerContext) return;

    const sprite = new Image();
    sprite.decoding = "async";

    let frameHandle = 0;
    let ready = false;
    let visible = true;
    let columns = 0;
    let rows = 0;
    let ink = "currentColor";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /** Dots take the theme's text colour, so the field flips with the theme. */
    const readInk = () => {
      ink = getComputedStyle(canvas).getPropertyValue("color").trim() || "#000";
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      columns = Math.ceil(rect.width / options.cell);
      rows = Math.ceil(rect.height / options.cell);
      sampler.width = columns;
      sampler.height = rows;
      readInk();
    };

    const draw = (frame: number) => {
      const rect = canvas.getBoundingClientRect();
      if (!ready || columns === 0) return;

      const index = frame % SPRITE.frames;
      const sx = (index % SPRITE.columns) * SPRITE.frame;
      const sy = Math.floor(index / SPRITE.columns) * SPRITE.frame;

      // One sample per dot: the browser's own downscale does the averaging.
      samplerContext.clearRect(0, 0, columns, rows);
      samplerContext.drawImage(
        sprite,
        sx, sy, SPRITE.frame, SPRITE.frame,
        0, 0, columns, rows,
      );

      const { data } = samplerContext.getImageData(0, 0, columns, rows);
      const path = new Path2D();

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const offset = (row * columns + column) * 4;
          // The sheet is greyscale, so any channel is the luminance.
          const size = dotSize(data[offset] / 255, options);
          if (size <= 0.35) continue;

          const inset = (options.cell - size) / 2;
          path.rect(
            column * options.cell + inset,
            row * options.cell + inset,
            size,
            size,
          );
        }
      }

      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = ink;
      context.fill(path);
    };

    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      frameHandle = requestAnimationFrame(tick);
      if (!visible) return;

      if (now - last < 1000 / FRAMES_PER_SECOND) return;
      last = now;

      draw(frame);
      frame += 1;
    };

    const start = () => {
      if (reduceMotion.matches) {
        draw(0);
        return;
      }
      frameHandle = requestAnimationFrame(tick);
    };

    sprite.onload = () => {
      ready = true;
      resize();
      start();
    };
    sprite.src = SPRITE.src;

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(frame);
    });
    resizeObserver.observe(canvas);

    // Stop the loop whenever the globe is off-screen or the tab is hidden.
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(canvas);

    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const themeObserver = new MutationObserver(() => {
      readInk();
      draw(frame);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelAnimationFrame(frameHandle);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [options]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
