"use client";

import { useState } from "react";
import { Canvas } from "./drawing";
import { GLINER_ENTITIES, GLINER_JUDGMENTS, GLINER_SENTENCES } from "./gliner-flow";
import styles from "./UseCases.module.css";

type Mode = "raw" | "judged";
const TARGET_Y: Record<string, number> = { meridian: 78, cascade: 160, brokerage: 242, chicago: 324 };
const STATUS_CLASS: Record<string, string> = { asserted: styles.edgeFact, hypothetical: styles.edgeHedged, forward_looking: styles.edgeHedged, negated: styles.edgeDenied };
const STATUS_LABEL: Record<string, string> = { asserted: "fact", hypothetical: "hypothetical", forward_looking: "planned", negated: "denied" };

/** Wrap a sentence at word boundaries for the monospace article column. */
function wrap(text: string, width = 40) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > width) { lines.push(line); line = word; } else line = `${line} ${word}`.trim();
  }
  return [...lines, line];
}

/** Lay out each sentence's wrapped lines, top to bottom, before rendering. */
const ARTICLE = (() => {
  let y = 70;
  return GLINER_SENTENCES.map(sentence => {
    const lines = wrap(sentence);
    const block = { sentence, lines, y };
    y += lines.length * 20 + 14;
    return block;
  });
})();
const NAMES = GLINER_ENTITIES.flatMap(entity => entity.mentions.map(mention => mention.text));

function Article() {
  return <g>
    <text x={26} y={30} className={styles.title}>Article (doc-17)</text>
    {ARTICLE.map(({ sentence, lines, y }, index) => <g key={sentence}>
      <text x={26} y={y} className={styles.small}>{`[${index + 1}]`}</text>
      {lines.map((line, i) => <text key={i} x={58} y={y + i * 20}>
        {line.split(new RegExp(`(${NAMES.join("|")})`)).map((part, j) => NAMES.includes(part) ? <tspan key={j} className={styles.blue}>{part}</tspan> : part)}
      </text>)}
    </g>)}
  </g>;
}

export function JevGlinerGraph() {
  const [mode, setMode] = useState<Mode>("judged");
  const facts = GLINER_JUDGMENTS.filter(j => mode === "raw" || j.fact);
  return <figure className={`not-prose ${styles.figure}`} data-jev-use-case="gliner-graph">
    <div className={styles.shell}>
      <div className={styles.tabs}>{(["raw", "judged"] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{value === "raw" ? "GLiNER alone" : "With Jev’s judgment"}</button>)}</div>
      <Canvas height={440} label={mode === "raw" ? "The graph GLiNER alone would build" : "The same graph with Jev's judgment on each edge"} description={mode === "raw"
        ? "GLiNER finds four relationships in the article and each one becomes an ordinary edge. Asking the graph what Northwind has done returns all four, including a sale the company denied and two deals that have not happened."
        : "Jev labels each edge with how the article presents it: the Meridian stake is a fact, the Cascade purchase is hypothetical, the brokerage sale is denied, and the Chicago terminal is planned. Asking for facts returns only the Meridian stake."}>
        <Article />
        <line x1={450} y1={20} x2={450} y2={370} className={styles.line} />
        <text x={480} y={30} className={styles.title}>{mode === "raw" ? "Graph from extraction alone" : "Graph with a status on each edge"}</text>
        <g transform="translate(480 175)"><rect width={150} height={48} rx={4} className={styles.box} /><text x={75} y={24} textAnchor="middle">Northwind</text></g>
        {GLINER_JUDGMENTS.map(j => {
          const y = TARGET_Y[j.tail];
          const edgeClass = mode === "raw" ? styles.edgeRaw : STATUS_CLASS[j.assertion];
          return <g key={j.tag} data-edge={j.tag} data-status={mode === "raw" ? "unjudged" : j.assertion}>
            <path d={`M630 199 C 665 199, 665 ${y}, 700 ${y}`} className={edgeClass} />
            <rect x={700} y={y - 22} width={174} height={44} rx={4} className={mode === "judged" && j.fact ? styles.selected : styles.box} />
            <text x={712} y={y - 6}>{j.tailName}</text>
            <text x={712} y={y + 12} className={mode === "raw" ? styles.small : j.fact ? styles.green : styles.amber}>{mode === "raw" ? j.relation : `${j.relation} · ${STATUS_LABEL[j.assertion]}`}</text>
          </g>;
        })}
        <line x1={26} y1={384} x2={874} y2={384} className={styles.line} />
        <text x={26} y={412} className={mode === "raw" ? styles.critical : `${styles.critical} ${styles.green}`}>
          {mode === "raw" ? "“What has Northwind done?” → 4 facts, 3 wrong" : `“What has Northwind done?” → ${facts.map(j => j.tailName).join(", ")} stake`}
        </text>
      </Canvas>
    </div>
    <figcaption>An article written for this example in the style of William Lyon’s fictional business-news corpus. Blue names are the spans GLiNER found. Switch views to see what a facts query returns with and without the judgment.</figcaption>
  </figure>;
}
