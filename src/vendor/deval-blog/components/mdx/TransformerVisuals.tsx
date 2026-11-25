"use client";

import { useId, useState, type ReactNode } from "react";
import { useDiagramPlayback } from "./multi-agent/useDiagramPlayback";
import { TokenStatesDiagram, STATE_HEIGHT, STATE_STOPS } from "./transformer/TokenStatesDiagram";
import { AttentionDiagram, ATTENTION_HEIGHT, ATTENTION_TOKENS } from "./transformer/AttentionDiagram";
import { CacheDiagram } from "./transformer/CacheDiagram";
import { CACHE_DURATION, CACHE_HEIGHT, CACHE_STOPS } from "./transformer/cache-model";
import { OutputDiagram } from "./transformer/OutputDiagram";
import styles from "./TransformerVisuals.module.css";

type Playback = Omit<ReturnType<typeof useDiagramPlayback>, "stageRef">;

function Controls({ phases, playback }: { phases: string[]; playback: Playback }) {
  return <>
    <div className={styles.phases} aria-label="Diagram stages">
      {phases.map((label, index) => <button key={label} type="button" aria-current={playback.phase === index ? "step" : undefined} onClick={() => playback.select(index)}>{label}</button>)}
    </div>
    <div className={styles.playback}>
      <button type="button" aria-label="Previous stage" disabled={playback.phase === 0} onClick={() => playback.select(playback.phase - 1)}>◀ Back</button>
      <button type="button" disabled={playback.reducedMotion} onClick={playback.toggle}>{playback.reducedMotion ? "Motion off" : playback.playing ? "Pause" : playback.phase === phases.length - 1 ? "Replay" : "Play"}</button>
      <button type="button" aria-label="Next stage" disabled={playback.phase === phases.length - 1} onClick={() => playback.select(playback.phase + 1)}>Next ▶</button>
    </div>
  </>;
}

function Diagram({ label, description, height, children }: { label: string; description: string; height: number; children: ReactNode }) {
  const id = useId();
  return <svg className={styles.diagram} viewBox={`0 0 980 ${height}`} role="img" aria-label={label} aria-describedby={id}>
    <desc id={id}>{description}</desc>{children}
  </svg>;
}

export function TransformerStatesExplorer() {
  const { stageRef, ...playback } = useDiagramPlayback(STATE_STOPS, 18000, 1800);
  return <figure className={`not-prose ${styles.figure}`} data-transformer-visual="states">
    <div className={styles.shell} ref={stageRef}>
      <Diagram height={STATE_HEIGHT} label="Five token positions through the Transformer" description="The prompt The capital of France is has five simplified tokens. Each token has a starting embedding and one updated vector at every layer. All five final vectors remain. The last position, is, feeds the language-model head, which scores the vocabulary and selects Paris as the next token.">
        <TokenStatesDiagram progress={playback.progress} />
      </Diagram>
      <Controls phases={["TOKENS", "EMBEDDINGS", "LAYERS", "NEXT TOKEN"]} playback={playback} />
    </div>
    <figcaption>Five simplified tokens and three displayed layers. Vector coordinates and probabilities are illustrative.</figcaption>
  </figure>;
}

export function TransformerAttentionExplorer() {
  const [mode, setMode] = useState<"causal" | "bidirectional">("causal");
  const [selected, setSelected] = useState(3);
  return <figure className={`not-prose ${styles.figure}`} data-transformer-visual="attention">
    <div className={styles.shell}>
      <div className={styles.scenarios} aria-label="Attention mask">
        {(["causal", "bidirectional"] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>{value === "causal" ? "Causal" : "Bidirectional"}</button>)}
      </div>
      <div className={styles.scenarios} aria-label="Query position">
        <span className={styles.controlLabel}>Read from:</span>
        {ATTENTION_TOKENS.map((token, index) => <button key={index} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{token}</button>)}
      </div>
      <Diagram height={ATTENTION_HEIGHT} label="Which positions can this token read?" description={`The selected query is ${ATTENTION_TOKENS[selected]}. ${mode === "causal" ? `Causal attention allows ${selected + 1} of five positions: this token and earlier tokens.` : "Bidirectional attention allows all five positions."} Allowed keys receive attention weights used to mix their values. The matrix shows permission, not measured attention strength.`}>
        <AttentionDiagram mode={mode} selected={selected} />
      </Diagram>
    </div>
    <figcaption>Select a position, then change the mask. The matrix shows which positions are allowed; learned weights determine how much each contributes.</figcaption>
  </figure>;
}

export function TransformerCacheExplorer() {
  const { stageRef, ...playback } = useDiagramPlayback(CACHE_STOPS, CACHE_DURATION, 1800);
  return <figure className={`not-prose ${styles.figure}`} data-transformer-visual="cache">
    <div className={styles.shell} ref={stageRef}>
      <Diagram height={CACHE_HEIGHT} label="Prefill and decoding share the same model and extend its cache" description="Prefill processes five prompt positions and fills each layer's cache. It then selects Paris, which is not yet cached. The next pass processes Paris alone, reads the past cache, adds Paris's keys and values, and selects a period. Processing the period extends the cache to seven positions and selects an ending token. The ending token needs no further pass.">
        <CacheDiagram progress={playback.progress} />
      </Diagram>
      <Controls phases={["PREFILL", "FIRST TOKEN", "DECODE", "STOP"]} playback={playback} />
    </div>
    <figcaption>One sequence, with three layers shown. Each layer computes K/V inside attention. Timing and token boundaries are simplified; selecting a token and processing it are separate steps.</figcaption>
  </figure>;
}

export function TransformerOutputComparison() {
  return <figure className={`not-prose ${styles.figure}`} data-transformer-visual="outputs">
    <div className={styles.shell}>
      <Diagram height={315} label="Token prediction and whole-text embeddings use representations differently" description="A text-generating model selects the last position's hidden state and uses a language-model head to score possible next tokens. A dense text-embedding model pools or selects hidden states to produce a text vector for comparison. The models can have different weights and training objectives; pooling alone does not make a good semantic embedding.">
        <OutputDiagram />
      </Diagram>
    </div>
    <figcaption>These are different output tasks. Useful text embeddings depend on their training as well as how states are pooled or selected.</figcaption>
  </figure>;
}
