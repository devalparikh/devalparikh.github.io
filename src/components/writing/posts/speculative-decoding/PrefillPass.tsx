"use client";

import { memo, useState } from "react";
import { PROMPT, PROMPT_PREDICTIONS, SCENARIOS } from "./model";
import { buildSteps, phases, type Step } from "./scene";
import { Modes, SceneFigure, type SceneProps } from "./SceneFigure";
import { Box, Packet, Route, Txt, tone } from "./svg";

const scenario = SCENARIOS[0];

const MODES = [
  { id: "prefill", label: "Regular prefill", short: "regular" },
  { id: "draft", label: "Prefill over the draft", short: "with the draft" },
] as const;

type Mode = (typeof MODES)[number]["id"];

const q = (token: string) => `“${token}”`;

function stepsFor(mode: Mode) {
  const draft = mode === "draft";
  return buildSteps([
    {
      id: "in",
      label: "Tokens in",
      span: 2,
      text: draft
        ? "The three tokens of the text and the four draft guesses go in together, seven tokens in all."
        : "The three prompt tokens go in together.",
    },
    {
      id: "layer1",
      label: "Layer 1",
      span: 3,
      text: "Layer 1 processes every token at the same time. Each token computes its own K and V and saves them in this layer's cache.",
    },
    {
      id: "mask",
      label: "Causal mask",
      span: 3,
      text: draft
        ? `Each token can only look at itself and the tokens before it. ${q("the")} sees ${q("The cat sat on the")}. It can't see ${q("mat")}.`
        : `Each token can only look at itself and the tokens before it. ${q("sat")} sees ${q("The")}, ${q("cat")} and itself.`,
    },
    {
      id: "layers",
      label: "Next layers",
      span: 3,
      text: "Layer 2 does the same with the vectors layer 1 produced. The layers run one after another, up to the last one.",
    },
    {
      id: "predict",
      label: "Predict",
      span: 3,
      text: "After the last layer, each token's vector goes through the output projection. Each position gets its own prediction of the next token.",
    },
    {
      id: "keep",
      label: "Keep",
      span: 3,
      text: draft
        ? `The predictions from ${q("sat")} on are kept, and the serving code compares them with the draft's guesses. ${q("first")} and ${q("is")} are discarded, as in any prefill.`
        : `Only the last prediction is used. ${q("on")} becomes the first token of the reply, and ${q("first")} and ${q("is")} are discarded.`,
    },
  ]);
}

interface Layout {
  col: (index: number) => number;
  chipW: number;
  labelX: number;
  inY: number;
  bands: { y: number; label: string }[];
  dotsY: number;
  bandX: number;
  bandW: number;
  projY: number;
  predY: number;
  noteY: number;
  grid: { x: number; y: number; cell: number; titleY: number };
}

const WIDE: Layout = {
  col: (index) => 92 + index * 52,
  chipW: 46,
  labelX: 14,
  inY: 18,
  bands: [
    { y: 70, label: "layer 1" },
    { y: 116, label: "layer 2" },
    { y: 176, label: "last layer" },
  ],
  dotsY: 160,
  bandX: 84,
  bandW: 370,
  projY: 222,
  predY: 268,
  noteY: 314,
  grid: { x: 518, y: 64, cell: 18, titleY: 22 },
};

const NARROW: Layout = {
  col: (index) => 64 + index * 41,
  chipW: 36,
  labelX: 6,
  inY: 14,
  bands: [
    { y: 62, label: "layer 1" },
    { y: 106, label: "layer 2" },
    { y: 164, label: "last" },
  ],
  dotsY: 149,
  bandX: 58,
  bandW: 296,
  projY: 208,
  predY: 252,
  noteY: 296,
  grid: { x: 126, y: 350, cell: 18, titleY: 322 },
};

