"use client";

import { useId, useState } from "react";
import { jevStep, type TraceStep } from "./trace";
import { TraceSteps } from "./TraceSteps";
import { ZILLOW_TRACE } from "./data-flows";
import { ZILLOW_COUNTS, ZILLOW_WORKLOAD, zillowBatch } from "./zillow-model";
import styles from "./DataFlow.module.css";

export function ZillowSemanticLoop() {
  const [index, setIndex] = useState(0);
  const id = useId();
  const batch = zillowBatch(index);
  const [first, second] = batch.decisions;
  const firstId = batch.state.listings[0].id;
  const lastId = batch.state.listings.at(-1)!.id;

  const steps: TraceStep[] = [
    jevStep({
      title: "Judge a batch of listings",
      say: "Each listing in the batch gets two yes/no questions: is it modern, and is it renovated?",
      show: `${first.id}_modern      ${first.modern}\n${first.id}_renovated   ${first.renovated}\n${second.id}_modern      ${second.modern}\n${second.id}_renovated   ${second.renovated}\n… ${batch.state.listings.length} listings in this request, ${firstId} to ${lastId}`,
      why: `A batch only holds as many listings as fit comfortably in one request, up to ${ZILLOW_WORKLOAD.batchSize} here, so a very large surviving set still arrives as several bounded requests instead of one that risks running over a token limit.`,
      state: batch.state, questions: batch.questions, answers: batch.answers,
    }),
    {
      actor: "code",
      title: "Keep listings that pass both",
      say: "A listing counts as a match only when both answers clear 0.8. Scores are saved with the text they came from.",
      show: `keep: ${first.id} (${first.modern}, ${first.renovated})\nexclude: ${second.id} (${second.modern}, ${second.renovated})`,
      why: `This batch's policy keeps a listing once both scores are at least ${batch.threshold}, and stores the scores alongside the description that earned them. A production search would need to set and justify its own threshold rather than reuse this teaching value.`,
      payloads: [{ label: "decisions (stays in your code)", value: batch.decisions }, { label: "batch result (stays in your code)", value: batch.output }],
    },
  ];

  return <section className={styles.loop} aria-label="Semantic evaluation batch loop">
    <p className={styles.transition}>Routing and filtering are done. The 340 remaining listings each need two judgments, 20 listings per request.</p>
    <div className={styles.batchControl}>
      <label htmlFor={id}>Inspect batch <strong>{index + 1} / {ZILLOW_COUNTS.semanticRequests}</strong></label>
      <input id={id} type="range" min={0} max={ZILLOW_COUNTS.semanticRequests - 1} step={1} value={index} onChange={event => setIndex(Number(event.target.value))} aria-valuetext={`Batch ${index + 1} of ${ZILLOW_COUNTS.semanticRequests}, request ${batch.requestNumber}`} />
    </div>
    <TraceSteps steps={steps} start={ZILLOW_TRACE.steps.length + 1} label={`Zillow search, semantic batch ${index + 1} of ${ZILLOW_COUNTS.semanticRequests}`} />
    <div className={styles.loopEnd} aria-live="polite">
      {batch.nextStart ? <>
        <p><span aria-hidden="true">↳ </span><strong>{batch.remaining} listings remain.</strong> The next batch starts at <code>{batch.nextStart}</code> and asks the same two questions.</p>
        <p>Batches continue through request {ZILLOW_COUNTS.totalScaledRequests}. Routing and filtering are not repeated.</p>
      </> : <>
        <p><strong>No batches remain. Stop calling Jev.</strong> All {ZILLOW_WORKLOAD.survivors} listings have {ZILLOW_COUNTS.semanticQuestions} stored judgments.</p>
        <p>Merge the matches from every batch and rank them.</p>
      </>}
    </div>
  </section>;
}
