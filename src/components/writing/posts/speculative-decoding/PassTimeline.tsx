"use client";

import { useId, useState } from "react";
import { Choice, PlaybackControls } from "./Controls";
import { timeline, type Lane } from "./model";
import { usePlayback } from "./usePlayback";
import "./figures.css";

const MODES = [
  { id: "one", label: "1 request", requests: 1 },
  { id: "busy", label: "16 requests at once", requests: 16 },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const STOPS = [0.5, 1] as const;
const STOP_LABELS = ["Midway", "Finished"] as const;

const ms = (value: number) => `${Math.round(value)} ms`;

function niceTicks(max: number) {
  const step = max > 300 ? 100 : 50;
  const ticks: number[] = [];
  for (let value = 0; value <= max; value += step) ticks.push(value);
  return ticks;
}

function LaneRow({ title, lane, now, scale }: { title: string; lane: Lane; now: number; scale: number }) {
  const finished = now >= lane.total;
  const emitted = lane.passes.filter((pass) => now >= pass.start + pass.duration).flatMap((pass) => pass.emits);
  const targetPasses = lane.passes.filter((pass) => pass.model === "target").length;
  const draftPasses = lane.passes.length - targetPasses;
  return (
    <div className="sdv-lane">
      <div className="sdv-lane-head">
        <span className="sdv-lane-title">{title}</span>
        <span className="sdv-lane-meta">
          {targetPasses} big {targetPasses === 1 ? "pass" : "passes"}
          {draftPasses > 0 && ` + ${draftPasses} small`}
        </span>
      </div>
      <div className="sdv-track">
        {lane.passes.map((pass, index) => {
          const left = (pass.start / scale) * 100;
          const width = (pass.duration / scale) * 100;
          const fill = Math.max(0, Math.min(1, (now - pass.start) / pass.duration));
          return (
            <div
              key={index}
              className="sdv-bar"
              data-model={pass.model}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${pass.model === "target" ? "Big" : "Small"} model pass over ${pass.positions} position${pass.positions === 1 ? "" : "s"}: reading weights ${ms(pass.read)}, math ${ms(pass.math)}`}
            >
              <span className="sdv-bar-clip" style={{ width: `${fill * 100}%` }}>
                <span className="sdv-strip sdv-strip-read" style={{ width: `${(pass.read / pass.duration) * 100 / Math.max(fill, 1e-6)}%` }} />
                <span className="sdv-strip sdv-strip-math" style={{ width: `${(pass.math / pass.duration) * 100 / Math.max(fill, 1e-6)}%` }} />
              </span>
              {pass.emits.length > 0 && now >= pass.start + pass.duration && (
                <span className="sdv-bar-emit">{pass.emits.join(" ")}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="sdv-lane-foot">
        <span>{emitted.length} of {lane.tokens.length} tokens</span>
        <span className="sdv-mono">{finished ? ms(lane.total) : ms(Math.min(now, lane.total))}</span>
      </div>
    </div>
  );
}

/**
 * Where the time goes in the "on the floor" round. Each big-model bar holds
 * two strips on the same clock: reading the weights once and doing the math
 * for every position in the pass. The pass lasts as long as the longer one.
 */
export function PassTimeline() {
  const [modeId, setModeId] = useState<ModeId>("one");
  const mode = MODES.find((item) => item.id === modeId) ?? MODES[0];
  const lanes = timeline(mode.requests);
  const end = Math.max(lanes.normal.total, lanes.speculative.total);
  const scale = end * 1.04;
  const { ref: stageRef, ...playback } = usePlayback(STOPS, 9000, 3600);
  const now = playback.progress * end;
  const captionId = useId();
  const ratio = lanes.normal.total / lanes.speculative.total;
  const done = playback.progress >= 1;
  const check = lanes.speculative.passes[lanes.speculative.passes.length - 1];

  return (
    <figure className="not-prose sdv-figure" aria-describedby={captionId}>
      <div className="sdv-stage" ref={stageRef}>
        <div className="sdv-toolbar">
          <Choice
            label="Load"
            options={MODES}
            value={modeId}
            onChange={(id) => {
              setModeId(id);
              playback.restart();
            }}
          />
        </div>

        <LaneRow title="Normal decoding" lane={lanes.normal} now={now} scale={scale} />
        <LaneRow title="Speculative decoding" lane={lanes.speculative} now={now} scale={scale} />

        <div className="sdv-axis" aria-hidden="true">
          {niceTicks(end).map((tick, index, ticks) => (
            <span key={tick} style={{ left: `${(tick / scale) * 100}%` }}>
              {index === ticks.length - 1 ? `${tick} ms` : tick}
            </span>
          ))}
        </div>

        <div className="sdv-legend" aria-hidden="true">
          <span><i data-strip="read" /> reading the weights</span>
          <span><i data-strip="math" /> math for every position</span>
          <span><i data-strip="draft" /> small-model pass</span>
        </div>

        <p className="sdv-step">
          {done
            ? ratio >= 1
              ? `The check pass reads ${check.positions} positions. Its math (${ms(check.math)}) still fits inside the ${ms(check.read)} weight read, so 3 tokens cost about one pass: ${ratio.toFixed(1)}x faster here.`
              : `Batched, the check pass holds ${check.positions} positions. Its math (${ms(check.math)}) now outlasts the weight read, so the extra positions cost real time: ${(1 / ratio).toFixed(1)}x slower here.`
            : "Same three tokens, “on the floor”, on one shared clock."}
        </p>

        <PlaybackControls
          stops={STOP_LABELS}
          phase={playback.phase}
          playing={playback.playing}
          progress={playback.progress}
          reducedMotion={playback.reducedMotion}
          onSelect={playback.select}
          onToggle={playback.toggle}
        />
        <p className="sr-only">
          {`${mode.label}. Normal decoding: 3 big-model passes, ${ms(lanes.normal.total)}. Speculative decoding: 4 small-model passes and 1 big-model pass, ${ms(lanes.speculative.total)}.`}
        </p>
      </div>
      <figcaption id={captionId}>
        A round in the middle of a generation: the cache already holds the text and “sat” was just chosen, so each
        normal step reads one token and the check pass reads “sat” plus four guesses. Rough arithmetic for a laptop
        GPU, not a benchmark: a 27B model at 4 bits (about 16 GB) and a 1.5B draft
        (about 0.9 GB), 300 GB/s of memory bandwidth and about 10 trillion math operations per second. A pass lasts
        as long as the slower of its two strips. With 16 requests, each one is assumed to get the same three tokens.
      </figcaption>
    </figure>
  );
}
