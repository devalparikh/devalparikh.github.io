export const PROMPT_TOKENS = ["The", "capital", "of", "France", "is"] as const;
export const CACHE_STOPS = [0, .42, .8, 1] as const;
export const CACHE_DURATION = 22000;
export const CACHE_HEIGHT = 500;
export const CACHE_PASSES = [
  { start: .04, layers: [.14, .23, .32], output: .42, input: PROMPT_TOKENS, next: "Paris" },
  { start: .50, layers: [.56, .64, .72], output: .8, input: ["Paris"], next: "." },
  { start: .84, layers: [.87, .915, .96], output: 1, input: ["."], next: "end" },
] as const;

export function cacheScene(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const passIndex = p < CACHE_PASSES[1].start ? 0 : p < CACHE_PASSES[2].start ? 1 : 2;
  const pass = CACHE_PASSES[passIndex];
  const past = passIndex === 0 ? 0 : PROMPT_TOKENS.length + passIndex - 1;
  const cacheCounts = pass.layers.map(end => past + (p >= end + .025 ? pass.input.length : 0));
  const selected = p >= 1 ? "end" : p >= .8 ? "." : p >= .42 ? "Paris" : null;
  return { p, passIndex, pass, past, cacheCounts, selected, output: p >= .8 ? "Paris." : p >= .42 ? "Paris" : "", stopped: p >= 1 };
}

export const fraction = (value: number, start: number, end: number) => Math.max(0, Math.min(1, (value - start) / (end - start)));
