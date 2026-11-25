export const TASKS = [
  { label: "Docs", finding: "cursor pagination", tone: "blue" },
  { label: "Changes", finding: "new v2 auth", tone: "green" },
  { label: "Examples", finding: "update v1 samples", tone: "pink" },
  { label: "Limits", finding: "100 items / page", tone: "amber" },
] as const;

export type MergeCost = 3 | 12;
export type WorkInterval = { start: number; duration: number; agents: number };
export const TIME_LIMIT = 18;
export const WORK_STOPS = [0, 2 / TIME_LIMIT, 5 / TIME_LIMIT, 1] as const;

// A deterministic teaching example. Units are active agent time, not tokens or
// measured inference cost. The same four reading tasks take three units each.
export function schedules(mergeCost: MergeCost) {
  return {
    serial: { finish: 16, intervals: [{ start: 0, duration: 16, agents: 1 }] },
    split: { finish: 5 + mergeCost, intervals: [
      { start: 0, duration: 5, agents: 4 },
      { start: 5, duration: mergeCost, agents: 1 },
    ] },
    duplicated: { finish: 18, intervals: [
      { start: 0, duration: 16, agents: 4 },
      { start: 16, duration: 2, agents: 1 },
    ] },
  };
}

export function fraction(time: number, start: number, duration: number) {
  return Math.max(0, Math.min(1, (time - start) / duration));
}

export function workAt(intervals: WorkInterval[], elapsed: number) {
  return intervals.reduce((work, interval) => work +
    fraction(elapsed, interval.start, interval.duration) * interval.duration * interval.agents, 0);
}

export function along(points: readonly (readonly [number, number])[], progress: number) {
  const lengths = points.slice(1).map(([x, y], index) => Math.hypot(x - points[index][0], y - points[index][1]));
  let remaining = Math.max(0, Math.min(1, progress)) * lengths.reduce((sum, length) => sum + length, 0);
  for (let index = 0; index < lengths.length; index++) {
    if (remaining <= lengths[index]) {
      const ratio = lengths[index] ? remaining / lengths[index] : 0;
      return [points[index][0] + (points[index + 1][0] - points[index][0]) * ratio,
        points[index][1] + (points[index + 1][1] - points[index][1]) * ratio];
    }
    remaining -= lengths[index];
  }
  return points[points.length - 1];
}
