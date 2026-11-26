import { CausalMask } from "./speculative-decoding/CausalMask";
import { KvCacheSteps } from "./speculative-decoding/KvCacheSteps";
import { OnePassCheck } from "./speculative-decoding/OnePassCheck";
import { PassTimeline } from "./speculative-decoding/PassTimeline";
import { SamplingRule } from "./speculative-decoding/SamplingRule";
import { SpeedupCalculator } from "./speculative-decoding/SpeedupCalculator";

/**
 * MDX components for the posts maintained in src/content/posts. Each post's
 * figures live beside it here, never in src/vendor (which a sync replaces).
 */
export const postComponents = {
  CausalMask,
  KvCacheSteps,
  OnePassCheck,
  PassTimeline,
  SamplingRule,
  SpeedupCalculator,
};
