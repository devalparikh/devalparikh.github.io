"use client";

import { useEffect, useRef, useState } from "react";
import { studio } from "@/content/studio";
import type { mountTown } from "./town/viewport";
import { TownPoster } from "./town/TownPoster";
import { ExpandIcon } from "./PreviewIcons";

export function StudioHero() {
  const frame = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof mountTown> | null>(null);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false),
    [fallback, setFallback] = useState(false);
  const exitButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let active = true;
    const surface = canvas.current!;
    const lost = (e: Event) => {
      e.preventDefault();
      setReady(false);
      engine.current?.dispose();
      engine.current = null;
    };
    surface.addEventListener("webglcontextlost", lost);
    async function start() {
      try {
        const { mountTown } = await import("./town/viewport");
        if (!active) return;
        engine.current = mountTown(surface);
        setReady(true);
      } catch {
        if (active) setReady(false);
      }
    }
    void start();
    surface.addEventListener("webglcontextrestored", start);
    return () => {
      active = false;
      surface.removeEventListener("webglcontextlost", lost);
      surface.removeEventListener("webglcontextrestored", start);
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    const change = () => setExpanded(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  useEffect(() => {
    if (!fallback) return;
    const hero = frame.current!,
      siblings = [...hero.parentElement!.children].filter(
        (el): el is HTMLElement => el instanceof HTMLElement && el !== hero && !el.inert,
      );
    const overflow = document.body.style.overflow;
    siblings.forEach((el) => (el.inert = true));
    document.body.style.overflow = "hidden";
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFallback(false);
        exitButton.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => {
      siblings.forEach((el) => (el.inert = false));
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", close);
    };
  }, [fallback]);
  const full = expanded || fallback;
  useEffect(() => {
    engine.current?.setExpanded(full);
  }, [full, ready]);
  async function toggle() {
    if (fallback) return setFallback(false);
    if (document.fullscreenElement === frame.current) return document.exitFullscreen();
    try {
      await frame.current!.requestFullscreen();
    } catch {
      setFallback(true);
    }
  }
  return (
    <section ref={frame} className="town-hero" data-expanded={full} aria-label="Photography studio">
      <h1 className="sr-only">{studio.title.join(" ")}</h1>
      <div className="town-view">
        {!ready && <TownPoster expanded={full} />}
        <canvas
          ref={canvas}
          tabIndex={ready ? 0 : -1}
          aria-hidden={!ready}
          aria-label="Explore the illustrated towns. Drag one finger to pan. Pinch to zoom, twist to rotate, or drag two fingers up or down to tilt. With a mouse, drag to orbit or shift-drag to pan. Arrow keys rotate, plus and minus zoom, and Home resets the view."
        />
      </div>
      <button
        ref={exitButton}
        className="town-expand town-tool"
        onClick={toggle}
        aria-label={full ? "Exit full screen" : "Enter full screen"}
        title={full ? "Exit full screen" : "Enter full screen"}
        aria-pressed={full}
      >
        {full ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 9h5V4m6 16v-5h5" />
          </svg>
        ) : (
          <ExpandIcon />
        )}
      </button>
    </section>
  );
}
