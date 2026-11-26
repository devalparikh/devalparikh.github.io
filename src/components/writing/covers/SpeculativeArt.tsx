import { ArtSvg, Halftone, type ArtProps } from "./shared";

const X0 = 22;
const STEP = 33;
const TILE = 26;
const colX = (index: number) => X0 + index * STEP;

/** Bottom row: the last real token, then four drafted guesses. */
const INPUT_Y = 138;
/** The causal staircase: position i sees i + 1 tokens. */
const CELL = 11;
const STAIR_BASE = INPUT_Y - 6;
/** Top row: what the one pass predicts after each input. */
const PRED_Y = 42;

const VERDICTS = ["accept", "accept", "fix", "drop", "drop"] as const;

/**
 * Speculative decoding - one pass, a prediction at every position. Bottom: the
 * last real token and four drafted guesses. Middle: the causal staircase, each
 * position seeing only the tokens up to it, all read in the same pass.
 * Top: the five predictions, one above each position, arriving together. Two match, the third is replaced
 * by the big model's own token (the accent ink), and what came after the
 * first difference is dropped.
 */
export function SpeculativeArt({ uid }: ArtProps) {
  return (
    <ArtSvg>
      <defs>
        <Halftone id={`${uid}-dots`} ink="k1" pitch={2.6} dot={0.78} />
      </defs>

      {/* One forward pass: a single band across every position */}
      <rect className="sd-pass k2" x={X0 - 8} y={PRED_Y + TILE + 6} width={STEP * 4 + TILE + 16} height={STAIR_BASE - PRED_Y - TILE - 4} rx="6" opacity="0.16" />
      <text x={X0 - 3} y={PRED_Y + TILE + 17} className="cover-svg-type k2" fontSize="7.5">ONE PASS</text>

      {VERDICTS.map((verdict, index) => {
        const x = colX(index);
        const dropped = verdict === "drop";
        const stairTop = STAIR_BASE - (index + 1) * CELL;
        return (
          <g key={index} className={dropped ? "sd-dropped" : undefined}>
            {/* What this position can see */}
            <rect
              className="sd-stair"
              style={{ transformOrigin: `${x + TILE / 2}px ${STAIR_BASE}px` }}
              x={x + 3}
              y={stairTop}
              width={TILE - 6}
              height={(index + 1) * CELL - 2}
              rx="2"
              fill={`url(#${uid}-dots)`}
            />

            {/* The input token */}
            {index === 0 ? (
              <rect x={x} y={INPUT_Y} width={TILE} height="18" rx="4" className="k1" />
            ) : (
              <g className={`sd-guess sd-guess-${index}`}>
                <rect x={x} y={INPUT_Y} width={TILE} height="18" rx="4" className="sk1" fill="none" strokeWidth="1.8" />
                <rect x={x + 6} y={INPUT_Y + 7} width={TILE - 12} height="4" rx="2" className="k1" />
              </g>
            )}

            {/* The prediction for the next slot */}
            <g className={`sd-pred sd-pred-${verdict}`}>
              {verdict === "accept" && (
                <>
                  <rect x={x} y={PRED_Y} width={TILE} height={TILE} rx="4" className="k1" />
                  <path className={`sd-tick sd-tick-${index}`} d={`M${x + 7} ${PRED_Y + 13} l4 4.4 l8.5 -9`} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--g)" }} />
                </>
              )}
              {verdict === "fix" && (
                <>
                  <rect x={x} y={PRED_Y} width={TILE} height={TILE} rx="4" className="sk1" fill="none" strokeWidth="1.8" />
                  <path d={`M${x + 8} ${PRED_Y + 8} l10 10 M${x + 18} ${PRED_Y + 8} l-10 10`} className="sk1" strokeWidth="2.4" strokeLinecap="round" />
                  <g className="sd-fix">
                    <rect x={x} y={PRED_Y - TILE - 8} width={TILE} height={TILE} rx="4" className="k2" />
                    <path d={`M${x + TILE / 2} ${PRED_Y - TILE - 2} v12 M${x + 7.5} ${PRED_Y - 19} l5.5 5.5 l5.5 -5.5`} fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--g)" }} />
                  </g>
                </>
              )}
              {dropped && (
                <rect x={x} y={PRED_Y} width={TILE} height={TILE} rx="4" className="sk1" fill="none" strokeWidth="1.4" strokeDasharray="3 3" />
              )}
            </g>
          </g>
        );
      })}
    </ArtSvg>
  );
}
