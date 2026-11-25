"use client";

import { useDiagramPlayback } from "../multi-agent/useDiagramPlayback";
import { DiagramFrame } from "./DiagramFrame";
import { Packet, FlowStep } from "./DiagramSvg";
import { APPROVAL_STOPS, QUEUE_STOPS, approvalState, queueState } from "./recovery-model";
import styles from "../DurableExecutionVisuals.module.css";

export function QueueRecoveryDiagram() {
  const { stageRef, ...playback } = useDiagramPlayback(QUEUE_STOPS, 16000, 2000);
  const p = playback.progress;
  const s = queueState(p);
  const worker = s.restarted ? "Worker B" : "Worker A";
  return <DiagramFrame marker="queue" playback={playback} stageRef={stageRef} height={228}
    phases={["Queued", "Crash", "Retry", "Done"]}
    label="A thumbnail job survives its worker"
    description="A durable queue keeps job photo_42 until a worker acknowledges completion. Worker A crashes while resizing. Worker B receives the same job, restarts resizing, saves the thumbnail at the same path, and acknowledges. The queue remembers the job, not progress inside it."
    caption="A retry regenerates the same thumbnail at the same path. Animation timing is illustrative.">
    <text className={styles.sceneTitle} x="28" y="28">CREATE A THUMBNAIL</text>
    <text className={styles.small} x="772" y="28" textAnchor="end">ATTEMPT {s.restarted ? 2 : 1}</text>
    <g data-queue-pending={!s.acknowledged}>
      <text className={styles.heading} x="28" y="61">Durable queue</text>
      <rect className={styles.store} x="28" y="73" width="184" height="54" rx="3" />
      <g className={styles.job} data-tone={s.acknowledged ? "green" : "blue"}>
        <rect x="41" y="89" width="16" height="21" rx="2" />
        <path d={s.acknowledged ? "M45 100l3 3 6-7" : "M45 95h8m-8 4h8m-8 4h5"} />
      </g>
      <text className={styles.nodeTitle} x="70" y="96">photo_42</text>
      <text className={styles.small} x="70" y="114">{s.acknowledged ? "acknowledged" : "not acknowledged"}</text>
    </g>
    <path className={styles.route} d="M212 100H314M494 100H590" />
    <Packet progress={p} start={.03} end={.12} x1={212} y1={100} x2={314} y2={100} name="first-delivery" />
    <Packet progress={p} start={.42} end={.54} x1={212} y1={100} x2={314} y2={100} name="redelivery" />
    <text className={styles.small} x="263" y="89" textAnchor="middle">{s.crashed ? "redeliver" : "deliver"}</text>
    <g data-worker={worker} data-crashed={s.crashed && !s.restarted}>
      <text className={styles.heading} x="314" y="61">{worker}</text>
      <FlowStep x={314} y={73} width={180} title="Resize image" detail={s.saved ? "saved" : s.restarted ? "resize again" : s.crashed ? "crashed" : "working"}
        work={s.restarted ? s.retryWork : s.crashed ? 0 : s.firstWork} tone={s.saved ? "green" : s.crashed && !s.restarted ? "amber" : "blue"} />
      {s.crashed && !s.restarted && <path className={styles.cross} d="M484 54l8 8m-8 0l8 -8" />}
    </g>
    <Packet progress={p} start={.72} end={.78} x1={494} y1={100} x2={590} y2={100} name="save-image" tone="green" />
    <g data-thumbnail-saved={s.saved}>
      <text className={styles.heading} x="590" y="61">Output</text>
      <rect className={styles.store} x="590" y="73" width="182" height="54" rx="3" />
      <g opacity={s.saved ? 1 : .25} data-tone="green">
        <rect className={styles.imageOutline} x="604" y="86" width="38" height="28" rx="2" />
        <path className={styles.imageOutline} d="M608 110l9 -12 8 8 5 -6 8 10" />
        <circle className={styles.color} cx="633" cy="93" r="2.5" />
      </g>
      <text className={styles.nodeTitle} x="656" y="96">thumb.jpg</text>
      <text className={styles.small} x="656" y="114">{s.saved ? "saved" : "not saved"}</text>
    </g>
    <path className={styles.route} d="M404 127V152H120V127" />
    <Packet progress={p} start={.80} end={.82} x1={404} y1={127} x2={404} y2={152} name="ack-down" tone="green" />
    <Packet progress={p} start={.82} end={.88} x1={404} y1={152} x2={120} y2={152} name="ack-return" tone="green" />
    <Packet progress={p} start={.88} end={.90} x1={120} y1={152} x2={120} y2={127} name="ack-arrival" tone="green" />
    <text className={styles.small} x="262" y="170" textAnchor="middle">acknowledge after saving</text>
    <text className={styles.result} x="28" y="206" data-tone={s.acknowledged ? "green" : s.crashed && !s.restarted ? "amber" : "blue"}>
      {s.acknowledged ? "Complete · same output path" : s.restarted ? "Same job · new attempt" : s.crashed ? "Worker lost · job retained" : "Resize, save, then acknowledge"}
    </text>
    <text className={styles.small} x="772" y="206" textAnchor="end">PENDING {s.acknowledged ? 0 : 1}</text>
  </DiagramFrame>;
}

