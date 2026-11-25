// Project one published demo across a queue. This is not a measured batch run.
export const TICKET_COUNT = 100;
export const BATCH_MODELS = {
  jev: { name: "Jev", milliseconds: 114, costMicrodollars: 81 },
  llm: { name: "GPT-5.6 Terra", milliseconds: 8566, costMicrodollars: 13880 },
} as const;
export type BatchModel = keyof typeof BATCH_MODELS;
export const BATCH_END_MS = BATCH_MODELS.llm.milliseconds * TICKET_COUNT;
export const BATCH_STOPS = [0, BATCH_MODELS.jev.milliseconds * TICKET_COUNT / 40000, .5, 1] as const;

export function batchElapsedMs(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  return Math.round(p <= .5 ? p * 40000 : 20000 + (p - .5) * 2 * (BATCH_END_MS - 20000));
}

export function batchSnapshot(model: BatchModel, elapsedMs: number) {
  const { milliseconds, costMicrodollars } = BATCH_MODELS[model];
  const elapsed = Math.max(0, elapsedMs);
  const completed = Math.min(TICKET_COUNT, Math.floor(elapsed / milliseconds));
  const done = completed === TICKET_COUNT;
  return {
    completed,
    done,
    activeProgress: done ? 0 : (elapsed % milliseconds) / milliseconds,
    costMicrodollars: completed * costMicrodollars,
    finishMs: milliseconds * TICKET_COUNT,
  };
}

export function batchTime(milliseconds: number) {
  const seconds = milliseconds / 1000;
  return seconds < 60 ? `${seconds.toFixed(1)} s` : `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(1)}s`;
}

export function batchCost(microdollars: number) {
  return `$${(microdollars / 1e6).toFixed(4)}`;
}
