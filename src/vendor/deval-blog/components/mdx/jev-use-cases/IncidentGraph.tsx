"use client";

import { useState } from "react";
import { Canvas } from "./drawing";
import { FIXED_QUERY, GRAPH_EDGES, GRAPH_NODES, GRAPH_RESULT, HOP_1, HOP_2, nodeName } from "./graph-flow";
import styles from "./UseCases.module.css";

type Mode = "fixed" | "walk";
const W = 200;
const H = 46;
const AT: Record<string, [number, number]> = {
  inc4121: [16, 170], checkout: [340, 60], inc3877: [340, 170], ana: [340, 262], thread: [340, 334],
  webplat: [680, 20], gateway: [680, 110], priya: [680, 200],
};
const FIXED_PATH = new Set(["inc4121>checkout", "checkout>webplat"]);
const WINNER = new Set(["inc4121>inc3877", "inc3877>priya"]);
const BEAM = new Set(["inc4121>checkout", "checkout>gateway", "checkout>webplat", "inc3877>gateway"]);

/** Choice probability Jev gave an edge at its source node, when that node was expanded. */
function probability(from: string, to: string) {
  const request = [HOP_1, ...HOP_2].find(r => r.nodeId === from);
  const option = request?.options.find(o => o.to === to);
  if (!request || !option) return undefined;
  return (request.answers.next_edge.probabilities as Record<string, number>)[option.key];
}

export function JevIncidentGraph() {
  const [mode, setMode] = useState<Mode>("walk");
  const answerNode = mode === "fixed" ? "webplat" : "priya";
  return <figure className={`not-prose ${styles.figure}`} data-jev-use-case="incident-graph">
    <div className={styles.shell}>
      <div className={styles.tabs}>{(["fixed", "walk"] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{value === "fixed" ? "Fixed query" : "Jev walk"}</button>)}</div>
      <Canvas height={450} label={mode === "fixed" ? "A fixed Cypher pattern from incident to on-call" : "Jev's beam search from the incident"} description={mode === "fixed"
        ? `The query follows the incident to the service it affects, then to the team that owns that service, and returns ${FIXED_QUERY.returns}. That team owns checkout, but the timeouts come from a payments-gateway change.`
        : `Jev keeps two leads from the incident: the affected service at 0.46 and a similar resolved incident at 0.41. From the past incident, the edge to the person who resolved it scores 0.86, and that person passes the goal check. The answer is ${GRAPH_RESULT.path.at(-1)}, found in ${GRAPH_RESULT.calls} calls.`}>
        {GRAPH_EDGES.map(edge => {
          const key = `${edge.from}>${edge.to}`;
          const [x1, y1] = AT[edge.from];
          const [x2, y2] = AT[edge.to];
          const p = probability(edge.from, edge.to);
          const state = mode === "fixed" ? (FIXED_PATH.has(key) ? "fixed" : "idle") : WINNER.has(key) ? "winner" : BEAM.has(key) ? "beam" : "idle";
          const edgeClass = { fixed: styles.edgeHedged, winner: styles.edgeFact, beam: styles.route, idle: styles.dashed }[state];
          const mx = (x1 + W + x2) / 2;
          const my = (y1 + y2) / 2 + H / 2;
          return <g key={key} data-edge={key} data-state={state}>
            <path d={`M${x1 + W} ${y1 + H / 2} C ${mx} ${y1 + H / 2}, ${mx} ${y2 + H / 2}, ${x2} ${y2 + H / 2}`} className={edgeClass} />
            <text x={mx} y={my - 8} textAnchor="middle" className={styles.small}>{mode === "walk" && p !== undefined ? `${edge.type} ${p}` : edge.type}</text>
          </g>;
        })}
        {Object.entries(AT).map(([id, [x, y]]) => {
          const dropped = mode === "walk" && (id === "ana" || id === "thread");
          return <g key={id} transform={`translate(${x} ${y})`} opacity={dropped ? 0.45 : 1} data-node={id}>
            <rect width={W} height={H} rx={4} className={id === answerNode ? (mode === "walk" ? styles.selected : styles.box) : styles.box} />
            <text x={12} y={17}>{nodeName(id)}</text>
            <text x={12} y={34} className={styles.small}>{GRAPH_NODES[id].label === "Person" ? GRAPH_NODES[id].properties.role : GRAPH_NODES[id].label === "Team" ? `on call: ${GRAPH_NODES[id].properties.on_call}` : GRAPH_NODES[id].label}</text>
          </g>;
        })}
        <line x1={26} y1={400} x2={874} y2={400} className={styles.line} />
        <text x={26} y={428} className={mode === "fixed" ? `${styles.critical} ${styles.amber}` : `${styles.critical} ${styles.green}`}>
          {mode === "fixed" ? `→ ${FIXED_QUERY.returns}: owns checkout, not the gateway change` : `→ ${GRAPH_RESULT.path.at(-1)}, who fixed the same timeouts last month`}
        </text>
      </Canvas>
    </div>
    <figcaption>{mode === "fixed"
      ? <>The query answers the question it was written for: who owns the affected service. Here that is the wrong question.</>
      : <>Blue edges are the leads kept at each step; green is the path that passed the goal check. Faded nodes were dropped by the beam. Invented graph, following <a href="https://github.com/jexp/neo4jev">neo4jev</a>’s beam search.</>}</figcaption>
  </figure>;
}
