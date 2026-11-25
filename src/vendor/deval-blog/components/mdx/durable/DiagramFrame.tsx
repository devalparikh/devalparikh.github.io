import { useId, type ReactNode, type RefObject } from "react";
import { useDiagramPlayback } from "../multi-agent/useDiagramPlayback";
import styles from "../DurableExecutionVisuals.module.css";

export function DiagramFrame({ label, description, height, marker, caption, playback, stageRef, controls, phases, children }: {
  label: string; description: string; height: number; marker: string; caption: string;
  playback: Omit<ReturnType<typeof useDiagramPlayback>, "stageRef">; stageRef: RefObject<HTMLDivElement | null>; controls?: ReactNode; phases?: string[]; children: ReactNode;
}) {
  const id = useId();
  return <figure className={`not-prose ${styles.figure}`} data-durable-visual={marker}>
    <div className={styles.shell} ref={stageRef}>
      {controls}
      <svg className={styles.diagram} viewBox={`0 0 800 ${height}`} role="img" aria-label={label} aria-describedby={id}>
        <desc id={id}>{description}</desc>
        {children}
      </svg>
      <DiagramControls playback={playback} phases={phases ?? PHASES[marker]} />
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}

const PHASES: Record<string, string[]> = {
  atomic: ["START", "FIRST WRITE", "FAILURE", "OUTCOME"],
  recovery: ["START", "SAVED", "RESTART", "CONTINUE"],
  retry: ["REQUEST", "LOST REPLY", "RETRY", "OUTCOME"],
  outbox: ["WRITE", "COMMIT", "CRASH", "RECOVER"],
};

function DiagramControls({ playback, phases }: { playback: Omit<ReturnType<typeof useDiagramPlayback>, "stageRef">; phases: string[] }) {
  return <div className={styles.controls}>
    <div className={styles.phases} role="group" aria-label="Diagram stages">
      {phases.map((phase, index) => <button key={phase} type="button" aria-current={playback.phase === index ? "step" : undefined} onClick={() => playback.select(index)}>{phase}</button>)}
    </div>
    <div className={styles.playback}>
      <button type="button" disabled={playback.reducedMotion} onClick={playback.toggle}>{playback.reducedMotion ? "Motion off" : playback.playing ? "Pause" : playback.progress === 1 ? "Replay" : "Play"}</button>
    </div>
  </div>;
}
