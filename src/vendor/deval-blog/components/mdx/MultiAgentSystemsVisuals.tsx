"use client";

import { useId, useState, type ReactNode } from "react";
import { useDiagramPlayback } from "./multi-agent/useDiagramPlayback";
import { ParallelWorkDiagram } from "./multi-agent/ParallelWorkDiagram";
import { CoordinationDiagram, COORDINATION_DURATION, COORDINATION_STOPS } from "./multi-agent/CoordinationDiagram";
import { WORK_STOPS, type MergeCost } from "./multi-agent/timing";
import styles from "./MultiAgentSystemsVisuals.module.css";

type Playback = Omit<ReturnType<typeof useDiagramPlayback>, "stageRef">;

function PlaybackControls({ phases, playback }: { phases: string[]; playback: Playback }) {
  return (
    <>
      <div className={styles.phases} aria-label="Diagram stages">
        {phases.map((label, index) => (
          <button key={label} type="button" aria-current={playback.phase === index ? "step" : undefined} onClick={() => playback.select(index)}>{label}</button>
        ))}
      </div>
      <div className={styles.playback}>
        <button type="button" aria-label="Previous stage" disabled={playback.phase === 0} onClick={() => playback.select(playback.phase - 1)}><span aria-hidden="true">◀</span> Back</button>
        <button type="button" disabled={playback.reducedMotion} onClick={playback.toggle}>{playback.reducedMotion ? "Motion off" : playback.playing ? "Pause" : playback.phase === phases.length - 1 ? "Replay" : "Play"}</button>
        <button type="button" aria-label="Next stage" disabled={playback.phase === phases.length - 1} onClick={() => playback.select(playback.phase + 1)}>Next <span aria-hidden="true">▶</span></button>
      </div>
    </>
  );
}

function Diagram({ label, description, height, children }: { label: string; description: string; height: number; children: ReactNode }) {
  const descriptionId = useId();
  return (
    <svg className={styles.diagram} viewBox={`0 0 980 ${height}`} role="img" aria-label={label} aria-describedby={descriptionId} preserveAspectRatio="xMidYMid meet">
      <desc id={descriptionId}>{description}</desc>
      {children}
    </svg>
  );
}

const WORK_PHASES = ["CONTEXT", "READ", "MERGE", "COMPARE"];
const COORDINATION_PHASES = ["ASSIGN", "WORK", "CORRECTION", "RETURN"];
const BRANCHES = ["A", "B", "C", "D"];

export function ParallelWorkExplorer() {
  const [mergeCost, setMergeCost] = useState<MergeCost>(3);
  const { stageRef, ...playback } = useDiagramPlayback(WORK_STOPS, 18000, 1800);
  return (
    <figure className={`not-prose ${styles.figure}`} data-multi-agent-visual="parallel-work">
      <div className={styles.shell} ref={stageRef}>
        <div className={styles.scenarios} aria-label="Merge complexity">
          {([3, 12] as const).map(cost => <button key={cost} type="button" aria-pressed={mergeCost === cost} onClick={() => setMergeCost(cost)}>{cost === 3 ? "Small merge" : "Tangled merge"}</button>)}
        </div>
        <Diagram label="An API migration brief: split, read, and merge" description={`A hypothetical v1 to v2 API migration is researched through docs, changes, examples, and limits. Moving documents carry context to four agents and findings into one brief. Below, three schedules share a clock. One agent takes 16 units of elapsed time and 16 of active work. Four agents split sources, then one of them merges: ${mergeCost === 3 ? "8 elapsed and 23 work" : "17 elapsed and 32 work"}. Four agents each doing the whole task take 18 elapsed and 66 work including comparison. Units are illustrative; they are not benchmark measurements or token costs.`} height={614}>
          <ParallelWorkDiagram progress={playback.progress} mergeCost={mergeCost} />
        </Diagram>
        <PlaybackControls phases={WORK_PHASES} playback={playback} />
      </div>
      <figcaption>Illustrative timings. Work sums active agent time, including repeated context and merging; idle time is excluded. Try a tangled merge to see the speedup disappear. Independent full attempts may improve reliability, which this example does not model.</figcaption>
    </figure>
  );
}

export function CoordinationExplorer() {
  const { stageRef, ...playback } = useDiagramPlayback(COORDINATION_STOPS, COORDINATION_DURATION, 1800);
  return (
    <figure className={`not-prose ${styles.figure}`} data-multi-agent-visual="coordination">
      <div className={styles.shell} ref={stageRef}>
        <Diagram label="An API correction travels through two kinds of team" description="The docs agent discovers that v2 uses cursors, while the examples agent is still writing page=2. Both teams receive the same assignment. One relays the correction through a coordinator in two message hops; the other sends it directly in one. The examples agent pauses to read, replaces page=2 with cursor, then returns its result for the shared merge. Direct messaging shortens this route but still interrupts the recipient and does not remove synthesis." height={460}>
          <CoordinationDiagram progress={playback.progress} />
        </Diagram>
        <PlaybackControls phases={COORDINATION_PHASES} playback={playback} />
      </div>
      <figcaption>Direct delivery fixes the sample while the relay team is still waiting on the coordinator. One fewer handoff; both teams still combine the results.</figcaption>
    </figure>
  );
}

export function ObjectiveAmplifier() {
  return (
    <figure className={`not-prose ${styles.figure}`} data-multi-agent-visual="objective">
      <div className={styles.shell}>
        <Diagram label="A team can agree on the wrong objective" description="The intended objective points toward one outcome. A different shared objective spreads through four collaborating agents and into their combined output. Agreement among the agents does not close the gap between that output and the intended outcome." height={290}>
          <text className={styles.sectionLabel} x="42" y="55">INTENDED OBJECTIVE</text>
          <path className={styles.lane} d="M242 51H866" />
          <g className={styles.target}><circle cx="884" cy="51" r="14" /><circle cx="884" cy="51" r="5" /></g>
          <text className={styles.label} x="884" y="84" textAnchor="middle">INTENDED OUTCOME</text>
          <text className={styles.sectionLabel} x="42" y="175">SHARED OBJECTIVE</text>
          <path className={styles.lane} d="M242 171H314M414 171H455M555 171H596M696 171H735M835 171H870" />
          {[314, 455, 596, 735].map((x, index) => (
            <g key={x} className={styles.agent} data-active="true" data-tone="amber">
              <rect x={x} y="144" width="100" height="54" rx="4" />
              <text className={styles.nodeTitle} x={x + 50} y="165" textAnchor="middle">AGENT {BRANCHES[index]}</text>
              <rect className={styles.objectiveToken} x={x + 43} y="175" width="14" height="10" rx="2" />
            </g>
          ))}
          <g className={styles.wrongTarget}><circle cx="884" cy="171" r="14" /><circle cx="884" cy="171" r="5" /></g>
          <text className={styles.label} x="884" y="224" textAnchor="middle">TEAM OUTPUT</text>
          <path className={styles.gap} d="M925 51h8v120h-8" />
          <text className={styles.meta} x="948" y="115" textAnchor="middle" transform="rotate(90 948 115)">OBJECTIVE GAP</text>
        </Diagram>
      </div>
      <figcaption>Agreement within the team does not establish alignment with the intended objective.</figcaption>
    </figure>
  );
}
