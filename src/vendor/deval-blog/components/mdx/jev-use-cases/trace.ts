// A worked example as one ordered pipeline: who acts, what happens, and the data each step produces.
// Jev requests are ordinary steps in that list, so other models and tools are never hidden inside them.

/** code: the application · jev: a Jev request · model: any other model · system: browser, database, transcriber, user */
export type Actor = "code" | "jev" | "model" | "system";
export type Payload = { label: string; value: unknown };
export type TraceStep = {
  actor: Actor;
  /** Display name when the default ("Your code", "Jev", "Other model", "System") is too vague. */
  by?: string;
  /** Short verb phrase: "Snapshot the page". */
  title: string;
  /** One or two plain sentences: who does what, and why it matters here. */
  say: string;
  /** Optional one to three short lines of real keys and values. No prose. */
  show?: string;
  /** Optional deeper explanation shown when the step is expanded. */
  why?: string;
  payloads?: Payload[];
};
export type Trace = {
  steps: TraceStep[];
  /** When the pipeline loops, say from where and until what. */
  repeat?: string;
  /** Where the example ends and what triggers a fresh run. */
  outcome?: string;
  /** Provenance: what is invented, what follows a source. */
  note?: string;
};

export const ACTOR_LABELS: Record<Actor, string> = { code: "Your code", jev: "Jev", model: "Other model", system: "System" };

/** A Jev request step. The payloads always appear in wire order: state, questions, answers. */
export function jevStep(step: Omit<TraceStep, "actor" | "payloads"> & { state: unknown; questions: unknown; answers: unknown }): TraceStep {
  const { state, questions, answers, ...rest } = step;
  return {
    ...rest,
    actor: "jev",
    payloads: [
      { label: "request.state", value: state },
      { label: "request.questions", value: questions },
      { label: "response.answers", value: answers },
    ],
  };
}
