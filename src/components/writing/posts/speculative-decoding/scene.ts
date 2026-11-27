/**
 * Step timing for the animated figures. A figure is a loop of named steps;
 * each step spends its first 70% moving and the rest holding still so the
 * narration can be read. Pure, so it can be tested.
 */

export interface StepDef {
  id: string;
  label: string;
  text: string;
  /** Relative share of the loop. */
  span: number;
}

export interface Step extends StepDef {
  index: number;
  start: number;
  end: number;
  /** Where a picked step lands: after its motion, inside its hold. */
  hold: number;
}

export const MOTION_END = 0.7;
const HOLD_AT = 0.88;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const mix = (from: number, to: number, f: number) => from + (to - from) * f;
export const ease = (f: number) => {
  const x = clamp01(f);
  return x * x * (3 - 2 * x);
};

export function buildSteps(defs: readonly StepDef[]): Step[] {
  const total = defs.reduce((sum, def) => sum + def.span, 0);
  let cursor = 0;
  return defs.map((def, index) => {
    const start = cursor / total;
    cursor += def.span;
    const end = cursor / total;
    return { ...def, index, start, end, hold: start + (end - start) * HOLD_AT };
  });
}

export function stepAt(steps: readonly Step[], t: number): Step {
  return steps.find((step) => t >= step.start && t < step.end) ?? steps[steps.length - 1];
}

export interface Phases {
  /** Progress through part of a step: 0 before, 1 after. */
  done: (id: string, from?: number, to?: number) => number;
  /** Progress while strictly inside part of a step, otherwise null. */
  moving: (id: string, from?: number, to?: number) => number | null;
  /** True once the step has started. */
  reached: (id: string) => boolean;
  /** True while the clock is inside the step. */
  on: (id: string) => boolean;
}

export function phases(steps: readonly Step[], t: number): Phases {
  const find = (id: string) => {
    const step = steps.find((candidate) => candidate.id === id);
    if (!step) throw new Error(`Unknown step: ${id}`);
    return step;
  };
  const done = (id: string, from = 0, to = MOTION_END) => {
    const step = find(id);
    const length = step.end - step.start;
    return clamp01((t - (step.start + length * from)) / (length * (to - from)));
  };
  return {
    done,
    moving: (id, from, to) => {
      const f = done(id, from, to);
      return f > 0 && f < 1 ? f : null;
    },
    reached: (id) => t >= find(id).start,
    on: (id) => {
      const step = find(id);
      return t >= step.start && t < step.end;
    },
  };
}

export type Pt = readonly [number, number];

export const pathD = (points: readonly Pt[]) =>
  points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");

/** Point at fraction f of a polyline's length. */
export function pointAlong(points: readonly Pt[], f: number): Pt {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  const target = total * clamp01(f);
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const segment = Math.hypot(x1 - x0, y1 - y0);
    if (walked + segment >= target && segment > 0) {
      const local = (target - walked) / segment;
      return [Math.round(mix(x0, x1, local) * 100) / 100, Math.round(mix(y0, y1, local) * 100) / 100];
    }
    walked += segment;
  }
  return points[points.length - 1];
}
