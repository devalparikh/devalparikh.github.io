"use client";

import { memo, useState } from "react";
import { PROMPT, SCENARIOS, verify, type Scenario } from "./model";
import { buildSteps, phases, type Pt, type Step } from "./scene";
import { Modes, SceneFigure, type SceneProps } from "./SceneFigure";
import { Box, Mark, Packet, Route, Txt } from "./svg";

const SHORT: Record<Scenario["id"], string> = { miss: "miss at 3", all: "all match", first: "miss at 1" };

/** "Slot 1 matches." / "Slots 1 and 2 match." / "Slots 1, 2 and 3 match." */
function matched(count: number) {
  if (count === 1) return "Slot 1 matches.";
  const slots = Array.from({ length: count }, (_, index) => String(index + 1));
  return `Slots ${slots.slice(0, -1).join(", ")} and ${slots[slots.length - 1]} match.`;
}

function narration(scenario: Scenario) {
  const round = verify(scenario);
  const own = round.kept[round.kept.length - 1];
  const kept = scenario.draft.slice(0, round.accepted);
  const q = (token: string) => `“${token}”`;
  const k = scenario.draft.length;
  const compare =
    round.accepted === k
      ? `All ${k} guesses match the big model's predictions.`
      : round.accepted === 0
        ? `Slot 1 already differs. The big model predicts ${q(scenario.predictions[0])}, and the draft guessed ${q(scenario.draft[0])}.`
        : `${matched(round.accepted)} In slot ${round.accepted + 1}, the big model predicts ${q(scenario.predictions[round.accepted])} and the draft guessed ${q(scenario.draft[round.accepted])}.`;
  const keep =
    round.accepted === k
      ? `The round keeps all ${k} guesses, plus the extra token ${q(own)}.`
      : round.accepted === 0
        ? `The round keeps only the big model's ${q(own)}, the same as one decode step.`
        : `The round keeps ${kept.map(q).join(" and ")}, then the big model's ${q(own)}. The later slots are dropped.`;
  return buildSteps([
    { id: "draft", label: "Draft", span: 3, text: `The small model guesses ${k} tokens, one per quick pass.` },
    { id: "pass", label: "One pass", span: 3.2, text: `The big model reads ${q(PROMPT[PROMPT.length - 1])} and the guesses in one prefill pass. It predicts the next token at every position.` },
    { id: "compare", label: "Compare", span: 3.6, text: compare },
    { id: "keep", label: "Keep", span: 3.4, text: keep },
  ]);
}

interface Layout {
  col: (slot: number) => number;
  chipW: number;
  chipH: number;
  slotY: number;
  box: { x: number; y: number; w: number; h: number; titleY: number };
  readsY: number;
  predictsY: number;
  markY: number;
  draftY: number;
  draftBox: { x: number; y: number; w: number; h: number };
  resultY: number;
  resultChip: (index: number) => number;
  resultW: number;
  countersY: number;
  labels: boolean;
}

const WIDE: Layout = {
  col: (slot) => 166 + slot * 96,
  chipW: 84,
  chipH: 28,
  slotY: 16,
  box: { x: 154, y: 30, w: 492, h: 124, titleY: 44 },
  readsY: 56,
  predictsY: 114,
  markY: 174,
  draftY: 196,
  draftBox: { x: 14, y: 190, w: 134, h: 40 },
  resultY: 262,
  resultChip: (index) => 166 + index * 59,
  resultW: 53,
  countersY: 316,
  labels: true,
};

const NARROW: Layout = {
  col: (slot) => 12 + slot * 68,
  chipW: 60,
  chipH: 28,
  slotY: 14,
  box: { x: 4, y: 26, w: 352, h: 132, titleY: 40 },
  readsY: 56,
  predictsY: 118,
  markY: 178,
  draftY: 200,
  draftBox: { x: 12, y: 246, w: 332, h: 30 },
  resultY: 314,
  resultChip: (index) => 12 + index * 42,
  resultW: 38,
  countersY: 366,
  labels: false,
};

