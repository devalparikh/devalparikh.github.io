// Pure model for the compound-engineering figure. Playback progress (0–1)
// drives every card, packet, counter and skill version from one clock.

export const LOOP_STOPS = [0, 0.4, 0.62, 1] as const;
export const LOOP_DURATION = 26000;
export const LOOP_HOLD = 2200;
export const LOOP_HEIGHT = 500;

export type Lane = "stateless" | "compounding";
export type Source = "me" | "others" | "itself";
export type LessonId = "poster" | "note" | "page" | "dashes";
export type Point = readonly [number, number];

export const THREAD_WIDTH = 180;
export const NIGHT_WIDTH = 105;

export const THREADS = [
  { day: "Monday", film: "The Odyssey", start: 0.03, end: 0.29, x: 200 },
  { day: "Tuesday", film: "Spider-Man: Brand New Day", start: 0.43, end: 0.66, x: 485 },
  { day: "Wednesday", film: null, start: 0.76, end: 0.95, x: 770 },
] as const;

export const NIGHTS = [
  { start: 0.29, end: 0.43, x: 380 },
  { start: 0.66, end: 0.76, x: 665 },
] as const;

export const LESSONS: Record<
  LessonId,
  { correction: string; applied: string; short: string; source: Source }
> = {
  poster: {
    correction: "Store poster locally",
    applied: "Poster stored locally",
    short: "Poster local",
    source: "me",
  },
  note: {
    correction: "Put note and score last",
    applied: "Note and score last",
    short: "note last",
    source: "me",
  },
  page: {
    correction: "Check the rendered page",
    applied: "Rendered page checked",
    short: "Check page",
    source: "others",
  },
  dashes: {
    correction: "No dashes in the row note",
    applied: "No dashes in the row note",
    short: "no dashes",
    source: "me",
  },
};

const LESSON_ORDER: LessonId[] = ["poster", "note", "page", "dashes"];

// Corrections the request runs into each day when nothing is known in advance.
// The rendered-page check comes from an X/Twitter DM, not from a correction I type.
const ISSUES: LessonId[][] = [
  ["poster", "note"],
  ["poster", "note", "dashes"],
  ["poster", "note", "dashes"],
];

// What each overnight review receives, keeps and writes into the skill.
export const REVIEWS = [
  { fromMe: 3, fromOthers: 1, kept: 3, cut: 1, adds: ["poster", "note", "page"] as LessonId[] },
  { fromMe: 1, fromOthers: 0, kept: 1, cut: 0, adds: ["dashes"] as LessonId[] },
] as const;

// Night-local timing: inputs arrive, the review runs, then the skill is written.
export const NIGHT_TIMING = {
  inputs: [0, 0.4],
  xdm: [0.15, 0.45],
  review: [0.42, 0.72],
  write: [0.72, 0.95],
} as const;

// Thread-local timing: load the skill, then each line costs either a quick
// applied step or a slower round trip with me.
const FIRST_LINE = 0.12;
const APPLIED_STEP = 0.09;
const CORRECTION_STEP = 0.22;
const WRAP_UP = 0.12;
export const LOAD_WINDOW = [0, 0.1] as const;

export type ThreadLine = {
  id: "research" | LessonId;
  text: string;
  kind: "research" | "applied" | "correction";
  source?: Source;
  at: number;
};

export function fraction(value: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (value - start) / (end - start)));
}

export function along(points: readonly Point[], amount: number): Point {
  const lengths = points
    .slice(1)
    .map(([x, y], index) => Math.hypot(x - points[index][0], y - points[index][1]));
  let distance =
    Math.max(0, Math.min(1, amount)) * lengths.reduce((sum, length) => sum + length, 0);
  for (let index = 0; index < lengths.length; index++) {
    if (distance <= lengths[index]) {
      const ratio = lengths[index] ? distance / lengths[index] : 0;
      return [
        points[index][0] + (points[index + 1][0] - points[index][0]) * ratio,
        points[index][1] + (points[index + 1][1] - points[index][1]) * ratio,
      ];
    }
    distance -= lengths[index];
  }
  return points[points.length - 1];
}

