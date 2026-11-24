// Touch events provide both positions in one sample. Processing each finger's
// pointermove separately makes a parallel swipe briefly look like a twist.
export type Contact = { x: number; y: number };
type Grip = Contact[];

export type MapMotion = {
  from: Contact;
  to: Contact;
  scale: number;
  turn: number;
  tilt: number;
};

function midpoint([a, b]: Grip) {
  return b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a;
}

export function mapDrag(allowTilt: boolean, apply: (motion: MapMotion) => void) {
  let previous: Grip = [];
  let mode: "map" | "tilt" | null = null;
  let tiltAnchor: Contact;
  return {
    rebase(points: Grip) {
      previous = points;
      mode = null;
    },
    move(points: Grip) {
      if (!points.length || points.length > 2 || previous.length !== points.length) return;
      const from = midpoint(previous);
      const to = midpoint(points);
      const motion: MapMotion = { from, to, turn: 0, scale: 1, tilt: 0 };
      if (points.length === 2) {
        const [a, b] = previous, [c, d] = points;
        const dx = to.x - from.x, dy = to.y - from.y;
        const ax = b.x - a.x, ay = b.y - a.y;
        const bx = d.x - c.x, by = d.y - c.y;
        const separationChange = Math.hypot(bx - ax, by - ay);
        if (!mode) {
          if (Math.max(Math.abs(dx), Math.abs(dy), separationChange) < 5) return;
          const parallel = allowTilt && Math.abs(dy) > 1.5 * Math.max(Math.abs(dx), separationChange);
          if (allowTilt && !parallel) {
            const firstY = c.y - a.y;
            const secondY = d.y - b.y;
            const verticalTravel = Math.max(Math.abs(firstY), Math.abs(secondY));
            const horizontalTravel = Math.max(Math.abs(c.x - a.x), Math.abs(d.x - b.x));
            // A parallel swipe can arrive one contact at a time. Give the
            // trailing finger room to catch up before committing to a turn.
            if (firstY * secondY >= 0 && verticalTravel > 2 * horizontalTravel && verticalTravel < 24)
              return;
          }
          tiltAnchor = from;
          mode = parallel ? "tilt" : "map";
        }
        if (mode === "tilt") {
          motion.from = motion.to = tiltAnchor;
          motion.tilt = -dy;
        } else if (Math.min(Math.hypot(ax, ay), Math.hypot(bx, by)) > 4) {
          motion.scale = Math.hypot(bx, by) / Math.hypot(ax, ay);
          motion.turn = Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
        }
      }
      apply(motion);
      previous = points;
    },
  };
}

export function bindMapTouch(
  el: HTMLElement,
  allowTilt: boolean,
  apply: (motion: MapMotion) => void,
  start?: () => void,
) {
  const drag = mapDrag(allowTilt, apply);
  const points = (event: TouchEvent) => Array.from(event.targetTouches)
    .sort((a, b) => a.identifier - b.identifier)
    .map(t => ({ x: t.clientX, y: t.clientY }));
  const rebase = (e: TouchEvent) => drag.rebase(points(e));
  function down(e: TouchEvent) {
    start?.();
    rebase(e);
  }
  const move = (e: TouchEvent) => drag.move(points(e));
  // OrbitControls and the poster's mouse drag still own non-touch pointers.
  function skipTouchPointer(e: PointerEvent) {
    if (e.pointerType === "touch") e.stopImmediatePropagation();
  }
  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true };
  for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel"] as const)
    el.addEventListener(type, skipTouchPointer, { ...options, capture: true });
  el.addEventListener("touchstart", down, options);
  el.addEventListener("touchmove", move, options);
  el.addEventListener("touchend", rebase, options);
  el.addEventListener("touchcancel", rebase, options);
  return () => controller.abort();
}
