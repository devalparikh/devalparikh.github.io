import { SAMPLING_SLOT, samplingOutcome } from "./model";
import "./figures.css";

const MAX = 60;

function Bar({ value, kind, label }: { value: number; kind: "target" | "draft" | "kept"; label: string }) {
  return (
    <div className="sdv-prob">
      <span className="sdv-prob-label">{label}</span>
      <span className="sdv-prob-track">
        <span className="sdv-prob-bar" data-kind={kind} style={{ width: `${(value / MAX) * 100}%` }} />
      </span>
      <span className="sdv-prob-value">{Math.round(value)}</span>
    </div>
  );
}

/**
 * Slot 3 with sampling on, as counts out of 100 runs: what the target wants,
 * what the draft proposes, and what the accept/reject rule produces.
 */
export function SamplingRule() {
  const outcome = samplingOutcome(SAMPLING_SLOT);
  return (
    <figure className="not-prose sdv-figure" aria-describedby="sdv-sampling-caption">
      <div className="sdv-stage sdv-panel sdv-sampling">
        {SAMPLING_SLOT.tokens.map((token, index) => (
          <div key={token} className="sdv-prob-group">
            <p className="sdv-prob-token">
              <span className="sdv-mono">{token}</span>
            </p>
            <Bar label="big model" value={SAMPLING_SLOT.target[index]} kind="target" />
            <Bar label="draft" value={SAMPLING_SLOT.draft[index]} kind="draft" />
            <div className="sdv-prob">
              <span className="sdv-prob-label">output</span>
              <span className="sdv-prob-track">
                <span className="sdv-prob-bar" data-kind="kept" style={{ width: `${(outcome.kept[index] / MAX) * 100}%` }} />
                {outcome.refill[index] > 0 && (
                  <span className="sdv-prob-bar" data-kind="refill" style={{ width: `${(outcome.refill[index] / MAX) * 100}%` }} />
                )}
              </span>
              <span className="sdv-prob-value">
                {outcome.refill[index] > 0
                  ? `${Math.round(outcome.kept[index])} + ${Math.round(outcome.refill[index])}`
                  : Math.round(outcome.final[index])}
              </span>
            </div>
          </div>
        ))}
        <div className="sdv-legend" aria-hidden="true">
          <span><i data-strip="target" /> big model</span>
          <span><i data-strip="draft" /> draft</span>
        </div>
      </div>
      <figcaption id="sdv-sampling-caption" className="sdv-caption">
        On average, out of 100 runs of slot 3, the guess survives {outcome.keptTotal} times. All {outcome.rejected} replacements
        are “floor”, so the totals match the big model&apos;s 50, 30 and 20.
      </figcaption>
    </figure>
  );
}
