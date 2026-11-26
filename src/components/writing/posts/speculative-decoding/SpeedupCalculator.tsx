"use client";

import { useId, useState } from "react";
import { bestK, DRAFT_COST, speedup, tokensPerPass } from "./model";
import "./figures.css";

const MAX_K = 8;
const SCALE = 5;
const GRID = [1, 2, 3, 4, 5];

/**
 * Expected gain from Leviathan et al.'s formula. The bars are the choice of k
 * (guesses per round); the slider is the acceptance rate. Draft cost is the
 * laptop example's 1.5B / 27B weight-read ratio.
 */
export function SpeedupCalculator() {
  const [alpha, setAlpha] = useState(0.8);
  const [k, setK] = useState(4);
  const sliderId = useId();
  const captionId = useId();
  const best = bestK(alpha, DRAFT_COST, MAX_K);
  const tokens = tokensPerPass(alpha, k);
  const cost = k * DRAFT_COST + 1;
  const gain = speedup(alpha, k, DRAFT_COST);

  return (
    <figure className="not-prose sdv-figure" aria-describedby={captionId}>
      <div className="sdv-stage sdv-panel">
        <div className="sdv-slider">
          <label htmlFor={sliderId}>
            Acceptance rate <span className="sdv-mono">α = {alpha.toFixed(2)}</span>
          </label>
          <input
            id={sliderId}
            type="range"
            min={0.3}
            max={0.95}
            step={0.05}
            value={alpha}
            onChange={(event) => setAlpha(Number(event.target.value))}
            aria-valuetext={`${Math.round(alpha * 100)} percent of guesses match`}
          />
        </div>

        <div className="sdv-chart" role="group" aria-label="Guesses per round. Choose a bar to see the expected speedup for that k.">
          <div className="sdv-bars">
            <div className="sdv-chart-grid" aria-hidden="true">
              {GRID.map((line) => (
                <span key={line} data-base={line === 1} style={{ bottom: `${(line / SCALE) * 100}%` }}>
                  {`${line}x`}
                </span>
              ))}
            </div>
            {Array.from({ length: MAX_K }, (_, index) => {
              const guesses = index + 1;
              const value = speedup(alpha, guesses, DRAFT_COST);
              const selected = guesses === k;
              return (
                <button
                  key={guesses}
                  type="button"
                  className="sdv-col"
                  aria-pressed={selected}
                  aria-label={`k = ${guesses}: ${value.toFixed(2)}x${guesses === best ? ", the best k at this rate" : ""}`}
                  onClick={() => setK(guesses)}
                >
                  <span className="sdv-col-bar" style={{ height: `${(Math.min(value, SCALE) / SCALE) * 100}%` }}>
                    {(selected || guesses === best) && <span className="sdv-col-value">{value.toFixed(1)}x</span>}
                  </span>
                  <span className="sdv-col-k">{guesses}</span>
                </button>
              );
            })}
          </div>
          <p className="sdv-chart-x">k, guesses per round</p>
        </div>

        <dl className="sdv-readout">
          <div>
            <dt>tokens per big pass</dt>
            <dd>{tokens.toFixed(2)}</dd>
          </div>
          <div>
            <dt>round time, in big passes</dt>
            <dd>
              1 + {k} × {DRAFT_COST} = {cost.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt>speedup</dt>
            <dd>{gain.toFixed(2)}x</dd>
          </div>
        </dl>
      </div>
      <figcaption id={captionId} className="sdv-caption">
        Expected speedup is tokens per big pass divided by round time, from Leviathan et al. The formula assumes each
        guess matches independently with probability α. It also assumes a draft pass costs 0.06 of a big pass, and that
        checking k + 1 positions costs one normal pass. Below the 1x line, the draft costs more time than it saves.
        Real rounds take a little longer as k grows, so the best k in practice is smaller. Chen et al. found k = 3
        fastest on XSum with nucleus sampling.
      </figcaption>
    </figure>
  );
}
