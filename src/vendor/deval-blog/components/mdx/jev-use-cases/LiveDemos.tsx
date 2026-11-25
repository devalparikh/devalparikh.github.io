"use client";

import { useId } from "react";
import { CLIPBOARD_TEXT, DEMO_OPTIONS, GRAPH } from "@blog/lib/jev-demo";
import { PROJECT_DEMOS } from "./project-demos";
import { useLiveDemo } from "@/components/writing/blog-overrides/useLiveDemo";
import styles from "./ProjectDemo.module.css";

function DemoChoices({ legend, options, value, onChange }: { legend: string; options: Record<string, string>; value: string; onChange: (value: string) => void }) {
  const name = useId();
  return <fieldset className={styles.choices}>
    <legend>{legend}</legend>
    <div>{Object.entries(options).map(([key, label]) => <label key={key}>
      <input type="radio" name={name} value={key} checked={value === key} onChange={() => onChange(key)} />
      <span>{label}</span>
    </label>)}</div>
  </fieldset>;
}

function DemoActions({ demo }: { demo: ReturnType<typeof useLiveDemo> }) {
  return <>
    <div className={styles.resultMeta} aria-live="polite">
      {demo.view ? <span>{demo.view.mode === "sample" ? "Sample result" : demo.view.mode === "cached" ? "Cached Jev result" : "Live Jev result"}</span>
        : <span>{demo.busy ? "Waiting for Jev…" : "No live result. You can retry or use the sample."}</span>}
    </div>
    {demo.view && <details className={styles.trace}>
      <summary>How this result was chosen</summary>
      <ol>{demo.view.result.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
      {demo.view.result.trace?.map((call, i) => <div key={i}><p>Call {i + 1} · actual request and response</p>{(["state", "questions", "answers"] as const).map(key => <div key={key}><code>{key}</code><pre tabIndex={0}>{JSON.stringify(call[key], null, 2)}</pre></div>)}</div>)}
    </details>}
    <details className={styles.live}>
      <summary>Try live inference</summary>
      <DemoChoices legend="Run Jev through" options={{ vercel: "Vercel", openrouter: "OpenRouter · paid usage" }} value={demo.provider} onChange={value => demo.chooseProvider(value as "vercel" | "openrouter")} />
      <p className={styles.status} role="status">{demo.message}</p>
      <div className={styles.actions}>
        <button type="button" disabled={!demo.available || demo.busy} onClick={demo.run}>{demo.busy ? "Running…" : "Run with Jev"}</button>
        {(demo.view?.mode !== "sample" || demo.busy) && <button type="button" onClick={demo.sample}>Use sample</button>}
      </div>
    </details>
  </>;
}

export function JevClipboardDemo() {
  const demo = useLiveDemo("clipboard", "company");
  const selected = demo.view?.result.selected[0];
  const offset = selected ? CLIPBOARD_TEXT.indexOf(selected) : -1;
  const field = DEMO_OPTIONS.clipboard[demo.option as keyof typeof DEMO_OPTIONS.clipboard];
  const empty = demo.view && !selected;
  const id = useId();
  return <figure id="demo-clipboard" data-project-demo="clipboard" className={`not-prose ${styles.figure}`}>
    <div className={styles.lab}>
      <p className={styles.eyebrow}>Copied text</p>
      <p className={styles.source}>{selected && offset >= 0 ? <>{CLIPBOARD_TEXT.slice(0, offset)}<mark>{selected}</mark>{CLIPBOARD_TEXT.slice(offset + selected.length)}</> : CLIPBOARD_TEXT}</p>
      <DemoChoices legend="Paste into" options={DEMO_OPTIONS.clipboard} value={demo.option} onChange={demo.choose} />
      <div className={styles.pastePreview}>
        <label htmlFor={id}>{field}</label>
        <output id={id} aria-live="polite" data-empty={!selected}>{selected ?? (empty ? "Left empty" : demo.busy ? "Waiting for Jev…" : "No result")}</output>
      </div>
      {empty && <p className={styles.emptyNote}>{demo.view?.mode === "sample" && demo.option === "phone" ? "There’s no phone number in the copied text." : "No supported value was selected from the copied text."}</p>}
      <DemoActions demo={demo} />
    </div>
    <figcaption>{PROJECT_DEMOS.clipboard.description} Choose a field to explore the sample, or expand live inference to ask Jev.</figcaption>
  </figure>;
}

export function JevGraphDemo() {
  const demo = useLiveDemo("graph", "recycling");
  const selected = demo.view?.result.selected ?? [];
  const nodes = [{ id: "volt", x: 10, y: 70 }, { id: "cell", x: 210, y: 10 }, { id: "bank", x: 210, y: 130 }, { id: "loop", x: 410, y: 10 }];
  return <figure id="demo-graph" data-project-demo="graph" className={`not-prose ${styles.figure}`}>
    <div className={styles.lab}>
      <DemoChoices legend="Starting at Volt Motors, find a…" options={{ recycling: "Battery recycler", lender: "Lender" }} value={demo.option} onChange={demo.choose} />
      <svg className={styles.graph} viewBox="0 0 565 200" role="img" aria-label="Example graph: Volt Motors buys from CellWorks, which recycles with ReLoop. Volt Motors borrows from Civic Bank.">
        <path d="M150 94 L210 34" data-selected={selected.includes("cell")} />
        <path d="M150 94 L210 154" data-selected={selected.includes("bank")} />
        <path d="M350 34 H410" data-selected={selected.includes("loop")} />
        {nodes.map(node => <g key={node.id} transform={`translate(${node.x} ${node.y})`} data-selected={selected.includes(node.id)}><rect width="140" height="48" rx="3" /><text x="70" y="29" textAnchor="middle">{GRAPH[node.id].label}</text></g>)}
      </svg>
      {demo.view && <output className={styles.graphResult} aria-live="polite">{demo.view.result.value}</output>}
      <DemoActions demo={demo} />
    </div>
    <figcaption>{PROJECT_DEMOS.graph.description} This demo follows one branch with at most three calls; the original supports beam search. Sample paths are hand-authored.</figcaption>
  </figure>;
}
