"use client";

import { useEffect, useRef, useState } from "react";
import { places } from "./town/places";
import type { mountTown } from "./town/viewport";
import { ExpandIcon } from "./PreviewIcons";
import { StudioPills } from "./StudioPills";

const landmarkPaths = [
  "M10 20l1-15 1-2 1 2 1 15M5 20h14M3 17h5m8 0h5",
  "M3 19h18M4 16v-2c4-6 12-6 16 0v2M8 18a4 4 0 018 0M6 10V6h3v3m6 0V4l2-2 2 2v7",
  "M4 20c3-2 5-2 8 0s6 2 9 0M10 17c2-3 3-7 2-10m0 0c-4-4-7-3-9 1 4-2 7-2 9-1Zm0 0c2-5 6-5 9-2-4-1-6 0-9 2Zm0 0c4-1 6 2 6 5-2-3-4-4-6-5Z",
  "M2 19l7-12 3 5 3-9 8 16H2Zm5-8 2 2 2-2m2-3 2 2 2-2",
  "M5 21c4-5 6-11 7-18 1 7 3 13 7 18M8 15h8M10 10h4M9 21c0-4 6-4 6 0",
];
function Landmark({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={landmarkPaths[index]} />
    </svg>
  );
}
export function StudioHero() {
  const frame = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof mountTown> | null>(null);
  const [place, setPlace] = useState(0),
    [ready, setReady] = useState(false);
  const selected = useRef(0);
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
        if (selected.current) engine.current.select(selected.current);
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
  async function toggle() {
    if (fallback) return setFallback(false);
    if (document.fullscreenElement === frame.current) return document.exitFullscreen();
    try {
      await frame.current!.requestFullscreen();
    } catch {
      setFallback(true);
    }
  }
  function select(i: number) {
    if (selected.current === i) return;
    selected.current = i;
    setPlace(i);
    engine.current?.select(i);
  }
  return (
    <section ref={frame} className="town-hero" data-expanded={full} aria-label="Photography studio">
      {/* Cursor trail parked for the town experiment: <PhotoTrail photos={photos} stickers={stickers} /> */}
      <div className="town-heading">
        <span className="town-kicker">
          <i aria-hidden="true" />
          Photography
        </span>
        <h1>
          Studio <em>Deval</em>
        </h1>
        <div className="town-links">
          <StudioPills />
        </div>
      </div>
      <div className="town-view">
        {!ready && (
          <div
            className="town-poster"
            role="img"
            aria-label={`Miniature scene of ${places[place].detail}`}
            style={
              {
                "--day-poster": `url(/img/town/day-${place}.webp)`,
                "--night-poster": `url(/img/town/night-${place}.webp)`,
              } as React.CSSProperties
            }
          />
        )}
        <canvas
          ref={canvas}
          tabIndex={ready ? 0 : -1}
          aria-hidden={!ready}

          aria-label={`${places[place].detail}. Drag to orbit. Shift-drag to pan, or use arrow keys to rotate. Plus and minus zoom. Home resets the view.`}
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
      <div className="town-caption" aria-live="polite">
        <h2>{places[place].name}</h2>
        <p>{places[place].detail}</p>
      </div>
      {ready && (
        <div className="town-zoom">
          <button className="town-tool" onClick={() => engine.current?.zoom(1 / 1.2)} aria-label="Zoom out">
            −
          </button>
          <button className="town-tool" onClick={() => engine.current?.zoom(1.2)} aria-label="Zoom in">
            +
          </button>
        </div>
      )}
      <div className="town-places" role="group" aria-label="Choose a destination">
        {places.map((item, i) => (
          <button key={item.name} onClick={() => select(i)} aria-pressed={place === i}>
            <Landmark index={i} />
            <span>{item.short}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