/** Lessons saved in the compounding skill before thread `index` starts. */
export function skillAtThread(index: number): LessonId[] {
  return REVIEWS.slice(0, index).flatMap((review) => review.adds);
}

export function threadPlan(lane: Lane, index: number) {
  const known = lane === "compounding" ? skillAtThread(index) : [];
  let at = FIRST_LINE;
  const lines: ThreadLine[] = [
    { id: "research", text: "Director, year, cast", kind: "research", at },
  ];
  for (const id of LESSON_ORDER) {
    const lesson = LESSONS[id];
    if (known.includes(id)) {
      at += APPLIED_STEP;
      lines.push({ id, text: lesson.applied, kind: "applied", source: lesson.source, at });
    } else if (ISSUES[index].includes(id)) {
      at += CORRECTION_STEP;
      lines.push({ id, text: lesson.correction, kind: "correction", at });
    }
  }
  return { lines, finish: at + WRAP_UP };
}

export type ThreadStatus = "idle" | "loading" | "working" | "waiting" | "done";

export function threadState(lane: Lane, index: number, progress: number) {
  const thread = THREADS[index];
  const plan = threadPlan(lane, index);
  const started = progress >= thread.start;
  const local = fraction(progress, thread.start, thread.end);
  const lines = started ? plan.lines.filter((line) => local >= line.at) : [];
  const next = plan.lines.find((line) => local < line.at);
  const done = started && local >= plan.finish;
  const status: ThreadStatus = !started
    ? "idle"
    : done
      ? "done"
      : local < FIRST_LINE && skillAtThread(index).length > 0 && lane === "compounding"
        ? "loading"
        : next?.kind === "correction" && local > next.at - CORRECTION_STEP / 2
          ? "waiting"
          : "working";
  return {
    started,
    local,
    lines,
    status,
    done,
    corrections: lines.filter((line) => line.kind === "correction").length,
    work: started ? Math.min(1, local / plan.finish) : 0,
  };
}

export function correctionsTyped(lane: Lane, progress: number) {
  return THREADS.reduce(
    (sum, _thread, index) => sum + threadState(lane, index, progress).corrections,
    0,
  );
}

export function nightState(index: number, progress: number) {
  const night = NIGHTS[index];
  const local = fraction(progress, night.start, night.end);
  const started = progress >= night.start;
  return {
    started,
    local,
    review: started ? fraction(local, ...NIGHT_TIMING.review) : 0,
    reviewed: started && local >= NIGHT_TIMING.review[1],
    written: started && local >= NIGHT_TIMING.write[1],
  };
}

export function skillVersion(progress: number) {
  return NIGHTS.reduce(
    (version, _night, index) => version + Number(nightState(index, progress).written),
    0,
  );
}

/** Shared-clock cursor position across the five day/night columns. */
export function clockX(progress: number) {
  const columns = [
    { start: THREADS[0].start, end: THREADS[0].end, x: THREADS[0].x, width: THREAD_WIDTH },
    { start: NIGHTS[0].start, end: NIGHTS[0].end, x: NIGHTS[0].x, width: NIGHT_WIDTH },
    { start: THREADS[1].start, end: THREADS[1].end, x: THREADS[1].x, width: THREAD_WIDTH },
    { start: NIGHTS[1].start, end: NIGHTS[1].end, x: NIGHTS[1].x, width: NIGHT_WIDTH },
    { start: THREADS[2].start, end: THREADS[2].end, x: THREADS[2].x, width: THREAD_WIDTH },
  ];
  if (progress <= columns[0].start) return columns[0].x;
  const column = columns.find((item) => progress < item.end) ?? columns[columns.length - 1];
  return column.x + column.width * fraction(progress, column.start, column.end);
}
