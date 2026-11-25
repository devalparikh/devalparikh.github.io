"use client";

import { useId, useState, type ReactNode } from "react";
import { useDiagramPlayback } from "./multi-agent/useDiagramPlayback";
import { DECISION_STOPS, JevDecisionDiagram } from "./jev/JevDecisionDiagram";
import { CALIBRATION_STOPS, JevCalibrationDiagram } from "./jev/JevCalibrationDiagram";
import { INFERENCE_STOPS, INFERENCE_HEIGHT, INFERENCE_DURATION, JevInferenceDiagram } from "./jev/JevInferenceDiagram";
import { JevTrainingDiagram } from "./jev/JevTrainingDiagram";
import { JevBatchDiagram } from "./jev/JevBatchDiagram";
import { BATCH_STOPS } from "./jev/batch-comparison";
import styles from "./JevVisuals.module.css";

type Playback = Omit<ReturnType<typeof useDiagramPlayback>, "stageRef">;

function PlaybackControls({ phases, playback }: { phases: string[]; playback: Playback }) {
  return <>
    <div className={styles.phases} aria-label="Diagram stages">
      {phases.map((label, index) => <button key={label} type="button" aria-current={playback.phase === index ? "step" : undefined} onClick={() => playback.select(index)}>{label}</button>)}
    </div>
    <div className={styles.playback}>
      <button type="button" aria-label="Previous stage" disabled={playback.phase === 0} onClick={() => playback.select(playback.phase - 1)}><span aria-hidden="true">◀</span> Back</button>
      <button type="button" disabled={playback.reducedMotion} onClick={playback.toggle}>{playback.reducedMotion ? "Motion off" : playback.playing ? "Pause" : playback.phase === phases.length - 1 ? "Replay" : "Play"}</button>
      <button type="button" aria-label="Next stage" disabled={playback.phase === phases.length - 1} onClick={() => playback.select(playback.phase + 1)}>Next <span aria-hidden="true">▶</span></button>
    </div>
  </>;
}

function Diagram({ label, description, height = 460, children }: { label: string; description: string; height?: number; children: ReactNode }) {
  const descriptionId = useId();
  return <svg className={styles.diagram} viewBox={`0 0 980 ${height}`} role="img" aria-label={label} aria-describedby={descriptionId} preserveAspectRatio="xMidYMid meet">
    <desc id={descriptionId}>{description}</desc>
    {children}
  </svg>;
}

export function JevBatchComparison() {
  const { stageRef, ...playback } = useDiagramPlayback(BATCH_STOPS, 24000, 2200);
  return <figure className={`not-prose ${styles.figure}`} data-jev-visual="batch">
    <div className={styles.shell} ref={stageRef}>
      <Diagram height={550} label="Classifying the same 100 tickets with Jev and a generative model" description="A projection of TypeSafe's reported demo across 100 calls, with one request in flight per model. Both queues share one clock. Jev finishes at 11.4 seconds for $0.0081; GPT-5.6 Terra finishes at 14 minutes 16.6 seconds for $1.3880. Cost increments when a call completes. Tickets and routing results are examples, not measured classifications. Playback accelerates after 20 simulated seconds.">
        <JevBatchDiagram progress={playback.progress} />
      </Diagram>
      <PlaybackControls phases={["START", "JEV DONE", "20 SEC", "BOTH DONE"]} playback={playback} />
    </div>
    <figcaption>Projection of 100 calls at <a href="https://typesafe.ai/">TypeSafe&apos;s reported time and cost</a>, one request at a time per model. Tickets and routes are examples; this is not a measured batch run. Cost counts completed calls. The clock accelerates after 20 seconds.</figcaption>
  </figure>;
}

export function JevInferenceExplorer() {
  const [baseline, setBaseline] = useState<"json" | "scores">("json");
  const { stageRef, ...playback } = useDiagramPlayback(INFERENCE_STOPS, INFERENCE_DURATION, 1800);
  return <figure className={`not-prose ${styles.figure}`} data-jev-visual="inference">
    <div className={styles.shell} ref={stageRef}>
      <div className={styles.scenarios} aria-label="Conventional model output method">
        {(["json", "scores"] as const).map(value => <button key={value} type="button" aria-pressed={baseline === value} onClick={() => setBaseline(value)}>{value === "json" ? "Generated JSON" : "Direct label scores"}</button>)}
      </div>
      <Diagram height={INFERENCE_HEIGHT} label="Generated responses versus parallel decision outputs" description={`Both models read the same export-failure ticket and answer the same three questions. ${baseline === "json" ? "The generative model uses cached autoregressive decoding to write JSON. The decision model processes field suffixes in parallel and reads probabilities through a shared language-model head." : "Both models use the same shared-prefix, parallel-suffix and label-scoring path. The distinction shown is training for text versus training for decision probabilities, not a demonstrated speed or accuracy gap."} This teaching architecture follows an open Qwen implementation, not confirmed Jev internals. Timing and probabilities are illustrative.`}>
        <JevInferenceDiagram progress={playback.progress} baseline={baseline} />
      </Diagram>
      <PlaybackControls phases={["INPUT", "PROCESS", "COMPARE", "FINISH"]} playback={playback} />
    </div>
    <figcaption>Illustrative paths based on <a href="https://huggingface.co/harshatheg/Qwen-2.5-1B-RLCD">Harsha Gundala&apos;s Qwen implementation</a>, not confirmed Jev internals. Timing and values are illustrative.</figcaption>
  </figure>;
}

