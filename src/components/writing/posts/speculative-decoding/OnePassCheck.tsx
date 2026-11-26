"use client";

import { useId, useState } from "react";
import { Choice, PlaybackControls } from "./Controls";
import { PROMPT, SCENARIOS, verify, type Scenario, type SlotCheck } from "./model";
import { usePlayback } from "./usePlayback";
import "./figures.css";

const GUESS_AT = (index: number) => 0.04 + index * 0.055;
const READ_AT = 0.3;
const PREDICT_AT = 0.4;
const CHECK_AT = (slot: number) => 0.5 + slot * 0.05;
const RESULT_AT = 0.78;

const STOPS = [0.26, 0.46, 0.74, 1] as const;
const STOP_LABELS = ["Draft", "One pass", "Check", "Keep"] as const;

const CHECK_TEXT: Record<SlotCheck, { mark: string; word: string }> = {
  match: { mark: "✓", word: "match" },
  miss: { mark: "✗", word: "differs" },
  skip: { mark: "–", word: "dropped" },
  bonus: { mark: "+", word: "bonus" },
  unused: { mark: "", word: "" },
};

function stepText(phase: number, scenario: Scenario, kept: string[], accepted: number) {
  const k = scenario.draft.length;
  if (phase === 0) return `The small model guesses ${k} tokens, one quick pass each.`;
  if (phase === 1) return `The big model runs one prefill pass over the text plus the ${k} guesses and keeps the next-token prediction at every position from “sat” on.`;
  if (phase === 2) return "The serving code compares each prediction with the guess for the same slot, left to right.";
  const own = kept[kept.length - 1];
  if (accepted === k) return `All ${k} guesses match, so the prediction after the last one is free: ${kept.length} tokens from one big pass.`;
  if (accepted === 0) return `The first guess differs, so only the big model's own “${own}” is kept: 1 token, the same as a normal step.`;
  return `Keep ${scenario.draft.slice(0, accepted).map((token) => `“${token}”`).join(" and ")}, then the big model's “${own}”: ${kept.length} tokens from one big pass.`;
}

/**
 * The centerpiece: one verification round for "The cat sat". Each column is
 * one slot of output. The big model reads the last real token plus every
 * guess in one pass and predicts the next token after each, so its prediction
 * for a slot sits directly above the draft's guess for that slot.
 */
export function OnePassCheck() {
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>("miss");
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];
  const round = verify(scenario);
  const { ref: stageRef, ...playback } = usePlayback(STOPS, 13000, 3200);
  const { progress } = playback;
  const captionId = useId();
  const slots = scenario.predictions.length;

  const guessesShown = scenario.draft.filter((_, index) => progress >= GUESS_AT(index)).length;
  const read = progress >= READ_AT;
  const predicted = progress >= PREDICT_AT;
  const lastCheck = round.targetSlot;
  const checkShown = (slot: number) =>
    slot <= lastCheck ? progress >= CHECK_AT(slot) : progress >= CHECK_AT(lastCheck) + 0.04;
  const done = progress >= RESULT_AT;

  return (
    <figure className="not-prose sdv-figure" aria-describedby={captionId}>
      <div className="sdv-stage" ref={stageRef}>
        <div className="sdv-toolbar">
          <Choice
            label="Example"
            options={SCENARIOS}
            value={scenarioId}
            onChange={(id) => {
              setScenarioId(id);
              playback.restart();
            }}
          />
        </div>

        <p className="sdv-prompt">
          <span className="sdv-muted">Text so far</span> <span className="sdv-mono">{PROMPT.join(" ")}</span>
          <span className="sdv-mono sdv-appended">
            {done && round.kept.map((token, index) => (
              <span key={`${token}-${index}`} data-kind={index === round.targetSlot ? "target" : "draft"}> {token}</span>
            ))}
          </span>
        </p>

        <div className="sdv-grid" style={{ ["--slots" as string]: slots }}>
          <div className="sdv-label sdv-head">Slot</div>
          {scenario.predictions.map((_, slot) => (
            <div key={slot} className="sdv-head sdv-slot">{slot + 1}</div>
          ))}

          <div className="sdv-label">
            Big model reads
            <span className="sdv-sub">one prefill pass</span>
          </div>
          <div className="sdv-pass" data-on={read} style={{ gridColumnEnd: `span ${slots}` }}>
            {round.inputs.map((token, slot) => (
              <span
                key={slot}
                className="sdv-tok"
                data-kind={slot === 0 ? "text" : "draft"}
                data-show={slot === 0 || read}
              >
                {token}
              </span>
            ))}
          </div>

          <div className="sdv-label">Predicts next</div>
          {scenario.predictions.map((token, slot) => {
            return (
              <span
                key={slot}
                className="sdv-tok"
                data-kind="target"
                data-show={predicted}
                data-dim={done && round.checks[slot] === "skip"}
                data-own={done && slot === round.targetSlot}
              >
                {token}
              </span>
            );
          })}

          <div className="sdv-label">
            Draft guessed
            <span className="sdv-sub">small model</span>
          </div>
          {Array.from({ length: slots }, (_, slot) => {
            const token = scenario.draft[slot];
            if (token === undefined) {
              return <span key={slot} className="sdv-tok" data-kind="empty" data-show>none</span>;
            }
            return (
              <span key={slot} className="sdv-tok" data-kind="draft" data-show={slot < guessesShown} data-dim={done && slot >= round.accepted} data-wrong={done && slot === round.accepted}>
                {token}
              </span>
            );
          })}

          <div className="sdv-label">Check</div>
          {round.checks.map((check, slot) => {
            const text = CHECK_TEXT[check];
            return (
              <span key={slot} className="sdv-check" data-check={check} data-show={checkShown(slot)}>
                <span aria-hidden="true">{text.mark}</span> {text.word}
              </span>
            );
          })}
        </div>

        <div className="sdv-counters" aria-hidden="true">
          <span>
            <b>{read ? 1 : 0}</b> big-model pass
          </span>
          <span>
            <b>{guessesShown}</b> small-model passes
          </span>
          <span>
            <b>{done ? round.kept.length : 0}</b> tokens added
          </span>
          <span className="sdv-muted">
            normal decoding: {round.kept.length} big passes for {round.kept.length === 1 ? "that token" : "those tokens"}
          </span>
        </div>

        <p className="sdv-step" aria-live="off">{stepText(playback.phase, scenario, round.kept, round.accepted)}</p>

        <PlaybackControls
          stops={STOP_LABELS}
          phase={playback.phase}
          playing={playback.playing}
          progress={progress}
          reducedMotion={playback.reducedMotion}
          onSelect={playback.select}
          onToggle={playback.toggle}
        />
        <p className="sr-only">
          {`Example: ${PROMPT.join(" ")}, draft guesses ${scenario.draft.join(" ")}. The big model reads ${round.inputs.join(" ")} in one pass and predicts ${scenario.predictions.join(", ")}. Result: ${round.kept.join(" ")}, ${round.kept.length} tokens from one big-model pass.`}
        </p>
      </div>
      <figcaption id={captionId}>
        One round, greedy decoding. Each column is one position of the big model&apos;s prefill pass over the draft:
        the token at that position, the token it predicts next, and the draft&apos;s guess for that same slot. The
        positions for “The” and “cat” are in the pass too, but their predictions are discarded as in any prefill.
        Everything right of the first difference was computed from a wrong guess, so it is dropped.
      </figcaption>
    </figure>
  );
}