function makeScene(scenario: Scenario, steps: Step[]) {
  const round = verify(scenario);
  const slots = scenario.predictions.length;
  const guesses = scenario.draft.length;

  return memo(function OnePassScene({ t, compact }: SceneProps) {
    const L = compact ? NARROW : WIDE;
    const p = phases(steps, t);
    const mid = (slot: number) => L.col(slot) + L.chipW / 2;
    const passOn = p.on("pass");
    const read = p.done("pass", 0, 0.3);
    const predicted = p.done("pass", 0.35, 0.7);
    const compareAt = (slot: number) => p.done("compare", (Math.min(slot, round.targetSlot) / slots) * 0.9, (Math.min(slot, round.targetSlot) / slots) * 0.9 + 0.12);
    const kept = p.done("keep", 0, 0.5);

    return (
      <>
        {/* Slot numbers */}
        {Array.from({ length: slots }, (_, slot) => (
          <Txt key={slot} x={mid(slot)} y={L.slotY} size={10} muted>
            {`slot ${slot + 1}`}
          </Txt>
        ))}

        {/* The big model's one pass: reads, then predicts */}
        <Box x={L.box.x} y={L.box.y} w={L.box.w} h={L.box.h} r={6} tone="target" look={passOn ? "lit" : "line"} />
        <Txt x={L.box.x + 10} y={L.box.titleY} size={10.5} anchor="start" bold tone="target">
          big model · one prefill pass
        </Txt>
        {L.labels ? (
          <>
            <Txt x={14} y={L.readsY + L.chipH / 2} size={10.5} anchor="start" muted>reads</Txt>
            <Txt x={14} y={L.predictsY + L.chipH / 2} size={10.5} anchor="start" muted>predicts next</Txt>
          </>
        ) : null}
        {round.inputs.map((token, slot) => {
          const isText = slot === 0;
          return (
            <Box
              key={`in-${slot}`}
              x={L.col(slot)}
              y={L.readsY}
              w={L.chipW}
              h={L.chipH}
              tone={isText ? "ink" : "draft"}
              look="soft"
              label={token}
              labelSize={12}
              opacity={isText ? 1 : read}
            />
          );
        })}
        {Array.from({ length: slots }, (_, slot) => {
          const route: Pt[] = [
            [mid(slot), L.readsY + L.chipH + 2],
            [mid(slot), L.predictsY - 3],
          ];
          return <Route key={`r-${slot}`} pts={route} tone="target" on={passOn} opacity={0.4 + 0.6 * read} />;
        })}
        {scenario.predictions.map((token, slot) => {
          const dropped = round.checks[slot] === "skip";
          const own = slot === round.targetSlot;
          return (
            <Box
              key={`pred-${slot}`}
              x={L.col(slot)}
              y={L.predictsY}
              w={L.chipW}
              h={L.chipH}
              tone="target"
              look={own && kept > 0 ? "lit" : "soft"}
              label={token}
              labelSize={12}
              opacity={predicted * (dropped && kept > 0 ? 1 - 0.6 * kept : 1)}
            />
          );
        })}

        {/* Compare each prediction with the guess for the same slot */}
        {round.checks.map((check, slot) => {
          const f = compareAt(slot);
          const x = mid(slot);
          return (
            <g key={`c-${slot}`} opacity={f}>
              <Route pts={[[x, L.predictsY + L.chipH + 3], [x, L.markY - 10]]} arrow={false} tone={check === "miss" ? "bad" : check === "skip" ? "muted" : "good"} on={check !== "skip"} />
              <Route pts={[[x, L.markY + 10], [x, L.draftY - 3]]} arrow={false} tone={check === "miss" ? "bad" : check === "skip" ? "muted" : "good"} on={check !== "skip"} />
              <Mark x={x} y={L.markY} kind={check === "unused" ? "skip" : check} size={6} />
            </g>
          );
        })}

        {/* The draft model and its guesses */}
        <Box x={L.draftBox.x} y={L.draftBox.y} w={L.draftBox.w} h={L.draftBox.h} r={5} tone="draft" look={p.on("draft") ? "lit" : "soft"} label="draft model" labelSize={11} />
        {Array.from({ length: slots }, (_, slot) => {
          const token = scenario.draft[slot];
          if (token === undefined) {
            return <Box key={`g-${slot}`} x={L.col(slot)} y={L.draftY} w={L.chipW} h={L.chipH} tone="muted" look="line" dashed label="no guess" labelSize={10} />;
          }
          const shown = p.done("draft", (slot / guesses) * 0.95, ((slot + 1) / guesses) * 0.95);
          const wrong = slot === round.accepted && round.accepted < guesses;
          const after = slot >= round.accepted;
          return (
            <Box
              key={`g-${slot}`}
              x={L.col(slot)}
              y={L.draftY}
              w={L.chipW}
              h={L.chipH}
              tone="draft"
              look="soft"
              label={token}
              labelSize={12}
              strike={wrong && kept > 0}
              opacity={(shown >= 1 ? 1 : 0) * (after && kept > 0 ? 1 - 0.55 * kept : 1)}
            />
          );
        })}
        {scenario.draft.map((_, slot) => {
          const f = p.moving("draft", (slot / guesses) * 0.95, ((slot + 1) / guesses) * 0.95);
          const from: Pt = compact ? [L.col(slot) + L.chipW / 2, L.draftBox.y - 2] : [L.draftBox.x + L.draftBox.w, L.draftBox.y + L.draftBox.h / 2];
          const to: Pt = [mid(slot), L.draftY + L.chipH / 2];
          const below = L.draftY + L.chipH + 12;
          return <Packet key={`pk-${slot}`} pts={compact ? [from, [to[0], L.draftY + L.chipH + 4]] : [from, [L.col(0) - 6, below], [mid(slot), below], [mid(slot), L.draftY + L.chipH + 2]]} f={f} tone="draft" />;
        })}

        {/* The text after the round */}
        <Txt x={compact ? 12 : 14} y={L.resultY - (compact ? 12 : -L.chipH / 2)} size={10.5} anchor="start" muted>
          result
        </Txt>
        {[...PROMPT, ...round.kept].map((token, index) => {
          const added = index >= PROMPT.length;
          const own = index === PROMPT.length + round.targetSlot;
          return (
            <Box
              key={`res-${index}`}
              x={L.resultChip(index)}
              y={L.resultY}
              w={L.resultW}
              h={L.chipH}
              tone={own ? "target" : added ? "draft" : "ink"}
              look={added ? "lit" : "soft"}
              label={token}
              labelSize={compact ? 11 : 12}
              opacity={added ? kept : 1}
            />
          );
        })}

      </>
    );
  });
}

