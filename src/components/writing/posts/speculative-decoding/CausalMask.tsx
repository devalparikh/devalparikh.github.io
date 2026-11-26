"use client";

import { useId, useState } from "react";
import { Choice } from "./Controls";
import { PROMPT, PROMPT_PREDICTIONS, SCENARIOS } from "./model";
import "./figures.css";

const scenario = SCENARIOS[0];

const MODES = [
  { id: "prefill", label: "Regular prefill" },
  { id: "draft", label: "Prefill over the draft" },
] as const;

type Mode = (typeof MODES)[number]["id"];

/**
 * One prefill pass: which tokens each position can see (the causal mask) and
 * the next-token prediction each position produces. Regular prefill keeps only
 * the last prediction; with the draft appended, every prediction from "sat"
 * on is compared with a guess.
 */
export function CausalMask({ mode: initial = "prefill" }: { mode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const captionId = useId();
  const withDraft = mode === "draft";
  const tokens: string[] = withDraft ? [...PROMPT, ...scenario.draft] : [...PROMPT];
  const predictions: string[] = withDraft ? [...PROMPT_PREDICTIONS, ...scenario.predictions] : [...PROMPT_PREDICTIONS, scenario.predictions[0]];
  const firstUsed = PROMPT.length - 1;

  return (
    <figure className="not-prose sdv-figure" aria-describedby={captionId}>
      <div className="sdv-stage">
        <div className="sdv-toolbar">
          <Choice label="Pass" options={MODES} value={mode} onChange={setMode} />
        </div>
        <div className="sdv-scroll">
          <table className="sdv-mask">
            <caption className="sr-only">
              {`Causal mask for one prefill pass over ${tokens.join(" ")}. Each row is one position; filled cells are the tokens it can see. The last column is the next token it predicts, and whether that prediction is used.`}
            </caption>
            <thead>
              <tr className="sdv-mask-groups">
                <td />
                <th scope="colgroup" colSpan={PROMPT.length}>text</th>
                {withDraft && <th scope="colgroup" colSpan={scenario.draft.length} data-group="draft">draft</th>}
                <td />
              </tr>
              <tr>
                <th scope="col"><span className="sr-only">Position</span></th>
                {tokens.map((token, index) => (
                  <th key={index} scope="col" data-draft={index >= PROMPT.length}>{token}</th>
                ))}
                <th scope="col" className="sdv-mask-pred">predicts</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, row) => {
                const used = row >= firstUsed;
                return (
                  <tr key={row}>
                    <th scope="row">{token}</th>
                    {tokens.map((_, column) => {
                      const see = column === row ? "self" : column < row ? "seen" : "hidden";
                      return (
                        <td key={column} data-see={see}>
                          <span className="sr-only">{see === "hidden" ? "hidden" : "sees"}</span>
                        </td>
                      );
                    })}
                    <td className="sdv-mask-pred">
                      <span aria-hidden="true">→ </span>
                      <span className="sdv-tok" data-kind="target" data-show data-dim={!used}>
                        {predictions[row]}
                      </span>
                      <span className="sr-only">{used ? (withDraft ? ", compared with the draft" : ", used") : ", discarded"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="sdv-legend" aria-hidden="true">
          <span><i data-see="self" /> this position</span>
          <span><i data-see="seen" /> earlier tokens it can see</span>
          <span><i data-see="hidden" /> later tokens, masked</span>
          <span><i data-see="dim" /> prediction discarded</span>
        </div>
        <p className="sdv-step">
          {withDraft
            ? `Seven positions, seven predictions in one pass. The two inside the text are thrown away as usual. The five from “sat” on are kept and compared with the draft's guesses.`
            : `Three positions, three predictions. Only the last one (“on”) is used, as the first output token; the other two are thrown away.`}
        </p>
      </div>
      <figcaption id={captionId}>
        Every position predicts the next token, but each sees only itself and earlier tokens.{" "}
        {withDraft ? (
          <>
            The row for “the” sees <i>The cat sat on the</i>, so its prediction (“floor”) is the one the model would
            make if the text ended there. The guesses after it, “mat” and “.”, cannot change it.
          </>
        ) : (
          <>
            The row for “cat” sees only <i>The cat</i>, so its prediction is the one the model would make if the text
            ended there. In a normal prefill nobody needs it.
          </>
        )}
      </figcaption>
    </figure>
  );
}
