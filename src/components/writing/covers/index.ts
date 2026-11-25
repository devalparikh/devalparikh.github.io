import type { ComponentType } from "react";
import type { ArtProps } from "./shared";
import { CompoundArt } from "./CompoundArt";
import { DurableArt } from "./DurableArt";
import { JevArt } from "./JevArt";
import { MultiAgentArt } from "./MultiAgentArt";
import { SpeculativeArt } from "./SpeculativeArt";
import { SystemOneArt } from "./SystemOneArt";
import { TransformerArt } from "./TransformerArt";
import { VlaArt } from "./VlaArt";

/** One hand-drawn illustration per shelf book, keyed by post slug. */
export const coverArt: Record<string, ComponentType<ArtProps>> = {
  "building-with-jev": JevArt,
  "transformer-basics-prefill-and-decode": TransformerArt,
  "jev-and-system-one-models": SystemOneArt,
  "multi-agent-systems-scale-thought-in-parallel": MultiAgentArt,
  "compound-engineering": CompoundArt,
  "durable-execution-vs-atomic-execution": DurableArt,
  "speculative-decoding": SpeculativeArt,
  "vision-action-transformers-vla-wam": VlaArt,
};
