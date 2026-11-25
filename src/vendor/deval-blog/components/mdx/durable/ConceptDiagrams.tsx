"use client";

import { useState } from "react";
import { useDiagramPlayback } from "../multi-agent/useDiagramPlayback";
import { DiagramFrame } from "./DiagramFrame";
import { TRANSFER_STOPS, transferState } from "./recovery-model";
import styles from "../DurableExecutionVisuals.module.css";

export { DurableConceptDiagram } from "./RecoveryDiagrams";

function TransferLane({ progress, atomic, crash, y }: { progress: number; atomic: boolean; crash: boolean; y: number }) {
  const s = transferState(progress, atomic, crash);
  const tone = s.partial ? "amber" : "green";
  const pending = atomic && s.debitWritten && !s.interrupted && !s.committed;
  const outcome = s.interrupted
    ? atomic ? "Aborted · neither balance changed" : "Crash leaves a partial transfer"
    : s.committed
      ? atomic ? "Both balances committed together" : "Complete · a partial state was visible"
      : s.partial ? "Alice debited · Bob not yet credited"
        : pending ? "Changes pending · readers still see $100 / $0" : "No changes committed";
  return <g data-transfer-lane={atomic ? "transaction" : "separate"} data-alice={s.alice} data-bob={s.bob} data-total={s.total} data-partial={s.partial}>
    <text className={styles.heading} x="28" y={y + 15}>{atomic ? "One transaction" : "Separate commits"}</text>
    {atomic && <rect className={styles.boundary} x="268" y={y - 8} width="348" height="66" rx="3" />}
    {[{ name: "Alice", x: 354, balance: s.alice, work: s.debitWork, written: s.debitWritten, committed: s.debitCommitted, delta: "−$40" },
      { name: "Bob", x: 530, balance: s.bob, work: s.creditWork, written: s.creditWritten, committed: s.creditCommitted, delta: "+$40" }].map(account => <g key={account.name} data-tone={account.committed ? tone : "blue"}>
      <text className={styles.balance} x={account.x} y={y + 19} textAnchor="middle">${account.balance}</text>
      <rect className={styles.progressTrack} x={account.x - 55} y={y + 29} width="110" height="2" rx="1" />
      <rect className={styles.progressFill} x={account.x - 55} y={y + 29} width={110 * account.work} height="2" rx="1" />
      <text className={styles.small} x={account.x} y={y + 47} textAnchor="middle">
        {account.committed ? `${account.delta} committed` : atomic && s.interrupted ? "rolled back" : account.written ? `${account.delta} pending` : "unchanged"}
      </text>
    </g>)}
    <text className={styles.total} x="714" y={y + 19} textAnchor="middle" data-tone={tone}>${s.total}</text>
    <text className={styles.small} x="714" y={y + 47} textAnchor="middle">{s.partial ? "$40 missing" : "balanced"}</text>
    <text className={styles.result} x="28" y={y + 72} data-tone={s.partial ? "amber" : "green"}>{outcome}</text>
  </g>;
}

export function AtomicConceptDiagram() {
  const [crash, setCrash] = useState(true);
  const { stageRef, ...playback } = useDiagramPlayback(TRANSFER_STOPS, 18000, 2000);
  return <DiagramFrame marker="atomic" playback={playback} stageRef={stageRef} height={300}
    phases={["Start", "Debit", crash ? "Crash" : "Credit", "Outcome"]}
    label="Transfer 40 dollars without exposing a partial balance change"
    description={`Alice starts with 100 dollars and Bob with zero. Each lane shows one reader snapshot. Separate commits expose 60 dollars for Alice and zero for Bob after the debit. One transaction keeps the old balances visible until both changes commit. ${crash ? "A crash leaves the separate commits with only 60 dollars total. The transaction aborts, retaining the original 100 dollars." : "Both transfers finish with 60 dollars and 40 dollars, but only the transaction avoids a partial committed state."}`}
    caption="Both accounts are in one database. Each pair shows one consistent read, with uncommitted writes hidden."
    controls={<div className={styles.scenarios} role="group" aria-label="Transfer outcome">
      <button type="button" aria-pressed={crash} onClick={() => setCrash(true)}>Crash between writes</button>
      <button type="button" aria-pressed={!crash} onClick={() => setCrash(false)}>Both writes succeed</button>
    </div>}>
    <text className={styles.sceneTitle} x="28" y="28">TRANSFER $40 · ALICE → BOB</text>
    <text className={styles.small} x="28" y="64">COMMITTED BALANCES</text>
    <text className={styles.heading} x="354" y="64" textAnchor="middle">Alice</text>
    <text className={styles.heading} x="530" y="64" textAnchor="middle">Bob</text>
    <text className={styles.heading} x="714" y="64" textAnchor="middle">Total</text>
    <line className={styles.divider} x1="28" x2="772" y1="77" y2="77" />
    <TransferLane progress={playback.progress} atomic={false} crash={crash} y={96} />
    <line className={styles.divider} x1="28" x2="772" y1="188" y2="188" />
    <TransferLane progress={playback.progress} atomic crash={crash} y={210} />
  </DiagramFrame>;
}
