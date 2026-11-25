import { BATCH_MODELS, TICKET_COUNT, batchCost, batchElapsedMs, batchSnapshot, batchTime, type BatchModel } from "./batch-comparison";
import styles from "../JevVisuals.module.css";

const EXAMPLES = [
  { text: "CSV export is empty.", team: "Engineering" },
  { text: "I was charged twice.", team: "Billing" },
  { text: "I cannot reset my password.", team: "Account" },
] as const;

function BatchLane({ model, elapsedMs, y }: { model: BatchModel; elapsedMs: number; y: number }) {
  const state = batchSnapshot(model, elapsedMs);
  const active = !state.done && elapsedMs > 0;
  const latest = state.completed > 0 ? EXAMPLES[(state.completed - 1) % EXAMPLES.length].team : null;
  return <g transform={`translate(0 ${y})`} data-batch-model={model} data-completed={state.completed} data-cost-microdollars={state.costMicrodollars} data-batch-done={state.done}>
    <text className={styles.critical} x="30" y="18">{BATCH_MODELS[model].name}</text>
    {Array.from({ length: TICKET_COUNT }, (_, index) => {
      const x = 30 + index % 20 * 24;
      const rowY = 42 + Math.floor(index / 20) * 23;
      const done = index < state.completed;
      const working = active && index === state.completed;
      return <g key={index} data-tone={done ? "green" : working ? "amber" : "blue"} opacity={done || working ? 1 : .25} data-ticket-state={done ? "classified" : working ? "processing" : "queued"}>
        <title>{`Ticket ${index + 1}: ${done ? EXAMPLES[index % EXAMPLES.length].team : working ? "processing" : "queued"}`}</title>
        <rect className={styles.packet} x={x} y={rowY} width="17" height="19" rx="2" />
        {working && <rect className={styles.barFill} x={x + 2} y={rowY + 17 - state.activeProgress * 15} width="13" height={state.activeProgress * 15} />}
        <path className={styles.packetLines} d={done ? `M${x + 4} ${rowY + 10}l3 3 6-7` : `M${x + 4} ${rowY + 5}h9m-9 4h9m-9 4h6`} />
      </g>;
    })}
    <text className={styles.nodeTitle} x="550" y="49">CLASSIFIED</text>
    <text className={styles.nodeTitle} x="950" y="49" textAnchor="end">COST</text>
    <text className={styles.critical} x="550" y="81" style={{ fontSize: 25 }} fill={state.done ? "var(--diagram-green)" : undefined}>{state.completed} / {TICKET_COUNT}</text>
    <text className={styles.critical} x="950" y="81" textAnchor="end" style={{ fontSize: 25 }}>{batchCost(state.costMicrodollars)}</text>
    <rect className={styles.progressTrack} x="550" y="98" width="400" height="6" rx="2" />
    <g data-tone="green"><rect className={styles.progressFill} x="550" y="98" width={400 * state.completed / TICKET_COUNT} height="6" rx="2" /></g>
    <text className={styles.comparison} x="550" y="134" fill={state.done ? "var(--diagram-green)" : "var(--diagram-amber)"}>{state.done ? `FINISHED IN ${batchTime(state.finishMs)}` : active ? `CLASSIFYING #${String(state.completed + 1).padStart(3, "0")}` : "READY TO START"}</text>
    <text className={styles.ticketText} x="30" y="169">{latest ? `Last result: #${String(state.completed).padStart(3, "0")} → ${latest}` : "Waiting for the first classification"}</text>
  </g>;
}

export function JevBatchDiagram({ progress }: { progress: number }) {
  const elapsedMs = batchElapsedMs(progress);
  return <g data-batch-elapsed-ms={elapsedMs}>
    <text className={styles.sectionLabel} x="30" y="30">ROUTE 100 SUPPORT TICKETS</text>
    <g className={styles.node}>
      <rect x="30" y="49" width="600" height="91" rx="4" />
      {EXAMPLES.map((example, index) => <g key={example.team}>
        <text className={styles.ticketText} x="46" y={72 + index * 26}>#{String(index + 1).padStart(3, "0")} {example.text}</text>
        <text className={styles.ticketText} x="486" y={72 + index * 26}>→ {example.team}</text>
      </g>)}
    </g>
    <text className={styles.nodeTitle} x="950" y="66" textAnchor="end">ELAPSED</text>
    <text className={styles.critical} x="950" y="103" textAnchor="end" style={{ fontSize: 26 }}>{batchTime(elapsedMs)}</text>
    <BatchLane model="jev" elapsedMs={elapsedMs} y={160} />
    <line className={styles.divider} x1="30" y1="344" x2="950" y2="344" />
    <BatchLane model="llm" elapsedMs={elapsedMs} y={360} />
  </g>;
}
