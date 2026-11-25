import type { ReactNode } from "react";
import { ACTOR_LABELS, type TraceStep } from "./trace";
import styles from "./Trace.module.css";

function Step({ step, number, visual }: { step: TraceStep; number: number; visual?: ReactNode }) {
  const expandable = step.why || step.payloads?.length || visual;
  return <li className={styles.step} data-actor={step.actor}>
    <span className={styles.number} aria-hidden="true">{number}</span>
    <div className={styles.body}>
      <p className={styles.head}>
        <span className={styles.actor}>{step.by ?? ACTOR_LABELS[step.actor]}</span>
        <span className={styles.title}>{step.title}</span>
      </p>
      <p className={styles.say}>{step.say}</p>
      {step.show && <div className={styles.showBlock}>
        {step.actor === "jev" && <span className={styles.showLabel}>Answers</span>}
        <pre className={styles.show}><code>{step.show}</code></pre>
      </div>}
      {expandable && <details className={styles.details}>
        <summary>{step.actor === "jev" ? "Request and answers" : step.payloads?.length ? "Data" : "More"}</summary>
        {step.why && <p className={styles.why}>{step.why}</p>}
        {step.payloads?.map(payload => <section key={payload.label} className={styles.payload}>
          <h5>{payload.label}</h5>
          <pre tabIndex={0} aria-label={payload.label}><code>{JSON.stringify(payload.value, null, 2)}</code></pre>
        </section>)}
        {visual}
      </details>}
    </div>
  </li>;
}

/** Numbered pipeline steps. `start` continues numbering when a list is split around other content. */
export function TraceSteps({ steps, start = 1, visuals, label }: { steps: TraceStep[]; start?: number; visuals?: Record<number, ReactNode>; label: string }) {
  return <ol className={styles.steps} start={start} aria-label={label}>
    {steps.map((step, i) => <Step key={`${start + i}-${step.title}`} step={step} number={start + i} visual={visuals?.[start + i]} />)}
  </ol>;
}
