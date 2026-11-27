/**
 * The numbers behind the speculative decoding figures. Pure and dependency
 * free so `node --experimental-strip-types` can test it; every counter, bar
 * and label in the figures is derived from here.
 */

/* ------------------------------------------------------------ one round -- */

export const PROMPT = ["The", "cat", "sat"] as const;

/**
 * What the big model predicts at the prompt positions before "sat". Real
 * predictions, but never used: in any prefill only the last one matters.
 */
export const PROMPT_PREDICTIONS = ["first", "is"] as const;

export type SlotCheck = "match" | "miss" | "skip" | "bonus" | "unused";

export interface Scenario {
  id: "miss" | "all" | "first";
  label: string;
  /** The k tokens the draft model guessed. */
  draft: string[];
  /**
   * What the target predicts after each input of its one pass: the last real
   * token, then each guess. k + 1 predictions for k guesses.
   */
  predictions: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "miss",
    label: "Miss at slot 3",
    draft: ["on", "the", "mat", "."],
    predictions: ["on", "the", "floor", ".", "It"],
  },
  {
    id: "all",
    label: "All match",
    draft: ["on", "the", "floor", "."],
    predictions: ["on", "the", "floor", ".", "It"],
  },
  {
    id: "first",
    label: "First guess wrong",
    draft: ["in", "the", "box", "."],
    predictions: ["on", "the", "box", ".", "It"],
  },
];

export interface RoundResult {
  /** What the target reads in its one pass: the newest real token, then the guesses. */
  inputs: string[];
  /** Per slot (k + 1 of them): how its prediction was used. */
  checks: SlotCheck[];
  /** Tokens this round adds to the text. */
  kept: string[];
  /** How many guesses were accepted. */
  accepted: number;
  /** Index of the slot whose token came from the target itself (fix or bonus). */
  targetSlot: number;
}

/**
 * Greedy verification: accept guesses left to right while they equal the
 * target's prediction for that slot. At the first mismatch take the target's
 * token; if every guess matched, take the prediction after the last one.
 */
export function verify({ draft, predictions }: Pick<Scenario, "draft" | "predictions">): RoundResult {
  if (predictions.length !== draft.length + 1) throw new Error("A pass over k guesses gives k + 1 predictions.");
  const inputs = [PROMPT[PROMPT.length - 1], ...draft];
  const checks: SlotCheck[] = [];
  let accepted = 0;
  while (accepted < draft.length && draft[accepted] === predictions[accepted]) {
    checks.push("match");
    accepted++;
  }
  if (accepted < draft.length) {
    checks.push("miss");
    while (checks.length < predictions.length) checks.push("skip");
  } else {
    checks.push("bonus");
  }
  return {
    inputs,
    checks,
    kept: [...draft.slice(0, accepted), predictions[accepted]],
    accepted,
    targetSlot: accepted,
  };
}

/* ------------------------------------------------------- where time goes -- */

/**
 * Rough arithmetic for one machine, not a benchmark: a 27B model at 4 bits
 * (~16 GB of weights) and a 1.5B draft (~0.9 GB) on a laptop GPU with
 * ~300 GB/s of memory bandwidth and ~10 TFLOP/s of usable math.
 *
 * A pass costs whichever is longer: reading the weights once, or doing the
 * math for every position in it (2 FLOPs per parameter per position).
 */
export const MACHINE = {
  bandwidthGBs: 300,
  tflops: 10,
  target: { params: 27e9, gigabytes: 16 },
  draft: { params: 1.5e9, gigabytes: 0.9 },
} as const;

type ModelSize = { params: number; gigabytes: number };

export function readMs(model: ModelSize) {
  return (model.gigabytes / MACHINE.bandwidthGBs) * 1000;
}

export function mathMs(model: ModelSize, positions: number) {
  return ((2 * model.params * positions) / (MACHINE.tflops * 1e12)) * 1000;
}

