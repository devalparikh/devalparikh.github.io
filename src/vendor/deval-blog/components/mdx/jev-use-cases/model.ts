export const MATCHES = [
  { name: "Cancellation fee", choice: .51, noul: .94 },
  { name: "Refund exception", choice: .45, noul: .91 },
  { name: "Delivery time", choice: .03, noul: .07 },
  { name: "None", choice: .01, noul: 0 },
] as const;

export const STOPS = [0, .3, .65, 1] as const;
export const fraction = (p: number, start: number, end: number) => Math.max(0, Math.min(1, (p - start) / (end - start)));

export function candidateSnapshot(progress: number, mode: "choice" | "noul") {
  const answered = progress >= .55;
  const applied = progress >= .65;
  return {
    answered,
    applied,
    selected: !applied ? [] : mode === "choice" ? [0] : MATCHES.flatMap((item, index) => item.noul >= .8 ? [index] : []),
  };
}