function makeScene(mode: Mode, steps: Step[]) {
  const draft = mode === "draft";
  const tokens: string[] = draft ? [...PROMPT, ...scenario.draft] : [...PROMPT];
  const predictions: string[] = draft ? [...PROMPT_PREDICTIONS, ...scenario.predictions] : [...PROMPT_PREDICTIONS, scenario.predictions[0]];
  const firstUsed = PROMPT.length - 1;
  const focus = draft ? 4 : 2;

  return memo(function PrefillScene({ t, compact }: SceneProps) {
    const base = compact ? NARROW : WIDE;
    // Bands fit the tokens, but stay wide enough for the projection label.
    const bandW = Math.max(base.col(tokens.length - 1) + base.chipW + 8 - base.bandX, compact ? 140 : 300);
    const L = { ...base, bandW, grid: compact ? base.grid : { ...base.grid, x: base.bandX + bandW + 74 } };
    const p = phases(steps, t);
    const mid = (index: number) => L.col(index) + L.chipW / 2;
    const cellW = L.chipW - 8;
    const shown = p.done("in", 0, 0.5);
    const bandOn = [p.on("layer1") || p.on("mask"), p.done("layers", 0, 0.45) > 0 && p.done("layers", 0, 0.45) < 1, p.done("layers", 0.5, 0.95) > 0 && p.done("layers", 0.5, 0.95) < 1];
    const written = [p.done("layer1", 0.25, 0.6), p.done("layers", 0.1, 0.45), p.done("layers", 0.55, 0.95)];
    const maskOn = p.on("mask") || p.reached("keep");
    const predicted = p.done("predict", 0.3, 0.7);
    const keep = p.done("keep", 0, 0.5);
    const last = tokens.length - 1;
    const band1 = L.bands[0].y;

    return (
      <>
        {/* Input tokens */}
        <Txt x={L.labelX} y={L.inY + 13} size={compact ? 9.5 : 10.5} anchor="start" muted>
          {compact ? "in" : "tokens in"}
        </Txt>
        {tokens.map((token, index) => (
          <Box
            key={`in-${index}`}
            x={L.col(index)}
            y={L.inY}
            w={L.chipW}
            h={26}
            tone={index >= PROMPT.length ? "draft" : "ink"}
            label={token}
            labelSize={compact ? 11 : 12}
            opacity={shown}
          />
        ))}

        {/* Each column runs down through the layers */}
        {tokens.map((_, index) => (
          <Route key={`col-${index}`} pts={[[mid(index), L.inY + 28], [mid(index), L.projY - 3]]} arrow={false} opacity={0.8} />
        ))}

        {/* Layers: every token at once, one layer after another */}
        {L.bands.map((band, layer) => (
          <g key={band.label}>
            <Box x={L.bandX} y={band.y - 6} w={L.bandW} h={32} r={5} tone="target" look={bandOn[layer] ? "lit" : "line"} />
            <Txt x={L.labelX} y={band.y + 10} size={compact ? 9 : 10.5} anchor="start" muted={!bandOn[layer]} tone={bandOn[layer] ? "target" : undefined} bold={bandOn[layer]}>
              {band.label}
            </Txt>
            {tokens.map((_, index) => (
              <g key={index} className={tone("target")}>
                <rect x={mid(index) - cellW / 2} y={band.y} width={cellW} height={20} rx={3} className="sdv-box-ghost" />
                <rect x={mid(index) - cellW / 2} y={band.y} width={cellW} height={20} rx={3} className="sdv-box-soft" opacity={written[layer]} />
                <Txt x={mid(index)} y={band.y + 10} size={compact ? 8.5 : 9.5} muted opacity={0.4 + 0.6 * written[layer]}>
                  K V
                </Txt>
              </g>
            ))}
          </g>
        ))}
        <Txt x={L.bandX + L.bandW / 2} y={L.dotsY} size={11} muted>
          ⋮
        </Txt>

        {/* Packets: all tokens move down together */}
        {tokens.map((_, index) => (
          <Packet key={`p1-${index}`} pts={[[mid(index), L.inY + 28], [mid(index), band1 - 2]]} f={p.moving("layer1", 0, 0.25)} tone={index >= PROMPT.length ? "draft" : "ink"} />
        ))}
        {tokens.map((_, index) => (
          <Packet key={`p3-${index}`} pts={[[mid(index), L.bands[2].y + 22], [mid(index), L.projY - 2]]} f={p.moving("predict", 0, 0.3)} tone="target" />
        ))}

        {/* The causal mask inside layer 1: the focus token looks back only */}
        <g opacity={maskOn ? 1 : 0}>
          {tokens.slice(0, focus + 1).map((_, j) => {
            if (j === focus) return null;
            const x0 = mid(focus);
            const x1 = mid(j);
            const lift = 10 + (focus - j) * 4;
            return (
              <g key={`arc-${j}`} className={tone("target")}>
                <path d={`M${x0} ${band1 - 1} Q${(x0 + x1) / 2} ${band1 - lift} ${x1} ${band1 - 1}`} className="sdv-route-on" />
              </g>
            );
          })}
        </g>

        {/* Output projection, after the last layer only */}
        <Box
          x={L.bandX}
          y={L.projY}
          w={L.bandW}
          h={26}
          r={5}
          tone="target"
          look={p.on("predict") ? "lit" : "soft"}
          label={compact ? "output projection" : "output projection, after the last layer only"}
          labelSize={compact ? 10 : 10.5}
        />

        {/* One prediction per position */}
        <Txt x={L.labelX} y={L.predY + 13} size={compact ? 9.5 : 10.5} anchor="start" muted>
          {compact ? "next" : "predicts"}
        </Txt>
        {predictions.map((token, index) => {
          const used = draft ? index >= firstUsed : index === last;
          return (
            <g key={`pred-${index}`}>
              <Route pts={[[mid(index), L.projY + 28], [mid(index), L.predY - 3]]} tone="target" on={p.on("predict")} opacity={predicted} />
              <Box
                x={L.col(index)}
                y={L.predY}
                w={L.chipW}
                h={26}
                tone="target"
                look={used && keep > 0 ? "lit" : "soft"}
                label={token}
                labelSize={compact ? 11 : 12}
                strike={!used && keep > 0}
                opacity={predicted * (!used && keep > 0 ? 1 - 0.55 * keep : 1)}
              />
            </g>
          );
        })}
        <Txt x={L.col(0)} y={L.noteY} size={compact ? 10 : 10.5} anchor="start" muted opacity={keep}>
          {draft
            ? compact
              ? "from “sat” on: compared with the draft"
              : "the predictions from “sat” on are compared with the draft"
            : compact
              ? "only the last one is used"
              : "only the last prediction is used: “on”"}
        </Txt>

        {/* Who each position can see */}
        <Txt x={compact ? L.grid.x - 30 : L.grid.x - 34} y={L.grid.titleY} size={10.5} anchor="start" bold>
          who each token sees
        </Txt>
        {tokens.map((token, column) => (
          <Txt key={`gc-${column}`} x={L.grid.x + column * L.grid.cell + L.grid.cell / 2 - 1} y={L.grid.y - 10} size={8.5} muted>
            {token}
          </Txt>
        ))}
        {tokens.map((token, row) => (
          <g key={`gr-${row}`}>
            <Txt x={L.grid.x - 6} y={L.grid.y + row * L.grid.cell + 8} size={9.5} anchor="end" muted={!(maskOn && row === focus)} bold={maskOn && row === focus}>
              {token}
            </Txt>
            {tokens.map((_, column) => {
              const see = column <= row;
              const self = column === row;
              const lit = maskOn && row === focus && see;
              return (
                <g key={column} className={tone("target")}>
                  <rect
                    x={L.grid.x + column * L.grid.cell}
                    y={L.grid.y + row * L.grid.cell}
                    width={L.grid.cell - 2}
                    height={L.grid.cell - 2}
                    rx={2.5}
                    className={see ? (self || lit ? "sdv-fill-tone" : "sdv-fill-soft") : "sdv-fill-hidden"}
                    opacity={see && !self && !lit && maskOn ? 0.55 : 1}
                  />
                </g>
              );
            })}
          </g>
        ))}
      </>
    );
  });
}