function ApprovalLane({ progress, durable, y }: { progress: number; durable: boolean; y: number }) {
  const s = approvalState(progress);
  const lost = s.crashed && !durable;
  const labels = [
    lost ? s.recovered ? "asked again" : "answer lost" : s.approved ? s.recovered ? "saved answer reused" : "approved" : "waiting for manager",
    durable && s.charged ? "$120 charged" : "not started",
    durable && s.confirmed ? "purchase confirmed" : "not started",
  ];
  const works = [lost ? 0 : s.approvalWork, durable ? s.paymentWork : 0, durable ? s.confirmationWork : 0];
  return <g data-approval-lane={durable ? "workflow" : "queue"} data-approval-requests={lost && s.recovered ? 2 : 1} data-confirmed={durable && s.confirmed}>
    <text className={styles.heading} x="28" y={y}>{durable ? "Durable workflow" : "Queue alone"}</text>
    <text className={styles.small} x="772" y={y} textAnchor="end">{s.recovered ? "WORKER B" : s.crashed ? "WORKER A CRASHED" : "WORKER A"}</text>
    {[28, 300, 572].map((x, i) => <FlowStep key={x} x={x} y={y + 14} width={200} title={["1. Approval", "2. Payment", "3. Confirm"][i]} detail={labels[i]} work={works[i]} tone={lost ? "amber" : "green"} />)}
    <path className={styles.route} d={`M228 ${y + 41}h72m200 0h72`} />
    {durable && <>
      <Packet progress={progress} start={.48} end={.52} x1={228} y1={y + 41} x2={300} y2={y + 41} name="continue-after-approval" tone="green" />
      <Packet progress={progress} start={.66} end={.70} x1={500} y1={y + 41} x2={572} y2={y + 41} name="continue-after-payment" tone="green" />
    </>}
    {!durable && <text className={styles.result} x="28" y={y + 91} data-tone={lost ? "amber" : "blue"}>
      {lost ? s.recovered ? "Waiting for the same approval again" : "No saved answer to recover" : s.approved ? "Approval held only in memory" : "Waiting for a human decision"}
    </text>}
  </g>;
}

export function DurableConceptDiagram() {
  const { stageRef, ...playback } = useDiagramPlayback(APPROVAL_STOPS, 18000, 2000);
  const p = playback.progress;
  const s = approvalState(p);
  return <DiagramFrame marker="recovery" playback={playback} stageRef={stageRef} height={350}
    phases={["Start", "Approved", "Recover", "Continue"]}
    label="Recover a purchase after its manager has approved it"
    description="Both workers receive approval and crash before payment. With just the original queue message and no saved progress, the replacement worker asks for approval again. The durable workflow records approval before the crash. Its replacement worker reads that answer, charges 120 dollars, and confirms the purchase."
    caption="Here, approval reached workflow history before the crash. A queue plus your own saved state can also recover it.">
    <text className={styles.sceneTitle} x="28" y="28">CRASH AFTER APPROVAL · RECOVER THE SAME PURCHASE</text>
    <ApprovalLane progress={p} durable={false} y={62} />
    <line className={styles.divider} x1="28" x2="772" y1="174" y2="174" />
    <ApprovalLane progress={p} durable y={202} />
    <path className={styles.route} d="M128 270V284" />
    <Packet progress={p} start={.18} end={.26} x1={128} y1={270} x2={128} y2={284} name="save-approval" tone="green" />
    <Packet progress={p} start={.40} end={.48} x1={128} y1={284} x2={128} y2={270} name="restore-approval" tone="green" />
    <g data-approval-saved={s.recorded}>
      <rect className={styles.history} x="28" y="284" width="744" height="26" rx="3" />
      <text className={styles.small} x="40" y="301">HISTORY</text>
      <text className={styles.historyValue} x="128" y="301">{s.recorded ? "approval = yes" : "awaiting approval"}</text>
      <text className={styles.small} x="760" y="301" textAnchor="end">{s.crashed ? "survives the crash" : "stored outside the worker"}</text>
    </g>
    <text className={styles.result} x="28" y="333" data-tone="green">
      {s.confirmed ? "Approved once · purchase complete" : s.recovered ? "Reuse approval · continue to payment" : s.crashed ? "Worker lost · approval recorded" : s.recorded ? "Approval saved before proceeding" : "Waiting for a human decision"}
    </text>
  </DiagramFrame>;
}
