"use client";

import { useId } from "react";
import { useDiagramPlayback } from "./multi-agent/useDiagramPlayback";
import { CompoundLoopDiagram } from "./compound/CompoundLoopDiagram";
import { LOOP_DURATION, LOOP_HEIGHT, LOOP_HOLD, LOOP_STOPS } from "./compound/loop-model";
import styles from "./CompoundEngineeringVisuals.module.css";

type Playback = Omit<ReturnType<typeof useDiagramPlayback>, "stageRef">;

const PHASES = ["Monday", "Overnight", "Tuesday", "Wednesday"];

const DESCRIPTION =
  "The same request, adding a film I watched to Notes (The Odyssey, then Spider-Man: Brand New Day, then the next film), runs in a new Slack thread on Monday, Tuesday and Wednesday. " +
  "Without carryover, each thread starts blank and I type the same corrections again: 2, then 3, then 3, for 8 in total. " +
  "With compounding, Monday's two corrections and a link sent to my X/Twitter DMs go into an overnight review, which keeps three steps, " +
  "cuts one one-off detail and writes add-film version 1. Tuesday's thread loads it and needs one new correction, which the next " +
  "night's review adds as version 2. Wednesday's thread needs no corrections, for 3 in total. Corrections and timing are illustrative.";

function PlaybackControls({ playback }: { playback: Playback }) {
  const last = PHASES.length - 1;
  return (
    <>
      <div className={styles.phases} aria-label="Diagram stages">
        {PHASES.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-current={playback.phase === index ? "step" : undefined}
            onClick={() => playback.select(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.playback}>
        <button
          type="button"
          aria-label="Previous stage"
          disabled={playback.phase === 0}
          onClick={() => playback.select(playback.phase - 1)}
        >
          <span aria-hidden="true">◀</span> Back
        </button>
        <button type="button" disabled={playback.reducedMotion} onClick={playback.toggle}>
          {playback.reducedMotion
            ? "Motion off"
            : playback.playing
              ? "Pause"
              : playback.phase === last
                ? "Replay"
                : "Play"}
        </button>
        <button
          type="button"
          aria-label="Next stage"
          disabled={playback.phase === last}
          onClick={() => playback.select(playback.phase + 1)}
        >
          Next <span aria-hidden="true">▶</span>
        </button>
      </div>
    </>
  );
}

export function CompoundEngineeringLoop() {
  const descriptionId = useId();
  const { stageRef, ...playback } = useDiagramPlayback(LOOP_STOPS, LOOP_DURATION, LOOP_HOLD);
  return (
    <figure className={`not-prose ${styles.figure}`} data-compound-visual="loop">
      <div className={styles.shell} ref={stageRef}>
        <svg
          className={styles.diagram}
          viewBox={`0 0 980 ${LOOP_HEIGHT}`}
          role="img"
          aria-label="The same request over three days, with and without lessons carried forward"
          aria-describedby={descriptionId}
          preserveAspectRatio="xMidYMid meet"
        >
          <desc id={descriptionId}>{DESCRIPTION}</desc>
          <CompoundLoopDiagram progress={playback.progress} />
        </svg>
        <PlaybackControls playback={playback} />
      </div>
      <figcaption>
        Illustrative example; corrections and timing are invented to show the mechanism. The
        overnight review keeps reusable steps and cuts one-off details. A wrong lesson would
        compound too, which is why that review matters.
      </figcaption>
    </figure>
  );
}