export function JevTrainingComparison() {
  return <figure className={`not-prose ${styles.figure}`} data-jev-visual="training">
    <div className={styles.shell}>
      <Diagram height={475} label="Chat-model training, Jev's published objective, and an open decision model" description="InstructGPT fine-tunes GPT-3 on demonstrated responses, learns a reward from human preferences, and applies reinforcement learning. TypeSafe describes Jev as pretrained language modeling followed by RLCD, targeting calibrated decisions, with the reward recipe unpublished. Independently, Kev trains LoRA adapters and an option-scoring head on Qwen2.5-0.5B with labeled decision examples and cross-entropy. Kev is an implemented example of decision training with its own recipe.">
        <JevTrainingDiagram />
      </Diagram>
    </div>
    <figcaption>InstructGPT is one chat-training recipe. Jev&apos;s full recipe is unpublished; Kev is an independent supervised model.</figcaption>
  </figure>;
}

export function JevDecisionExplorer() {
  const [scenario, setScenario] = useState<"clear" | "mixed">("clear");
  const { stageRef, ...playback } = useDiagramPlayback(DECISION_STOPS, 18000, 1800);
  return <figure className={`not-prose ${styles.figure}`} data-jev-visual="decision">
    <div className={styles.shell} ref={stageRef}>
      <div className={styles.scenarios} aria-label="Ticket example">
        {(["clear", "mixed"] as const).map(value => <button key={value} type="button" aria-pressed={scenario === value} onClick={() => setScenario(value)}>{value === "clear" ? "Clear ticket" : "Mixed ticket"}</button>)}
      </div>
      <Diagram label="A support ticket becomes three typed answers" description={`One request carries a support ticket and three questions. Jev returns a team choice, an impact score, and the probability of an export failure. Application code routes only when the highest team probability reaches 0.80. ${scenario === "clear" ? "The clear example assigns engineering 0.92 and routes there." : "The mixed example assigns engineering 0.46 and billing 0.44, so it goes to manual review."} All numbers are invented for this example.`}>
        <JevDecisionDiagram progress={playback.progress} scenario={scenario} />
      </Diagram>
      <PlaybackControls phases={["REQUEST", "INFER", "ANSWERS", "ROUTE"]} playback={playback} />
    </div>
    <figcaption>Switch tickets to see the same routing rule handle ambiguity. Probabilities and the 80% policy threshold are illustrative. Animation speed is presentation pacing.</figcaption>
  </figure>;
}

export function JevCalibrationExplorer() {
  const [forecast, setForecast] = useState<.8 | .95>(.8);
  const { stageRef, ...playback } = useDiagramPlayback(CALIBRATION_STOPS, 18000, 1800);
  return <figure className={`not-prose ${styles.figure}`} data-jev-visual="calibration">
    <div className={styles.shell} ref={stageRef}>
      <div className={styles.scenarios} aria-label="Assigned probability">
        {([.8, .95] as const).map(value => <button key={value} type="button" aria-pressed={forecast === value} onClick={() => setForecast(value)}>{Math.round(value * 100)}% forecast</button>)}
      </div>
      <Diagram height={315} label="Calibration compares predicted probabilities with observed outcomes" description={`In this toy example, each of twenty statements has a predicted probability of ${Math.round(forecast * 100)}% of being true. Sixteen turn out true. The observed rate is 80%, ${forecast === .8 ? "matching" : "15 percentage points below"} the forecast for this group. All outcomes are invented for this explanation.`}>
        <JevCalibrationDiagram progress={playback.progress} forecast={forecast} />
      </Diagram>
      <PlaybackControls phases={["SETUP", "FORECAST", "OUTCOMES", "COMPARE"]} playback={playback} />
    </div>
    <figcaption>Invented outcomes illustrate the calibration target. Changing the forecast leaves the outcomes fixed. A small sample shows the idea; it cannot establish a model&apos;s overall calibration.</figcaption>
  </figure>;
}
