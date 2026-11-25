// Presentation fractions describe event ordering, never measured system latency.
export const RETRY_STOPS = [0, .4, .64, 1] as const;
export const OUTBOX_STOPS = [0, .38, .52, 1] as const;
export const DURATION = 18000;

export function fraction(progress: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

export function retryState(progress: number, deduplicate: boolean) {
  const attempts = progress < .08 ? 0 : progress < .5 ? 1 : 2;
  const charges = progress < .22 ? 0 : progress < .64 || deduplicate ? 1 : 2;
  return {
    attempts, charges, total: charges * 120,
    replyLost: progress >= .36,
    resolved: progress >= .76,
  };
}

export function outboxState(progress: number, crashBeforeCommit: boolean) {
  const committed = !crashBeforeCommit && progress >= .34;
  const crashed = progress >= .42;
  const published = committed && progress >= .76;
  return {
    committed, crashed, published,
    order: committed ? "confirmed" : "pending",
    event: committed ? "evt_123" : "none",
    staged: progress >= .22 && !committed && !crashed,
    writeWork: crashed && !committed ? 0 : fraction(progress, .06, .22),
  };
}