const CASES = MODES.map((mode) => {
  const steps = stepsFor(mode.id);
  return { mode: mode.id, steps, Scene: makeScene(mode.id, steps) };
});

/**
 * One prefill pass, layer by layer: every token at once within a layer, each
 * token writing only its own K and V and seeing only earlier tokens, and one
 * next-token prediction per position after the last layer.
 */
export function PrefillPass({ mode: initial = "prefill" }: { mode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const active = CASES.find((item) => item.mode === mode) ?? CASES[0];
  const draft = mode === "draft";
  const tokens = draft ? [...PROMPT, ...scenario.draft] : [...PROMPT];
  return (
    <SceneFigure
      key={mode}
      steps={active.steps}
      stillStep="keep"
      durationMs={16000}
      scene={active.Scene}
      wide={{ w: 660, h: 330 }}
      narrow={{ w: 360, h: draft ? 486 : 414 }}
      label={`One prefill pass over ${tokens.join(" ")}. Each layer processes every token at once, and each token saves its own K and V. Each token sees only itself and earlier tokens. After the last layer, every position predicts a next token. ${draft ? "The predictions from sat on are compared with the draft; the first two are discarded." : "Only the last prediction, on, is used."}`}
      toolbar={<Modes label="Pass" options={MODES} value={mode} onChange={setMode} />}
      caption={
        <>
          Three of the layers are drawn; a real model has dozens. The small grid is the causal mask. A filled square
          means the token in that row can see the token in that column.
        </>
      }
    />
  );
}
