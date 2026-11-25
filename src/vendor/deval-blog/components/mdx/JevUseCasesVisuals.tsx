"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@blog/hooks/usePrefersReducedMotion";
import { useDiagramPlayback } from "./multi-agent/useDiagramPlayback";
import { Canvas } from "./jev-use-cases/drawing";
import { BrowserScene, CandidateScene } from "./jev-use-cases/Scenes";
import { STOPS } from "./jev-use-cases/model";
import styles from "./jev-use-cases/UseCases.module.css";
export { JevGlinerGraph } from "./jev-use-cases/GlinerGraph";
export { JevIncidentGraph } from "./jev-use-cases/IncidentGraph";
export { JevSearchArchitecture, JevZillowArchitecture, JevClippingArchitecture } from "./jev-use-cases/Architectures";

function Controls({ playback, phases }: { playback: Omit<ReturnType<typeof useDiagramPlayback>, "stageRef">; phases: string[] }) {
  return <><div className={styles.phases} aria-label="Diagram stages">{phases.map((phase, i) => <button type="button" key={phase} aria-current={playback.phase === i ? "step" : undefined} onClick={() => playback.select(i)}>{phase}</button>)}</div>
    <div className={styles.controls}>
      <button type="button" disabled={playback.phase === 0} onClick={() => playback.select(playback.phase - 1)}>Back</button>
      <button type="button" disabled={playback.reducedMotion} onClick={playback.toggle}>{playback.reducedMotion ? "Motion off" : playback.playing ? "Pause" : playback.progress === 1 ? "Replay" : "Play"}</button>
      <button type="button" disabled={playback.phase === 3} onClick={() => playback.select(playback.phase + 1)}>Next</button>
    </div></>;
}

export function JevCandidateExplorer() {
  const [mode, setMode] = useState<"choice" | "noul">("noul");
  const { stageRef, ...playback } = useDiagramPlayback(STOPS, 16000, 1800);
  return <figure className={`not-prose ${styles.figure}`} data-jev-use-case="candidates"><div className={styles.shell} ref={stageRef}>
    <div className={styles.tabs}>{(["noul", "choice"] as const).map(value => <button type="button" key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{value === "noul" ? "Find all matches" : "Choose one"}</button>)}</div>
    <Canvas label="Independent relevance versus one choice" description="The same page contains a cancellation fee, a refund exception, and delivery information. Independent relevance questions retain both cancellation passages. A single Choice distributes probability across alternatives and selects one winner. All values are invented." height={380}><CandidateScene progress={playback.progress} mode={mode} /></Canvas>
    <Controls playback={playback} phases={["INPUT", "JUDGE", "APPLY", "RESULT"]} />
  </div><figcaption>Illustrative probabilities and an 80% relevance threshold. Switch modes to see why one option distribution and several independent judgments support different product behaviors.</figcaption></figure>;
}

export function JevBrowserLoop() {
  const { stageRef, ...playback } = useDiagramPlayback(STOPS, 16000, 1800);
  return <figure className={`not-prose ${styles.figure}`} data-jev-use-case="browser"><div className={styles.shell} ref={stageRef}>
    <Canvas label="A browser decision followed by a fresh observation" description="The snapshot numbers the visible controls: Where from? is 1, Where to? is 2. One Jev request answers an operation Choice and a target Choice for each operation. TYPE_TEXT wins, so only type_text_target is used; index 1 resolves to the executor’s local action e1. A separate chat model returns the text Zurich, and the executor types it after confirming the page is unchanged. The fresh snapshot shows an autocomplete suggestion as the new index 2, and Where to? becomes 4." height={338}><BrowserScene progress={playback.progress} /></Canvas>
    <Controls playback={playback} phases={["OBSERVE", "JUDGE", "EXECUTE", "OBSERVE AGAIN"]} />
  </div><figcaption>One step of <a href="https://github.com/browser-use/jev-ultrafast">Browser Use’s Jev agent</a>, with an invented page. Element numbers belong to one snapshot; the next observation renumbers them.</figcaption></figure>;
}

export function JevClipPreview() {
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stop = () => setPlaying(false);
    const onVisibility = () => { if (document.hidden) stop(); };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => { if (motion.matches) stop(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); motion.removeEventListener("change", onMotion); };
  }, []);
  // Explicit playback only. A new reduced-motion preference immediately restores the still.
  const active = playing && !reduced;
  return <figure className={`not-prose ${styles.figure}`}><div ref={ref} className={styles.shell}>
    <Image unoptimized className={styles.preview} src={active ? "/img/writing/jev-use-cases/clipping-preview.gif" : "/img/writing/jev-use-cases/clipping-preview.png"} width={1000} height={560} alt="Original clipping mockup: a caching lesson becomes three timestamped candidates; the complete explanation at 02:14 to 02:41 is selected for preview." />
    <div className={styles.controls}><button type="button" disabled={reduced} aria-pressed={active} onClick={() => setPlaying(!active)}>{reduced ? "Motion off" : active ? "Pause preview" : "Play example GIF"}</button><a href="/img/writing/jev-use-cases/clipping-preview.gif" download>Download GIF</a></div>
  </div><figcaption>Original illustrated preview made for this article. Transcript, scores, and timings are example data. It is a product mockup, not a live Jev recording or a copy of another creator’s footage.</figcaption></figure>;
}