export interface Pass {
  model: "target" | "draft";
  start: number;
  /** Time spent reading weights and doing math; the pass lasts the longer. */
  read: number;
  math: number;
  duration: number;
  positions: number;
  /** Token(s) this pass makes final, shown when it ends. */
  emits: string[];
}

export interface Lane {
  passes: Pass[];
  total: number;
  tokens: string[];
}

function pass(model: Pass["model"], start: number, positions: number, emits: string[]): Pass {
  const size = MACHINE[model];
  const read = readMs(size);
  const math = mathMs(size, positions);
  return { model, start, read, math, duration: Math.max(read, math), positions, emits };
}

/**
 * The "on the floor" round, for `requests` requests batched together. Each
 * request is assumed to get the same three tokens, so every batched pass
 * carries `requests` times as many positions.
 */
export function timeline(requests: number): { normal: Lane; speculative: Lane } {
  const round = verify(SCENARIOS[0]);
  const normalPasses: Pass[] = [];
  let clock = 0;
  for (const token of round.kept) {
    const next = pass("target", clock, requests, [token]);
    normalPasses.push(next);
    clock += next.duration;
  }
  const normal = { passes: normalPasses, total: clock, tokens: round.kept };

  const specPasses: Pass[] = [];
  clock = 0;
  for (let guess = 0; guess < SCENARIOS[0].draft.length; guess++) {
    const next = pass("draft", clock, requests, []);
    specPasses.push(next);
    clock += next.duration;
  }
  const check = pass("target", clock, requests * (SCENARIOS[0].draft.length + 1), round.kept);
  specPasses.push(check);
  clock += check.duration;
  return { normal, speculative: { passes: specPasses, total: clock, tokens: round.kept } };
}

/* ---------------------------------------------------------------- speedup -- */

/** Expected tokens per target pass with k guesses each accepted with probability alpha (Leviathan et al., eq. 1). */
export function tokensPerPass(alpha: number, k: number) {
  if (alpha >= 1) return k + 1;
  return (1 - alpha ** (k + 1)) / (1 - alpha);
}

/** Expected walltime improvement, with c = draft pass time / target pass time (Leviathan et al., thm 3.8). */
export function speedup(alpha: number, k: number, c: number) {
  return tokensPerPass(alpha, k) / (k * c + 1);
}

/** The draft cost from the machine above (3 ms / 53 ms), rounded as the post states it. */
export const DRAFT_COST = Math.round((readMs(MACHINE.draft) / readMs(MACHINE.target)) * 100) / 100;

export function bestK(alpha: number, c: number, maxK: number) {
  let best = 1;
  for (let k = 2; k <= maxK; k++) if (speedup(alpha, k, c) > speedup(alpha, best, c)) best = k;
  return best;
}

/* --------------------------------------------------------------- sampling -- */

/** Slot 3 with sampling on: the target's and the draft's chances, out of 100. */
export const SAMPLING_SLOT = {
  tokens: ["floor", "mat", "rug"],
  target: [50, 30, 20],
  draft: [20, 60, 20],
} as const;

/**
 * Modified rejection sampling, as expected counts out of 100 draws. The draft
 * proposes x with chance q(x); it is kept with chance min(1, p/q), so it
 * contributes min(p, q). Rejections are refilled from max(0, p - q),
 * normalised, which adds back exactly what the draft under-proposed.
 */
export function samplingOutcome({ target, draft }: { target: readonly number[]; draft: readonly number[] }) {
  const kept = target.map((p, index) => Math.min(p, draft[index]));
  const keptTotal = kept.reduce((sum, value) => sum + value, 0);
  const rejected = 100 - keptTotal;
  const leftover = target.map((p, index) => Math.max(0, p - draft[index]));
  const leftoverTotal = leftover.reduce((sum, value) => sum + value, 0);
  const refill = leftover.map((value) => (leftoverTotal ? (value / leftoverTotal) * rejected : 0));
  return { kept, refill, keptTotal, rejected, final: kept.map((value, index) => value + refill[index]) };
}
