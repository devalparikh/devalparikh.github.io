// One Jev request as data: what it was built from, the wire payload, and what code produced next.
// Tests validate these; the reader-facing explanation lives in each example's Trace.
export type DataFlowCall = {
  input?: unknown;
  state: unknown;
  questions: unknown;
  answers: unknown;
  output?: unknown;
};

export type DataFlow = DataFlowCall & { nextCalls?: DataFlowCall[] };
