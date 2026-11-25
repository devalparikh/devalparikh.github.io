"use client";

import { useDiagramPlayback } from "../multi-agent/useDiagramPlayback";
import { DiagramFrame } from "./DiagramFrame";
import { Packet, Step } from "./DiagramSvg";
import { RETRY_STOPS, DURATION, retryState } from "./execution-model";
import styles from "../DurableExecutionVisuals.module.css";

function PaymentLane({ progress, deduplicate, y }: { progress: number; deduplicate: boolean; y: number }) {
  const s = retryState(progress, deduplicate);
  const retry = s.attempts === 2;
  return <g data-payment-lane={deduplicate ? "key" : "no-key"} data-attempts={s.attempts} data-charges={s.charges}>
    <text className={styles.heading} x="28" y={y}>{deduplicate ? "SAME KEY · PROVIDER DEDUPLICATES" : "NO IDEMPOTENCY KEY"}</text>
    <Step x={28} y={y + 25} width={176} title={retry ? "attempt 2" : "attempt 1"} detail={retry ? "worker B retries" : "worker A charges"} work={s.attempts ? 1 : 0} />
    <path className={styles.route} d={`M204 ${y + 51}H566M566 ${y + 81}H204`} />
    <text className={styles.small} x="385" y={y + 38} textAnchor="middle">{deduplicate ? "key: order_123:pay:v1" : "charge $120"}</text>
    <Packet progress={progress} start={.08} end={.22} x1={204} y1={y + 51} x2={566} y2={y + 51} name="first-charge" />
    <Packet progress={progress} start={.26} end={.36} x1={566} y1={y + 81} x2={380} y2={y + 81} name="lost-result" tone="amber" />
    <Packet progress={progress} start={.5} end={.64} x1={204} y1={y + 51} x2={566} y2={y + 51} name="retry-charge" />
    <Packet progress={progress} start={.66} end={.76} x1={566} y1={y + 81} x2={204} y2={y + 81} name="retry-result" tone={deduplicate ? "green" : "amber"} />
    {s.replyLost && <>
      <path className={styles.cross} d={`M374 ${y + 75}l12 12m-12 0l12 -12`} />
      <text className={styles.small} x="385" y={y + 108} textAnchor="middle">first reply lost</text>
    </>}
    <rect className={styles.store} x="566" y={y + 25} width="206" height="88" rx="3" />
    <text className={styles.small} x="582" y={y + 44}>PAYMENT PROVIDER</text>
    <text className={styles.value} x="582" y={y + 76}>${s.total}</text>
    <text className={styles.small} x="582" y={y + 98}>{s.charges === 2 ? "ch_72Q4 + ch_89R2" : s.charges ? "ch_72Q4" : "no charge"}</text>
    <text className={styles.outcome} data-tone={deduplicate ? "green" : "amber"} x="28" y={y + 146}>
      {s.resolved ? `${s.attempts} ATTEMPTS · ${s.charges} ${s.charges === 1 ? "CHARGE" : "CHARGES"}` : s.replyLost ? "CHARGED, BUT SUCCESS IS UNRECORDED" : "SAME ORDER · SAME $120 PAYMENT"}
    </text>
    <text className={styles.small} x="772" y={y + 146} textAnchor="end">{s.resolved ? deduplicate ? "original result returned" : "a second charge created" : ""}</text>
  </g>;
}

export function DurableSystemDiagram() {
  const { stageRef, ...playback } = useDiagramPlayback(RETRY_STOPS, DURATION, 1800);
  return <DiagramFrame marker="retry" playback={playback} stageRef={stageRef} height={415}
    label="Two payment attempts can produce one charge or two"
    description="The first payment succeeds but its reply is lost. Both lanes retry the same 120 dollar payment. Without idempotency the example provider creates a second charge, totaling 240 dollars. With the same retained key the provider returns the original charge, totaling 120 dollars."
    caption="Both lanes retry after an unrecorded success. The lower provider retains and enforces the same key, so attempt 2 returns ch_72Q4. This example assumes identical payment parameters and a retry within the key's retention window.">
    <PaymentLane progress={playback.progress} deduplicate={false} y={34} />
    <line className={styles.divider} x1="28" x2="772" y1="206" y2="206" />
    <PaymentLane progress={playback.progress} deduplicate y={240} />
  </DiagramFrame>;
}
