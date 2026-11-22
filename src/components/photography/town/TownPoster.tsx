"use client";

import { useEffect, useRef } from "react";

// The printed overview also works on devices that cannot allocate a WebGL context.
export function TownPoster({ expanded }: { expanded: boolean }) {
  const surface = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!expanded || !surface.current) return;
    const el = surface.current;
    const paper = el.firstElementChild as HTMLElement;
    const contacts = new Map<number, { x: number; y: number }>();
    let scale = 1,
      x = 0,
      y = 0;
    function draw() {
      const limit = (offset: number, sheet: number, viewport: number) => {
        const edge = Math.max(0, (sheet * scale - viewport) / 2);
        return Math.max(-edge, Math.min(edge, offset));
      };
      x = limit(x, paper.clientWidth, el.clientWidth);
      y = limit(y, paper.clientHeight, el.clientHeight);
      paper.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }
    function zoom(factor: number, px = 0, py = 0) {
      const next = Math.min(12, Math.max(1, scale * factor));
      x = px + ((x - px) * next) / scale;
      y = py + ((y - py) * next) / scale;
      scale = next;
    }
    function wheel(e: WheelEvent) {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoom(
        Math.exp(-Math.max(-600, Math.min(600, e.deltaY)) * 0.002),
        e.clientX - rect.left - rect.width / 2,
        e.clientY - rect.top - rect.height / 2,
      );
      draw();
    }
    function key(e: KeyboardEvent) {
      switch (e.key) {
        case "Home":
          scale = 1;
          x = y = 0;
          break;
        case "+":
        case "=":
          zoom(1.35);
          break;
        case "-":
          zoom(1 / 1.35);
          break;
        case "ArrowLeft":
          x += 50;
          break;
        case "ArrowRight":
          x -= 50;
          break;
        case "ArrowUp":
          y += 50;
          break;
        case "ArrowDown":
          y -= 50;
          break;
        default:
          return;
      }
      e.preventDefault();
      draw();
    }
    function down(e: PointerEvent) {
      if (e.button !== 0 || contacts.size >= 2) return;
      el.setPointerCapture(e.pointerId);
      contacts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    function move(e: PointerEvent) {
      const last = contacts.get(e.pointerId);
      if (!last) return;
      const other = [...contacts.values()].find((point) => point !== last);
      if (other) {
        const oldDistance = Math.hypot(last.x - other.x, last.y - other.y);
        const distance = Math.hypot(e.clientX - other.x, e.clientY - other.y);
        const rect = el.getBoundingClientRect();
        if (oldDistance > 1)
          zoom(
            distance / oldDistance,
            (last.x + other.x - rect.width) / 2 - rect.left,
            (last.y + other.y - rect.height) / 2 - rect.top,
          );
      }
      x += (e.clientX - last.x) / (other ? 2 : 1);
      y += (e.clientY - last.y) / (other ? 2 : 1);
      contacts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      draw();
    }
    function release(e: PointerEvent) {
      contacts.delete(e.pointerId);
    }
    const size = new ResizeObserver(draw);
    size.observe(el);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("keydown", key);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("lostpointercapture", release);
    return () => {
      size.disconnect();
      paper.style.transform = "";
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("keydown", key);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("lostpointercapture", release);
    };
  }, [expanded]);
  return (
    <div
      ref={surface}
      className="town-print"
      role="img"
      tabIndex={expanded ? 0 : -1}
      aria-label={
        expanded
          ? "Illustrated world map. Scroll or pinch to zoom and drag to pan. Plus and minus zoom, arrow keys pan, and Home resets the view."
          : "Illustrated travel neighborhoods around a shared network of streets"
      }
    >
      <div className="town-poster" />
    </div>
  );
}
