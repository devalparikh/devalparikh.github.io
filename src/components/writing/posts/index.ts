import { KvCacheSteps } from "./speculative-decoding/KvCacheSteps";
import { OnePassCheck } from "./speculative-decoding/OnePassCheck";
import { PassTimeline } from "./speculative-decoding/PassTimeline";
import { PrefillPass } from "./speculative-decoding/PrefillPass";
import { SamplingRule } from "./speculative-decoding/SamplingRule";
import { SpeedupCalculator } from "./speculative-decoding/SpeedupCalculator";
import { SdTerm } from "./speculative-decoding/terms";

/**
 * MDX components for the posts maintained in src/content/posts. Each post's
 * figures live beside it here, never in src/vendor (which a sync replaces).
 * They may import a vendored module only if an imported post also uses it;
 * test:writing checks that the snapshot still carries it.
 */
export const postComponents = {
  KvCacheSteps,
  OnePassCheck,
  PassTimeline,
  PrefillPass,
  SamplingRule,
  SdTerm,
  SpeedupCalculator,
};