const CASES = SCENARIOS.map((scenario) => {
  const steps = narration(scenario);
  return { scenario, steps, Scene: makeScene(scenario, steps) };
});

/**
 * The centerpiece: one round for "The cat sat" with the draft "on the mat .".
 * Each column is one slot of output; the big model's prediction for a slot
 * sits right above the draft's guess for the same slot.
 */
export function OnePassCheck() {
  const [id, setId] = useState<Scenario["id"]>("miss");
  const active = CASES.find((item) => item.scenario.id === id) ?? CASES[0];
  const round = verify(active.scenario);
  return (
    <SceneFigure
      key={id}
      steps={active.steps}
      stillStep="keep"
      durationMs={14000}
      scene={active.Scene}
      wide={{ w: 660, h: 300 }}
      narrow={{ w: 360, h: 350 }}
      label={`One round of speculative decoding. Text so far: ${PROMPT.join(" ")}. The draft guesses ${active.scenario.draft.join(" ")}. The big model reads ${round.inputs.join(" ")} in one prefill pass and predicts ${active.scenario.predictions.join(", ")}. The round keeps ${round.kept.join(" ")}: ${round.kept.length} tokens from one big-model pass.`}
      toolbar={<Modes label="Example" options={SCENARIOS.map(({ id: value, label }) => ({ id: value, label, short: SHORT[value] }))} value={id} onChange={setId} />}
      caption={<>Greedy decoding: a guess passes when it matches the big model&apos;s top token.</>}
    />
  );
}
