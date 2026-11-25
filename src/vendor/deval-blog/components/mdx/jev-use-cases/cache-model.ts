// Text groups make prefix invalidation inspectable; these are not tokenizer or GPU block boundaries.
export const CACHED_STATE = ["Maya Chen", "works at", "Northstar Labs.", "Email: maya@example.com."];
export const CACHED_QUESTION = "Which person is named?";

export const CACHE_CASES = {
  same: { label: "Identical request", state: CACHED_STATE, question: CACHED_QUESTION, answer: "Maya Chen" },
  question: { label: "Change the question", state: CACHED_STATE, question: "Which company is named?", answer: "Northstar Labs" },
  end: { label: "Edit the last block", state: [...CACHED_STATE.slice(0, 3), "Email: maya@new.example."], question: CACHED_QUESTION, answer: "Maya Chen" },
  start: { label: "Edit the first block", state: ["Isha Shah", ...CACHED_STATE.slice(1)], question: CACHED_QUESTION, answer: "Isha Shah" },
} as const;

export type CacheCase = keyof typeof CACHE_CASES;

export function inspectCache(example: CacheCase) {
  const current = CACHE_CASES[example];
  const firstChange = CACHED_STATE.findIndex((block, i) => block !== current.state[i]);
  const prefixLength = firstChange === -1 ? CACHED_STATE.length : firstChange;
  return {
    ...current,
    prefixLength,
    resultHit: prefixLength === CACHED_STATE.length && current.question === CACHED_QUESTION,
  };
}
