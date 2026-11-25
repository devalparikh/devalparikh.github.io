"use client";

import { useId, useState } from "react";
import { CACHE_CASES, CACHED_STATE, inspectCache, type CacheCase } from "./cache-model";
import styles from "./CacheExplorer.module.css";

const MODES = ["Within a request", "Across requests", "Saved answer"] as const;

function StateBlocks({ state }: { state: readonly string[] }) {
  return <>{state.map((block, i) => <g key={i}>
    <rect x={88 + i * 132} y={40} width={122} height={52} rx={3} className={block === CACHED_STATE[i] ? styles.neutral : styles.compute} />
    <text x={149 + i * 132} y={61} textAnchor="middle">{i === 3 ? "Email:" : block === "Northstar Labs." ? "Northstar" : block}</text>
    <text x={149 + i * 132} y={80} textAnchor="middle" className={styles.small}>{i === 3 ? (block.includes("new.example") ? "maya@new.example" : "maya@example.com") : block === "Northstar Labs." ? "Labs." : `block ${i + 1}`}</text>
  </g>)}</>;
}

function KVRows({ prefixLength }: { prefixLength: number }) {
  return <>{["layer 1", "layer 2", "layer L"].map((label, row) => <g key={label}>
    <text x={12} y={143 + row * 34} className={styles.small}>{label}</text>
    {CACHED_STATE.map((_, i) => <g key={i} data-cache-status={i < prefixLength ? "reuse" : "compute"}>
      <rect x={88 + i * 132} y={124 + row * 34} width={122} height={28} rx={3} className={i < prefixLength ? styles.reuse : styles.compute} />
      <text x={149 + i * 132} y={143 + row * 34} textAnchor="middle">{i < prefixLength ? "K V · reuse" : "K V · new"}</text>
    </g>)}
  </g>)}</>;
}

export function JevCacheExplorer() {
  const [mode, setMode] = useState(0);
  const [example, setExample] = useState<CacheCase>("question");
  const id = useId();
  const current = inspectCache(example);
  const prefixLength = mode === 0 ? 4 : current.prefixLength;
  const summary = mode === 0
    ? "One state prefill supplies three independent question branches. Each branch still computes attention and an answer."
    : mode === 1
      ? `${prefixLength} of 4 state blocks reused. ${prefixLength === 4 ? "The question is still evaluated." : "From the first edit onward, state K/V must be recomputed, even where later text is unchanged."}`
      : current.resultHit
        ? "Exact match: return the saved answer. No new model evaluation."
        : "Cache miss: the complete request changed. Evaluate it again, even if the answer happens to stay the same.";

  return <figure className={`not-prose ${styles.figure}`} aria-label="Caching within and across requests">
    <div className={styles.modes} aria-label="Cache scope">
      {MODES.map((label, i) => <button type="button" key={label} aria-pressed={mode === i} onClick={() => { setMode(i); setExample(i === 2 ? "same" : "question"); }}>{label}</button>)}
    </div>
    <div className={styles.canvas}>
      {mode !== 0 && <label className={styles.control}>Next request
        <select value={example} onChange={event => setExample(event.target.value as CacheCase)}>
          {Object.entries(CACHE_CASES).map(([value, item]) => <option value={value} key={value}>{item.label}</option>)}
        </select>
      </label>}
      <svg viewBox="0 0 640 354" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{`${MODES[mode]}: ${summary}`}</title>
        <desc id={`${id}-desc`}>A synthetic Smart Paste passage is grouped into four text blocks. Green cells reuse stored keys and values; amber cells require new computation. The model, instructions, candidate schema, and cache lifetime are held fixed.</desc>
        <text x={12} y={24} className={styles.label}>{mode === 0 ? "STATE → PREFILL ONCE" : "NEXT REQUEST · STATE"}</text>
        <StateBlocks state={mode === 0 ? CACHED_STATE : current.state} />
        {mode !== 2 ? <>
          <text x={88} y={115} className={styles.small}>{mode === 0 ? "Each attention layer keeps its own K/V" : "Retained prefix K/V → compute from the first changed block"}</text>
          <KVRows prefixLength={prefixLength} />
          {mode === 0 ? <>
            {[115, 320, 525].map(x => <path key={x} d={`M 350 220 V 233 H ${x} V 250`} className={styles.route} />)}
            {[['Name?', 'Maya Chen'], ['Company?', 'Northstar Labs'], ['Email?', 'maya@example.com']].map(([question, answer], i) => <g key={question}>
              <rect x={20 + i * 205} y={250} width={190} height={73} rx={3} className={styles.compute} />
              <text x={115 + i * 205} y={272} textAnchor="middle">{question}</text>
              <text x={115 + i * 205} y={294} textAnchor="middle" className={styles.small}>attention + readout</text>
              <text x={115 + i * 205} y={313} textAnchor="middle" className={styles.small}>{answer}</text>
            </g>)}
            <text x={320} y={345} textAnchor="middle" className={styles.label}>SHARED K/V · SEPARATE ANSWERS</text>
          </> : <>
            <path d="M 350 220 V 242" className={styles.route} />
            <rect x={88} y={242} width={518} height={64} rx={3} className={styles.compute} />
            <text x={347} y={265} textAnchor="middle">{current.question}</text>
            <text x={347} y={290} textAnchor="middle" className={styles.small}>new attention + readout → {current.answer}</text>
            <text x={320} y={339} textAnchor="middle" className={styles.label}>{`${prefixLength}/4 STATE BLOCKS REUSED · QUESTION STILL RUNS`}</text>
          </>}
        </> : <>
          <text x={88} y={120}>{current.question}</text>
          <rect x={88} y={140} width={518} height={42} rx={3} className={current.resultHit ? styles.reuse : styles.compute} />
          <text x={347} y={167} textAnchor="middle">{current.resultHit ? "Complete request matches saved key" : "Complete request differs from saved key"}</text>
          <path d={current.resultHit ? "M 347 182 V 200 H 168 V 218" : "M 347 182 V 200 H 474 V 218"} className={styles.route} />
          <rect x={88} y={218} width={160} height={45} rx={3} className={current.resultHit ? styles.reuse : styles.idle} />
          <text x={168} y={246} textAnchor="middle">saved answer</text>
          <rect x={342} y={218} width={264} height={45} rx={3} className={current.resultHit ? styles.idle : styles.compute} />
          <text x={474} y={246} textAnchor="middle">{current.resultHit ? "model skipped" : "model evaluates request"}</text>
          <path d={current.resultHit ? "M 168 263 V 283 H 347 V 300" : "M 474 263 V 283 H 347 V 300"} className={styles.route} />
          <text x={347} y={321} textAnchor="middle" className={styles.label}>{`${current.resultHit ? "CACHED" : "NEW"} RESULT → ${current.answer}`}</text>
          <text x={347} y={345} textAnchor="middle" className={styles.small}>code validates candidate → copies the source span</text>
        </>}
      </svg>
      <p className={styles.summary} role="status">{summary}</p>
    </div>
    <figcaption>A conceptual causal Transformer and an app result cache, with illustrative answers. Text blocks group tokens for readability; they are not actual cache pages or measured work units. Across-request mode retains only the state’s K/V and assumes a compatible cache is available. Jev’s internal layout and retention policy are not published.</figcaption>
  </figure>;
}
