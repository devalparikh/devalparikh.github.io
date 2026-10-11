"use client";

import { useEffect, useRef } from "react";
import {
  DEFAULT_OPTIONS,
  dotSize,
  FRAMES_PER_SECOND,
  SPIN,
  SPRITE,
  type HalftoneOptions,
} from "@/lib/halftone";

/**
 * How far outside the viewport the loop keeps running.
 *
 * IntersectionObserver delivery is throttled during fast scrolling, so gating
 * on the exact viewport edge lets the globe come back into view while the loop
 * still believes it is parked - a stale or dropped canvas for a few frames.
 * Resuming early absorbs that latency.
 */
const RESUME_MARGIN = "25%";

/**
 * Renders the rotating globe as a halftone dot field.
 *
 * The source is a sprite sheet of greyscale frames rather than a video: at this
 * dot pitch only luminance is ever read, so 240 frames cost ~366KB and need no
 * video decoding, autoplay permission, or codec fallbacks.
 *
 * Each frame is drawn once into a small sampling canvas - one pixel per dot -
 * and the dots are then filled as a single path, which keeps ~12k of them
 * inside a frame budget.
 *
 * The spin follows the page: scrolling down turns the globe one way, scrolling
 * up turns it back, and a fast scroll briefly speeds it up. See `SPIN`.
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
    // The two reasons to park the loop are tracked apart: either one alone
    // pauses it, and neither may overwrite what the other observed.
    let onScreen = true;
    let tabVisible = !document.hidden;
    let columns = 0;
    let rows = 0;
    // Canvas size in CSS pixels, kept from the last resize. Reading it back
    // from the layout every frame would force a synchronous reflow inside the
    // scroll handler, which is exactly when it hurts most.
    let width = 0;
    let height = 0;
    let ink = "currentColor";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /** Dots take the theme's text colour, so the field flips with the theme. */
    const readInk = () => {
      ink = getComputedStyle(canvas).getPropertyValue("color").trim() || "#000";
    };

    /**
     * Reallocates both canvases for the element's current size.
     *
     * Assigning `width` clears a canvas, so this blanks the globe until the
     * next draw. ResizeObserver fires for sub-pixel churn too - a mobile URL
     * bar collapsing mid-scroll is enough - so the size is compared in device
     * pixels first and unchanged sizes return false rather than blanking.
     */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.round(rect.width * dpr);
      const nextHeight = Math.round(rect.height * dpr);
      if (nextWidth === canvas.width && nextHeight === canvas.height) return false;

      canvas.width = nextWidth;
      canvas.height = nextHeight;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Derived from the backing store rather than the rect, so a clear covers
      // it exactly and leaves no band of the previous frame behind.
      width = nextWidth / dpr;
      height = nextHeight / dpr;

      columns = Math.ceil(width / options.cell);
      rows = Math.ceil(height / options.cell);
      sampler.width = columns;
      sampler.height = rows;
      readInk();
      return true;
    };

    const draw = (frame: number) => {
      if (!ready || columns === 0) return;

      const index = ((frame % SPRITE.frames) + SPRITE.frames) % SPRITE.frames;
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

      context.clearRect(0, 0, width, height);
      context.fillStyle = ink;
      context.fill(path);
    };

    // The spin is integrated continuously as a fractional frame position, so
    // speed can ease up and down smoothly; only whole frames are ever drawn.
    let position = 0;
    let velocity = FRAMES_PER_SECOND;
    let direction = 1;
    let boost = 0;
    let lastScroll = window.scrollY;
    let previous = 0;
    let lastDraw = 0;
    let drawn = 0;

    const tick = (now: number) => {
      frameHandle = requestAnimationFrame(tick);
      // Capped so a tab that was throttled does not lurch forward on return.
      const dt = previous ? Math.min(now - previous, 100) / 1000 : 0;
      previous = now;
      if (!onScreen || !tabVisible) return;

      // Reading scrollY is cheap - it needs no layout - so the loop samples it
      // directly instead of keeping a scroll listener in step with it.
      const scroll = window.scrollY;
      const delta = scroll - lastScroll;
      lastScroll = scroll;
      if (delta !== 0) {
        direction = Math.sign(delta);
        boost = Math.min(SPIN.maxBoost, boost + Math.abs(delta) * SPIN.gain);
      }
      boost *= Math.exp(-SPIN.decay * dt);

      const target = direction * FRAMES_PER_SECOND * (1 + boost);
      velocity += (target - velocity) * (1 - Math.exp(-SPIN.response * dt));
      position += velocity * dt;

      const frame = Math.floor(position);
      if (frame === drawn || now - lastDraw < 1000 / SPIN.maxDrawRate) return;
      drawn = frame;
      lastDraw = now;
      draw(frame);
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
      if (resize()) draw(drawn);
    });
    resizeObserver.observe(canvas);

    // Park the loop whenever the globe is off-screen or the tab is hidden.
    const intersection = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        // Repaint on the spot rather than waiting up to a frame interval: the
        // canvas may have been parked for minutes, and a compositor that
        // dropped its backing store while off-screen hands back a blank one.
        if (onScreen) draw(drawn);
      },
      { rootMargin: RESUME_MARGIN },
    );
    intersection.observe(canvas);

    const onVisibility = () => {
      tabVisible = !document.hidden;
      if (tabVisible && onScreen) draw(drawn);
    };
    document.addEventListener("visibilitychange", onVisibility);

    const themeObserver = new MutationObserver(() => {
      readInk();
      draw(drawn);
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
