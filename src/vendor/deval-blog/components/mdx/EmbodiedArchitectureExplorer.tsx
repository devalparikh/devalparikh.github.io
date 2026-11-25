"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";

type ModelKey = "vat" | "vla" | "wam";
type RunMode = "training" | "inference";

type Stage = {
  label: string;
  detail: string;
};

const models = {
  vat: {
    short: "VAT",
    name: "Vision-Action Transformer",
    formula: "see → act",
    accent: "#55bde8",
    parchmentAccent: "#1f6886",
    input: "frames + robot state",
    output: "next action / action chunk",
  },
  vla: {
    short: "VLA",
    name: "Vision-Language-Action",
    formula: "see + instruction → act",
    accent: "#e69a68",
    parchmentAccent: "#934b20",
    input: "instruction + frames + optional state",
    output: "next action / action chunk",
  },
  wam: {
    short: "WAM",
    name: "World-Action Model",
    formula: "see → model futures + act",
    accent: "#84bd83",
    parchmentAccent: "#376c3e",
    input: "frames + optional instruction / state",
    output: "future states + future actions",
  },
} as const;

const modelKeys = Object.keys(models) as ModelKey[];

const trainingStages: Stage[] = [
  {
    label: "Sample",
    detail: "Sample a short observation window and its later demonstrated targets from one or more trajectories.",
  },
  {
    label: "Condition",
    detail: "Package recent frames and, when the architecture uses them, robot state and a task instruction.",
  },
  {
    label: "Forward pass",
    detail: "Run the condition through the transformer and its action or world-action heads.",
  },
  {
    label: "Predict",
    detail: "Produce the action prediction; a WAM also learns to predict future visual states or video.",
  },
  {
    label: "Update",
    detail: "Compare predictions with demonstrated targets, backpropagate the loss, and update the weights.",
  },
];

const inferenceStages: Stage[] = [
  {
    label: "Observe",
    detail: "Read the latest camera window and any robot state used by the policy.",
  },
  {
    label: "Run policy",
    detail: "Encode the current condition and run one policy forward pass.",
  },
  {
    label: "Predict",
    detail: "Predict the next action chunk; a full WAM may also roll out possible future observations.",
  },
  {
    label: "Execute",
    detail: "Send the action to the controller, receive a new observation, and repeat the closed loop.",
  },
];

const framePositions = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];
const frameLabels = ["approach cup", "grasp cup", "carry cup", "place cup"];

function TrajectoryStrip({ future = false, historyEndsBeforeFuture = false }: { future?: boolean; historyEndsBeforeFuture?: boolean }) {
  const frames = future ? [2, 3] : historyEndsBeforeFuture ? [0, 1] : [0, 1, 2, 3];

  return (
    <div className="eae-frames" data-future={future} aria-label={future ? "Predicted future frames" : "Recent robot camera frames"}>
      {frames.map((frame, index) => (
        <div
          className="eae-frame"
          key={`${future ? "future" : "history"}-${frame}`}
          role="img"
          aria-label={future ? `Predicted frame ${index + 1}: ${frameLabels[frame]}` : `Observation ${index + 1}: ${frameLabels[frame]}`}
          style={{ backgroundPosition: framePositions[frame] }}
        >
          <span>{future ? `t+${index + 1}` : `t${index === frames.length - 1 ? "" : `−${frames.length - 1 - index}`}`}</span>
        </div>
      ))}
    </div>
  );
}

function ActionChunk({ compact = false }: { compact?: boolean }) {
  return (
    <div className="eae-action" data-compact={compact} aria-label="Predicted robot action chunk">
      <div><span>Δx</span><b>+0.08</b></div>
      <div><span>Δy</span><b>−0.03</b></div>
      <div><span>rot</span><b>+0.12</b></div>
      <div><span>grip</span><b>open</b></div>
    </div>
  );
}

function ModelCore({ model, active }: { model: ModelKey; active: boolean }) {
  return (
    <div className="eae-core" data-active={active}>
      <div className="eae-core-grid" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => <i key={index} />)}
      </div>
      <span>{models[model].short}</span>
      <strong>{models[model].name}</strong>
      <div className="eae-layers" aria-hidden="true"><i /><i /><i /><i /></div>
      <small>{model === "wam" ? "shared world + action representation" : "transformer policy"}</small>
    </div>
  );
}

