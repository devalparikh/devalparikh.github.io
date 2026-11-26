"use client";

import { memo, useState } from "react";
import { timeline, type Lane, type Pass } from "./model";
import { buildSteps, phases, type Step } from "./scene";
import { Modes, SceneFigure, type SceneProps } from "./SceneFigure";
import { Txt, tone } from "./svg";

const MODES = [
  { id: "one", label: "1 request", short: "1 request", requests: 1 },
  { id: "busy", label: "16 requests at once", short: "16 at once", requests: 16 },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const ms = (value: number) => `${Math.round(value)} ms`;

function stepsFor(requests: number) {
  const { normal, speculative } = timeline(requests);
  const check = speculative.passes[speculative.passes.length - 1];
  const busy = requests > 1;
  return buildSteps([
    {
      id: "run",
      label: "Same clock",
      span: 6,
      text: busy
        ? `${requests} requests at once, each getting “on the floor”.`
        : "Normal decoding runs three big passes. Speculative decoding runs four small passes and one big pass.",
    },
    {
      id: "inside",
      label: "Inside a pass",
      span: 3.4,
      text: busy
        ? `The check pass now holds ${check.positions} positions, and its math outlasts the weight read.`
        : "The math for five positions finishes while the weights are still loading.",
    },
    {
      id: "result",
      label: "Result",
      span: 2.6,
      text: busy
        ? `About ${ms(normal.total)} against ${ms(speculative.total)}. Under this load, speculation is slower.`
        : `About ${ms(normal.total)} against ${ms(speculative.total)}.`,
    },
  ]);
}

interface Layout {
  x0: number;
  x1: number;
  lanes: [number, number];
  labelX: number;
  totalX: number;
  noteY: number;
  axisY: number;
  legendY: number;
  legendRows: boolean;
}

const WIDE: Layout = { x0: 172, x1: 644, lanes: [44, 128], labelX: 14, totalX: 160, noteY: 178, axisY: 200, legendY: 236, legendRows: false };
const NARROW: Layout = { x0: 12, x1: 348, lanes: [44, 132], labelX: 12, totalX: 348, noteY: 182, axisY: 204, legendY: 236, legendRows: true };

function makeScene(requests: number, steps: Step[]) {
  const lanes = timeline(requests);
  const end = Math.max(lanes.normal.total, lanes.speculative.total);
  const scale = end * 1.03;
  const check = lanes.speculative.passes[lanes.speculative.passes.length - 1];
  const tickStep = end > 300 ? 100 : 50;
  const ticks = Array.from({ length: Math.floor(end / tickStep) + 1 }, (_, index) => index * tickStep);

  return memo(function TimelineScene({ t, compact }: SceneProps) {
    const L = compact ? NARROW : WIDE;
    const p = phases(steps, t);
    const now = p.reached("inside") ? end : p.done("run", 0, 0.92) * end;
    const x = (value: number) => L.x0 + ((L.x1 - L.x0) * value) / scale;
    const inside = p.reached("inside");

    const bar = (pass: Pass, y: number, key: string, highlight: boolean) => {
      const fill = Math.max(0, Math.min(1, (now - pass.start) / pass.duration));
      const left = x(pass.start);
      const width = Math.max(1.5, x(pass.start + pass.duration) - left - 2);
      const shown = width * fill;
      const readW = width * (pass.read / pass.duration);
      const mathW = width * (pass.math / pass.duration);
      const draft = pass.model === "draft";
      return (
        <g key={key}>
          <clipPath id={`clip-${key}-${compact ? "n" : "w"}`}>
            <rect x={left} y={y - 2} width={shown} height={32} />
          </clipPath>
          <rect x={left} y={y} width={width} height={28} rx={3} className={highlight ? "sdv-box-ghost" : "sdv-fill-hidden"} />
          <g clipPath={`url(#clip-${key}-${compact ? "n" : "w"})`}>
            <g className={tone(draft ? "draft" : "target")}>
              <rect x={left} y={y + 5} width={readW} height={8} rx={2} className="sdv-fill-tone" />
            </g>
            <g className={tone(draft ? "draft" : "math")}>
              <rect x={left} y={y + 16} width={Math.max(1, mathW)} height={8} rx={2} className="sdv-fill-tone" opacity={draft ? 0.55 : 1} />
            </g>
          </g>
          {pass.emits.length > 0 && fill >= 0.999 ? (
            <Txt x={left + width} y={y - 9} size={compact ? 10 : 11} anchor="end">
              {pass.emits.join(" ")}
            </Txt>
          ) : null}
        </g>
      );
    };

    const lane = (data: Lane, y: number, title: string, prefix: string) => {
      const finished = now >= data.total;
      const shownTotal = Math.min(now, data.total);
      return (
        <g>
          <Txt x={L.labelX} y={compact ? y - 24 : y + 8} size={compact ? 10.5 : 11} anchor="start" bold>
            {title}
          </Txt>
          <Txt x={L.totalX} y={compact ? y - 24 : y + 22} size={compact ? 10.5 : 11} anchor="end" muted={!finished}>
            {ms(shownTotal)}
          </Txt>
          <rect x={L.x0} y={y} width={L.x1 - L.x0} height={28} rx={3} className="sdv-fill-hidden" opacity={0.5} />
          {data.passes.map((pass, index) => bar(pass, y, `${prefix}${index}`, inside && pass === check))}
        </g>
      );
    };

    const noteX = x(check.start);
    return (
      <>
        {lane(lanes.normal, L.lanes[0], "normal decoding", "n")}
        {lane(lanes.speculative, L.lanes[1], "speculative decoding", "s")}

        {/* What fills the check pass */}
        <g opacity={inside ? 1 : 0}>
          <path d={`M${noteX} ${L.lanes[1] + 32} v5 H${x(check.start + check.duration) - 2} v-5`} className="sdv-route" />
          <Txt x={Math.min(noteX, compact ? 12 : noteX)} y={L.noteY} size={compact ? 10 : 10.5} anchor="start">
            {`${check.positions} positions: math ${ms(check.math)} ${check.math < check.read ? "<" : ">"} weights ${ms(check.read)}`}
          </Txt>
        </g>

        {/* Time axis */}
        <path d={`M${L.x0} ${L.axisY} H${L.x1}`} className="sdv-route" />
        {ticks.map((tick, index) => (
          <Txt key={tick} x={x(tick)} y={L.axisY + 12} size={9.5} muted anchor={index === 0 ? "start" : "middle"}>
            {index === ticks.length - 1 ? `${tick} ms` : String(tick)}
          </Txt>
        ))}

        {/* Legend */}
        {[
          { label: "reading the weights", t: "target" as const },
          { label: "math for every position", t: "math" as const },
          { label: "small-model pass", t: "draft" as const },
        ].map((item, index) => {
          const lx = L.legendRows ? L.labelX + (index === 2 ? 0 : index * 170) : L.x0 + index * 172;
          const ly = L.legendRows ? L.legendY + (index === 2 ? 18 : 0) : L.legendY;
          return (
            <g key={item.label}>
              <g className={tone(item.t)}>
                <rect x={lx} y={ly - 5} width={10} height={10} rx={2} className="sdv-fill-tone" />
              </g>
              <Txt x={lx + 16} y={ly} size={10} anchor="start" muted>
                {item.label}
              </Txt>
            </g>
          );
        })}
      </>
    );
  });
}

const CASES = MODES.map((mode) => {
  const steps = stepsFor(mode.requests);
  return { id: mode.id, steps, Scene: makeScene(mode.requests, steps) };
});

/**
 * Where the time goes in the "on the floor" round, on one shared clock. Each
 * pass bar holds two strips: reading the weights once, and the math for every
 * position in the pass. A pass lasts as long as the longer strip.
 */
export function PassTimeline() {
  const [id, setId] = useState<ModeId>("one");
  const active = CASES.find((item) => item.id === id) ?? CASES[0];
  const lanes = timeline(MODES.find((mode) => mode.id === id)?.requests ?? 1);
  return (
    <SceneFigure
      key={id}
      steps={active.steps}
      stillStep="result"
      durationMs={12000}
      scene={active.Scene}
      wide={{ w: 660, h: 254 }}
      narrow={{ w: 360, h: 266 }}
      label={`Timing for the round that writes on the floor. Normal decoding: three big-model passes, about ${ms(lanes.normal.total)}. Speculative decoding: four small-model passes and one big-model pass, about ${ms(lanes.speculative.total)}.`}
      toolbar={<Modes label="Load" options={MODES} value={id} onChange={setId} />}
      caption={<>Rough laptop numbers, not a benchmark: a 27B model at 4 bits (16 GB), a 1.5B draft, 300 GB/s and about 10 trillion operations per second.</>}
    />
  );
}
