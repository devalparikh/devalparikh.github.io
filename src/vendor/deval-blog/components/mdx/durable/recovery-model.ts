import { fraction } from "./execution-model";

// Presentation fractions describe event ordering, never measured system latency.
export const QUEUE_STOPS = [0, .36, .60, 1] as const;
export const APPROVAL_STOPS = [0, .28, .50, 1] as const;
export const TRANSFER_STOPS = [0, .36, .76, 1] as const;

export function queueState(progress: number) {
  return {
    crashed: progress >= .34,
    restarted: progress >= .54,
    saved: progress >= .78,
    acknowledged: progress >= .90,
    firstWork: fraction(progress, .12, .32),
    retryWork: fraction(progress, .54, .72),
  };
}

export function approvalState(progress: number) {
  return {
    approved: progress >= .18,
    recorded: progress >= .26,
    crashed: progress >= .34,
    recovered: progress >= .48,
    charged: progress >= .66,
    confirmed: progress >= .78,
    approvalWork: fraction(progress, .06, .18),
    paymentWork: fraction(progress, .52, .66),
    confirmationWork: fraction(progress, .70, .78),
  };
}

export function transferState(progress: number, atomic: boolean, crash: boolean) {
  const debitWritten = progress >= .24;
  const creditWritten = !crash && progress >= .72;
  const interrupted = crash && progress >= .56;
  const committed = !crash && progress >= .80;
  const debitCommitted = atomic ? committed : debitWritten;
  const creditCommitted = atomic ? committed : creditWritten;
  const alice = debitCommitted ? 60 : 100;
  const bob = creditCommitted ? 40 : 0;
  return {
    alice, bob, total: alice + bob,
    debitWritten, creditWritten, debitCommitted, creditCommitted,
    interrupted, committed,
    partial: debitCommitted && !creditCommitted,
    debitWork: atomic && interrupted ? 0 : fraction(progress, .08, .24),
    creditWork: crash ? 0 : fraction(progress, .60, .72),
  };
}