export function EmbodiedArchitectureExplorer() {
  const explorerId = useId().replace(/:/g, "");
  const panelId = `${explorerId}-panel`;
  const getModelTabId = (key: ModelKey) => `${explorerId}-tab-${key}`;
  const [model, setModel] = useState<ModelKey>("vat");
  const [mode, setMode] = useState<RunMode>("training");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const stages = useMemo(() => mode === "training" ? trainingStages : inferenceStages, [mode]);
  const current = models[model];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPlaying(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setStep((value) => (value + 1) % stages.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion, stages.length, model, mode]);

  const selectModel = (next: ModelKey) => {
    setModel(next);
    setStep(0);
  };

  const handleModelTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, key: ModelKey) => {
    const currentIndex = modelKeys.indexOf(key);
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % modelKeys.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + modelKeys.length) % modelKeys.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = modelKeys.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const next = modelKeys[nextIndex];
    selectModel(next);
    window.requestAnimationFrame(() => document.getElementById(getModelTabId(next))?.focus());
  };

  const selectMode = (next: RunMode) => {
    setMode(next);
    setStep(0);
  };

  const inputActive = mode === "training" ? step <= 1 : step === 0;
  const coreActive = mode === "training" ? step === 2 : step === 1;
  const outputActive = mode === "training" ? step === 3 : step >= 2;
  const lossActive = mode === "training" && step === 4;
  const style = {
    "--eae-accent-dark": current.accent,
    "--eae-accent-light": current.parchmentAccent,
  } as CSSProperties;

  return (
    <figure className="eae not-prose" data-mode={mode} style={style}>
      <style>{`
        .eae {
          --eae-accent: var(--eae-accent-dark);
          --eae-border: color-mix(in oklab, var(--color-base-content) 13%, transparent);
          --eae-muted: color-mix(in oklab, var(--color-base-content) 58%, transparent);
          --eae-soft: color-mix(in oklab, var(--color-base-content) 6%, transparent);
          margin: 3rem 0;
          overflow: hidden;
          border: 1px solid var(--eae-border);
          border-radius: 1.35rem;
          background:
            radial-gradient(circle at 10% -10%, color-mix(in oklab, var(--eae-accent) 13%, transparent), transparent 21rem),
            linear-gradient(180deg, color-mix(in oklab, var(--color-base-200) 88%, transparent), color-mix(in oklab, var(--color-base-100) 92%, transparent));
          box-shadow: 0 24px 80px rgb(0 0 0 / .16), inset 0 1px 0 rgb(255 255 255 / .04);
          color: var(--color-base-content);
          font-family: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
        }
        [data-theme="parchment"] .eae {
          --eae-accent: var(--eae-accent-light);
          --eae-border: rgb(30 26 22 / .12);
          --eae-muted: #6b6560;
          --eae-soft: rgb(30 26 22 / .05);
          box-shadow: 0 18px 52px rgb(38 31 24 / .08), inset 0 1px 0 rgb(255 255 255 / .8);
        }
        .eae button {
          font-family: inherit;
        }
        .eae-top {
          display: grid;
          gap: 1rem;
          padding: clamp(1rem, 3vw, 1.4rem);
          border-bottom: 1px solid var(--eae-border);
        }
        .eae-kicker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .eae-kicker span {
          color: var(--eae-muted);
          font-size: .67rem;
          font-weight: 800;
          letter-spacing: .17em;
          text-transform: uppercase;
        }
        .eae-kicker strong {
          color: var(--eae-accent);
          font-size: .72rem;
          letter-spacing: -.01em;
        }
        .eae-model-tabs,
        .eae-mode-tabs {
          display: flex;
          gap: .35rem;
          padding: .28rem;
          border: 1px solid var(--eae-border);
          border-radius: .8rem;
          background: color-mix(in oklab, var(--color-base-100) 74%, transparent);
        }
        .eae-model-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .eae-model-tab,
        .eae-mode-tab,
        .eae-play,
        .eae-step {
          border: 0;
          cursor: pointer;
          color: var(--eae-muted);
        }
        .eae-model-tab,
        .eae-mode-tab {
          border-radius: .58rem;
          background: transparent;
          transition: color 180ms ease, background 180ms ease, transform 160ms cubic-bezier(.2,.8,.2,1), box-shadow 180ms ease;
        }
        .eae-model-tab {
          padding: .7rem .65rem;
          text-align: left;
        }
        .eae-model-tab b,
        .eae-model-tab small {
          display: block;
        }
        .eae-model-tab b {
          color: inherit;
          font-size: .82rem;
          letter-spacing: .02em;
        }
        .eae-model-tab small {
          margin-top: .18rem;
          overflow: hidden;
          color: var(--eae-muted);
          font-size: .64rem;
          line-height: 1.2;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .eae-model-tab[aria-selected="true"],
        .eae-mode-tab[aria-pressed="true"] {
          color: var(--color-base-content);
          background: color-mix(in oklab, var(--eae-accent) 14%, var(--color-base-200));
          box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--eae-accent) 38%, transparent), 0 5px 14px rgb(0 0 0 / .08);
        }
        .eae-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .8rem;
        }
        .eae-mode-tab {
          padding: .48rem .72rem;
          font-size: .72rem;
          font-weight: 800;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .eae-play {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          min-height: 2.1rem;
          padding: .45rem .7rem;
          border: 1px solid var(--eae-border);
          border-radius: .65rem;
          background: transparent;
          font-size: .7rem;
          font-weight: 800;
          transition: color 180ms ease, border-color 180ms ease, transform 160ms cubic-bezier(.2,.8,.2,1);
        }
        .eae-play i {
          width: .48rem;
          height: .48rem;
          border-radius: 50%;
          background: var(--eae-accent);
          box-shadow: 0 0 0 .22rem color-mix(in oklab, var(--eae-accent) 15%, transparent);
        }
        .eae-play[data-playing="true"] i {
          animation: eae-pulse 1.8s ease-in-out infinite;
        }
        .eae-manual-mode {
          color: var(--eae-muted);
          font-size: .7rem;
          font-weight: 800;
          letter-spacing: .02em;
        }
        .eae-formula {
          margin: 0;
          color: var(--color-base-content);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: clamp(.78rem, 2vw, .9rem);
          font-weight: 700;
          letter-spacing: -.025em;
        }
        .eae-steps {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: .35rem;
          padding: .75rem clamp(1rem, 3vw, 1.4rem);
          border-bottom: 1px solid var(--eae-border);
        }
        .eae[data-mode="inference"] .eae-steps {
          grid-template-columns: repeat(4, 1fr);
        }
        .eae-step {
          position: relative;
          min-width: 0;
          padding: .35rem .25rem .5rem;
          background: transparent;
          font-size: .65rem;
          font-weight: 800;
          text-align: left;
          transition: color 180ms ease;
        }
        .eae-step::after {
          content: "";
          position: absolute;
          right: .25rem;
          bottom: 0;
          left: .25rem;
          height: 2px;
          border-radius: 999px;
          background: var(--eae-border);
          transform: scaleX(.25);
          transform-origin: left;
          transition: background 180ms ease, transform 320ms cubic-bezier(.2,.8,.2,1);
        }
        .eae-step[data-state="complete"],
        .eae-step[data-state="active"] {
          color: var(--color-base-content);
        }
        .eae-step[data-state="complete"]::after,
        .eae-step[data-state="active"]::after {
          background: var(--eae-accent);
          transform: scaleX(1);
        }
        .eae-step[data-state="active"]::after {
          box-shadow: 0 0 12px color-mix(in oklab, var(--eae-accent) 55%, transparent);
        }
        .eae-canvas {
          position: relative;
          padding: clamp(1rem, 3vw, 1.45rem);
          background-image:
            linear-gradient(var(--eae-soft) 1px, transparent 1px),
            linear-gradient(90deg, var(--eae-soft) 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .eae-flow {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) 2.1rem minmax(8.8rem, .78fr) 2.1rem minmax(0, 1fr);
          align-items: stretch;
          gap: .45rem;
        }
        .eae-node,
        .eae-core,
        .eae-loss {
          border: 1px solid var(--eae-border);
          border-radius: 1rem;
          background: color-mix(in oklab, var(--color-base-200) 76%, transparent);
          box-shadow: inset 0 1px 0 rgb(255 255 255 / .035);
          transition: border-color 240ms ease, background 240ms ease, opacity 240ms ease, transform 300ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms ease;
        }
        .eae-node {
          min-width: 0;
          padding: .75rem;
          opacity: 1;
        }
        .eae-node[data-active="true"],
        .eae-core[data-active="true"],
        .eae-loss[data-active="true"] {
          border-color: color-mix(in oklab, var(--eae-accent) 58%, transparent);
          background: color-mix(in oklab, var(--eae-accent) 9%, var(--color-base-200));
          box-shadow: 0 10px 30px rgb(0 0 0 / .12), inset 0 0 0 1px color-mix(in oklab, var(--eae-accent) 12%, transparent);
          opacity: 1;
          transform: translateY(-2px);
        }
        .eae-node-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .5rem;
          margin-bottom: .55rem;
          color: var(--eae-muted);
          font-size: .61rem;
          font-weight: 800;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .eae-node-label b {
          color: var(--eae-accent);
          font-size: .59rem;
          letter-spacing: .02em;
          text-transform: none;
        }
        .eae-instruction {
          margin-bottom: .55rem;
          padding: .55rem .65rem;
          border: 1px solid color-mix(in oklab, var(--eae-accent) 26%, var(--eae-border));
          border-radius: .65rem;
          background: color-mix(in oklab, var(--eae-accent) 8%, transparent);
        }
        .eae-instruction span,
        .eae-state span {
          display: block;
          color: var(--eae-muted);
          font-size: .55rem;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .eae-instruction strong {
          display: block;
          margin-top: .24rem;
          color: var(--color-base-content);
          font-size: .78rem;
          line-height: 1.25;
        }
        .eae-frames {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: .25rem;
        }
        .eae-frames[data-future="true"] {
          grid-template-columns: repeat(2, 1fr);
        }
        .eae-frame {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border: 1px solid rgb(255 255 255 / .12);
          border-radius: .48rem;
          background-image: url("/img/writing/vision-action-transformers-vla-wam/robot-cup-storyboard.jpg");
          background-repeat: no-repeat;
          background-size: 202% 202%;
          box-shadow: inset 0 0 0 1px rgb(0 0 0 / .08);
        }
        .eae-frame span {
          position: absolute;
          right: .2rem;
          bottom: .2rem;
          padding: .16rem .25rem;
          border-radius: .25rem;
          background: rgb(4 8 14 / .72);
          color: white;
          font: 800 .47rem/1 ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: -.02em;
        }
        .eae-state {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .4rem;
          margin-top: .55rem;
          padding: .48rem .55rem;
          border-radius: .55rem;
          background: var(--eae-soft);
        }
        .eae-state code {
          color: var(--color-base-content);
          font: 700 .57rem/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .eae-arrow {
          position: relative;
          display: grid;
          place-items: center;
          color: var(--eae-border);
          font-size: 1.1rem;
          transition: color 220ms ease;
        }
        .eae-arrow::before {
          content: "";
          position: absolute;
          right: .2rem;
          left: .2rem;
          height: 1px;
          background: currentColor;
        }
        .eae-arrow::after {
          content: "";
          position: absolute;
          right: .15rem;
          width: .38rem;
          height: .38rem;
          border-top: 1px solid currentColor;
          border-right: 1px solid currentColor;
          transform: rotate(45deg);
        }
        .eae-arrow[data-active="true"] {
          color: var(--eae-accent);
        }
        .eae-arrow[data-active="true"] i {
          width: .4rem;
          height: .4rem;
          border-radius: 50%;
          background: var(--eae-accent);
          box-shadow: 0 0 10px color-mix(in oklab, var(--eae-accent) 70%, transparent);
          animation: eae-travel 1.15s ease-in-out infinite;
        }
        .eae-core {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 12rem;
          padding: .9rem .75rem;
          overflow: hidden;
          text-align: center;
          opacity: 1;
        }
        .eae-core-grid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: .35rem;
          padding: .6rem;
          opacity: .18;
        }
        .eae-core-grid i {
          border-radius: .25rem;
          background: var(--eae-accent);
          transform: scale(.45);
          transition: transform 420ms cubic-bezier(.2,.8,.2,1), opacity 240ms ease;
        }
        .eae-core[data-active="true"] .eae-core-grid i {
          opacity: .55;
          transform: scale(.78);
        }
        .eae-core > span,
        .eae-core > strong,
        .eae-core > small,
        .eae-layers {
          position: relative;
          z-index: 1;
        }
        .eae-core > span {
          color: var(--eae-accent);
          font-size: .7rem;
          font-weight: 900;
          letter-spacing: .14em;
        }
        .eae-core > strong {
          max-width: 9rem;
          margin-top: .35rem;
          font-size: .94rem;
          line-height: 1.12;
          letter-spacing: -.035em;
        }
        .eae-core > small {
          margin-top: .6rem;
          color: var(--eae-muted);
          font-size: .58rem;
          line-height: 1.25;
        }
        .eae-layers {
          display: flex;
          gap: .22rem;
          margin-top: .65rem;
        }
        .eae-layers i {
          width: .45rem;
          height: 1.8rem;
          border: 1px solid color-mix(in oklab, var(--eae-accent) 50%, transparent);
          border-radius: .22rem;
          background: color-mix(in oklab, var(--eae-accent) 16%, transparent);
          transform: scaleY(.68);
          transition: transform 300ms cubic-bezier(.2,.8,.2,1);
        }
        .eae-core[data-active="true"] .eae-layers i:nth-child(2),
        .eae-core[data-active="true"] .eae-layers i:nth-child(4) {
          transform: scaleY(1);
        }
        .eae-output-body {
          display: grid;
          gap: .55rem;
        }
        .eae-output-branch {
          padding: .55rem;
          border: 1px solid var(--eae-border);
          border-radius: .65rem;
          background: color-mix(in oklab, var(--color-base-100) 54%, transparent);
        }
        .eae-output-branch > span {
          display: block;
          margin-bottom: .45rem;
          color: var(--eae-muted);
          font-size: .56rem;
          font-weight: 800;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .eae-action {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: .28rem;
        }
        .eae-action div {
          display: flex;
          justify-content: space-between;
          gap: .3rem;
          padding: .34rem .4rem;
          border-radius: .38rem;
          background: var(--eae-soft);
          font: 700 .55rem/1 ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .eae-action span { color: var(--eae-muted); }
        .eae-action b { color: var(--color-base-content); font-weight: 800; }
        .eae-action[data-compact="true"] div { padding: .28rem .35rem; }
        .eae-loss-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: .7rem;
          margin-top: .8rem;
        }
        .eae-target,
        .eae-loss {
          min-width: 0;
          padding: .72rem;
        }
        .eae-target {
          border: 1px dashed var(--eae-border);
          border-radius: .85rem;
          color: var(--eae-muted);
          background: color-mix(in oklab, var(--color-base-100) 45%, transparent);
        }
        .eae-target span,
        .eae-loss span {
          display: block;
          color: var(--eae-muted);
          font-size: .58rem;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .eae-target strong,
        .eae-loss strong {
          display: block;
          margin-top: .3rem;
          color: var(--color-base-content);
          font-size: .72rem;
          line-height: 1.25;
        }
        .eae-compare {
          color: var(--eae-muted);
          font-size: .65rem;
          font-weight: 800;
        }
        .eae-loss {
          opacity: 1;
        }
        .eae-gradient {
          position: relative;
          height: 1.55rem;
          margin: .5rem 10% 0;
          color: color-mix(in oklab, var(--eae-accent) 42%, var(--eae-border));
          font-size: .55rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-align: center;
          text-transform: uppercase;
        }
        .eae-gradient::before {
          content: "";
          position: absolute;
          top: .42rem;
          right: 0;
          left: 0;
          height: 1px;
          background: currentColor;
        }
        .eae-gradient::after {
          content: "";
          position: absolute;
          top: .22rem;
          left: 0;
          width: .42rem;
          height: .42rem;
          border-bottom: 1px solid currentColor;
          border-left: 1px solid currentColor;
          transform: rotate(45deg);
        }
        .eae-gradient span {
          position: relative;
          top: .85rem;
          padding: 0 .4rem;
          background: var(--color-base-100);
        }
        .eae-loss[data-active="true"] + .eae-gradient,
        .eae-gradient[data-active="true"] {
          color: var(--eae-accent);
        }
        .eae-readout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1rem;
          align-items: start;
          padding: 1rem clamp(1rem, 3vw, 1.4rem) 1.15rem;
          border-top: 1px solid var(--eae-border);
        }
        .eae-readout span {
          display: block;
          margin-bottom: .28rem;
          color: var(--eae-accent);
          font-size: .61rem;
          font-weight: 900;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .eae-readout p {
          margin: 0;
          color: var(--color-base-content);
          font-size: .78rem;
          line-height: 1.45;
        }
        .eae-readout code {
          align-self: center;
          color: var(--eae-muted);
          font: 700 .62rem/1.25 ui-monospace, SFMono-Regular, Menlo, monospace;
          text-align: right;
        }
        .eae-note {
          margin: 0;
          padding: 0 clamp(1rem, 3vw, 1.4rem) 1rem;
          color: var(--eae-muted);
          font-size: .68rem;
          line-height: 1.5;
        }
        .eae-note b { color: var(--color-base-content); }
        @keyframes eae-pulse {
          0%, 100% { transform: scale(.85); opacity: .64; }
          50% { transform: scale(1); opacity: 1; }
        }
        @keyframes eae-travel {
          0% { transform: translateX(-.72rem) scale(.7); opacity: 0; }
          35%, 65% { opacity: 1; }
          100% { transform: translateX(.72rem) scale(1); opacity: 0; }
        }
        @media (hover: hover) and (pointer: fine) {
          .eae-model-tab:hover,
          .eae-mode-tab:hover,
          .eae-play:hover,
          .eae-step:hover { color: var(--color-base-content); }
          .eae-model-tab:hover,
          .eae-mode-tab:hover,
          .eae-play:hover { transform: translateY(-1px); }
        }
        .eae-model-tab:focus-visible,
        .eae-mode-tab:focus-visible,
        .eae-play:focus-visible,
        .eae-step:focus-visible {
          outline: 2px solid var(--eae-accent);
          outline-offset: 2px;
        }
        .eae-model-tab:active,
        .eae-mode-tab:active,
        .eae-play:active { transform: scale(.98); }
        @media (max-width: 680px) {
          .eae-model-tab { text-align: center; }
          .eae-model-tab small { display: none; }
          .eae-toolbar { align-items: stretch; }
          .eae-mode-tabs { flex: 1; }
          .eae-mode-tab { flex: 1; }
          .eae-steps { gap: .15rem; padding-right: .8rem; padding-left: .8rem; }
          .eae-step { font-size: .57rem; text-align: center; }
          .eae-flow {
            grid-template-columns: 1fr;
            gap: .5rem;
          }
          .eae-arrow { min-height: 1.7rem; transform: rotate(90deg); }
          .eae-core { min-height: 8.5rem; }
          .eae-loss-row { grid-template-columns: 1fr; gap: .4rem; }
          .eae-compare { text-align: center; }
          .eae-gradient { margin-right: 18%; margin-left: 18%; }
          .eae-readout { grid-template-columns: 1fr; }
          .eae-readout code { text-align: left; }
        }
        @media (max-width: 420px) {
          .eae-kicker { align-items: flex-start; flex-direction: column; gap: .3rem; }
          .eae-toolbar { flex-direction: column; }
          .eae-play { justify-content: center; }
          .eae-steps,
          .eae[data-mode="inference"] .eae-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .eae[data-mode="training"] .eae-step:last-child { grid-column: 1 / -1; }
          .eae-frames { gap: .18rem; }
          .eae-state { align-items: flex-start; flex-direction: column; }
        }
        @media (prefers-reduced-motion: reduce) {
          .eae *, .eae *::before, .eae *::after {
            animation: none !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="eae-top">
        <div className="eae-kicker">
          <span>Interactive architecture lab</span>
          <strong>{current.name}</strong>
        </div>

        <div className="eae-model-tabs" role="tablist" aria-label="Choose robot model architecture" aria-orientation="horizontal">
          {modelKeys.map((key) => (
            <button
              className="eae-model-tab"
              id={getModelTabId(key)}
              key={key}
              type="button"
              role="tab"
              aria-selected={model === key}
              aria-controls={panelId}
              tabIndex={model === key ? 0 : -1}
              onClick={() => selectModel(key)}
              onKeyDown={(event) => handleModelTabKeyDown(event, key)}
            >
              <b>{models[key].short}</b>
              <small>{models[key].name}</small>
            </button>
          ))}
        </div>

        <div className="eae-toolbar">
          <div className="eae-mode-tabs" aria-label="Choose training or inference">
            {(["training", "inference"] as RunMode[]).map((key) => (
              <button
                className="eae-mode-tab"
                key={key}
                type="button"
                aria-pressed={mode === key}
                onClick={() => selectMode(key)}
              >
                {key}
              </button>
            ))}
          </div>
          {reducedMotion ? (
            <span className="eae-manual-mode">Reduced motion · choose stages manually</span>
          ) : (
            <button className="eae-play" data-playing={playing} type="button" onClick={() => setPlaying((value) => !value)}>
              <i aria-hidden="true" />
              {playing ? "Pause flow" : "Play flow"}
            </button>
          )}
        </div>

        <p className="eae-formula">{current.formula}</p>
      </div>

      <div className="eae-steps">
        {stages.map((stage, index) => (
          <button
            className="eae-step"
            data-state={index === step ? "active" : index < step ? "complete" : "idle"}
            key={stage.label}
            type="button"
            onClick={() => {
              setStep(index);
              setPlaying(false);
            }}
            aria-current={index === step ? "step" : undefined}
          >
            {stage.label}
          </button>
        ))}
      </div>

      <div className="eae-canvas" id={panelId} role="tabpanel" aria-labelledby={getModelTabId(model)} data-mode={mode}>
        <div className="eae-flow">
          <section className="eae-node" data-active={inputActive}>
            <div className="eae-node-label"><span>Forward-pass input</span><b>{mode === "training" ? "sampled window" : "live window"}</b></div>
            {model !== "vat" ? (
              <div className="eae-instruction"><span>{model === "wam" ? "optional instruction" : "instruction"}</span><strong>“Put the cup on the coaster.”</strong></div>
            ) : null}
            <TrajectoryStrip historyEndsBeforeFuture={model === "wam"} />
            <div className="eae-state"><span>{model === "vat" ? "robot stateₜ" : "optional robot stateₜ"}</span><code>[x, y, z, yaw, gripper]</code></div>
          </section>

          <div className="eae-arrow" data-active={coreActive || (mode === "training" && step === 1)} aria-hidden="true"><i /></div>

          <ModelCore model={model} active={coreActive} />

          <div className="eae-arrow" data-active={outputActive} aria-hidden="true"><i /></div>

          <section className="eae-node" data-active={outputActive}>
            <div className="eae-node-label"><span>Forward-pass output</span><b>prediction</b></div>
            <div className="eae-output-body">
              {model === "wam" ? (
                <div className="eae-output-branch"><span>future visual states</span><TrajectoryStrip future /></div>
              ) : null}
              <div className="eae-output-branch"><span>{model === "wam" ? "future actions" : "next action / chunk"}</span><ActionChunk compact={model === "wam"} /></div>
            </div>
          </section>
        </div>

        {mode === "training" ? (
          <>
            <div className="eae-loss-row">
              <div className="eae-target"><span>Demonstrated target</span><strong>{model === "wam" ? "later frames + actions actually taken" : "action taken after observation t"}</strong></div>
              <div className="eae-compare">compare →</div>
              <div className="eae-loss" data-active={lossActive}>
                <span>Training objective</span>
                <strong>{model === "wam" ? "λworld Lworld + λaction Laction" : model === "vla" ? "action token CE or continuous action loss" : "action prediction loss"}</strong>
              </div>
            </div>
            <div className="eae-gradient" data-active={lossActive}><span>gradients update model weights</span></div>
          </>
        ) : null}
      </div>

      <div className="eae-readout" aria-live={playing ? "off" : "polite"}>
        <div><span>{stages[step].label}</span><p>{stages[step].detail}</p></div>
        <code>{current.input}<br />→ {current.output}</code>
      </div>

      {model === "wam" ? (
        <figcaption className="eae-note"><b>WAM inference varies.</b> Some systems generate future video before decoding actions. Fast-WAM-style systems keep video prediction as a training signal but skip future-video generation in the control loop. Generated trajectory frames and tensor values are illustrative.</figcaption>
      ) : (
        <figcaption className="eae-note">Change the architecture and mode, or click any stage to inspect the data flow. Generated trajectory frames and tensor values are illustrative.</figcaption>
      )}
    </figure>
  );
}
