"use client";

import { useState } from "react";
import { useDiagramPlayback } from "../multi-agent/useDiagramPlayback";
import { DiagramFrame } from "./DiagramFrame";
import { Packet, Step } from "./DiagramSvg";
import { OUTBOX_STOPS, DURATION, outboxState, fraction } from "./execution-model";
import styles from "../DurableExecutionVisuals.module.css";

export function OutboxPatternDiagram() {
  const [before, setBefore] = useState(false);
  const { stageRef, ...playback } = useDiagramPlayback(OUTBOX_STOPS, DURATION, 1800);
  const p = playback.progress;
  const s = outboxState(p, before);
  return <DiagramFrame marker="outbox" phases={["WRITE", before ? "UNCOMMITTED" : "COMMIT", "CRASH", "RECOVER"]} playback={playback} stageRef={stageRef} height={332}
    label="An order and its pending event share a database transaction"
    description={before ? "The transaction aborts before commit. The order stays pending, no outbox event remains, and nothing is published." : "The order becomes confirmed and event evt_123 is saved in one transaction. The worker crashes. A relay later finds the event and publishes it to fulfillment."}
    caption="The transaction saves the order and the intent to publish together. Delivery happens later, outside that transaction. A relay can publish twice if its acknowledgement is lost; fulfillment still needs duplicate handling."
    controls={<div className={styles.scenarios} aria-label="Outbox crash point">
      <button type="button" aria-pressed={!before} onClick={() => setBefore(false)}>Crash after commit</button>
      <button type="button" aria-pressed={before} onClick={() => setBefore(true)}>Crash before commit</button>
    </div>}>
    <text className={styles.heading} x="28" y="35">CONFIRM order_123</text>
    <rect className={styles.boundary} x="28" y="57" width="358" height="182" rx="3" />
    <text className={styles.small} x="44" y="79">ONE DATABASE TRANSACTION</text>
    <Step x={44} y={91} width={326} title={`order: ${s.order}`} detail={s.staged ? "confirmed · staged, not committed" : s.committed ? "confirmation committed" : "confirmation not committed"} work={s.writeWork} tone={s.committed ? "green" : "blue"} />
    <text className={styles.label} x="44" y="188">outbox event</text>
    <text x="355" y="188" textAnchor="end" className={styles.color} data-tone={s.committed ? "green" : "blue"}>{s.event}</text>
    <text className={styles.small} x="44" y="217">{s.staged ? "evt_123 · staged, not committed" : s.published ? "publication acknowledged" : s.committed ? "OrderConfirmed · pending delivery" : "no committed event"}</text>
    <path className={styles.route} d="M386 158h76m120 0h55" />
    {s.committed && <Packet progress={p} start={.56} end={.64} x1={386} y1={158} x2={462} y2={158} name="relay-read" tone="green" />}
    {s.committed && <Packet progress={p} start={.68} end={.76} x1={582} y1={158} x2={637} y2={158} name="publish-event" tone="green" />}
    <Step x={462} y={125} width={120} title="relay" detail={s.committed && p >= .56 ? "reads event" : "waiting"} work={s.committed ? fraction(p, .56, .68) : 0} />
    <Step x={637} y={125} width={135} title="fulfillment" detail={s.published ? "evt_123 received" : "no event yet"} work={s.published ? 1 : 0} tone="green" />
    {s.crashed && <>
      <path className={styles.cross} d="M413 109l12 12m-12 0l12 -12" />
      <text className={styles.small} x="421" y="95" textAnchor="middle">worker stops</text>
    </>}
    <text className={styles.outcome} x="28" y="277" data-tone={before ? "amber" : "green"}>
      {s.crashed ? s.published ? "EVENT RECOVERED AND PUBLISHED" : s.committed ? "PENDING EVENT SURVIVES THE CRASH" : "NEITHER CHANGE COMMITTED · NOTHING TO SEND" : s.committed ? "ORDER + EVENT COMMITTED TOGETHER" : "PREPARE BOTH LOCAL WRITES"}
    </text>
    <text className={styles.small} x="28" y="303">{s.crashed && !s.committed ? "order: pending · outbox: empty · fulfillment: no event" : "The database commit does not include the relay or fulfillment."}</text>
  </DiagramFrame>;
}
