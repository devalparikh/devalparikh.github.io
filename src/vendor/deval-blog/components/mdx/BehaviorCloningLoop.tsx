"use client";

import { useState, type CSSProperties } from "react";

type LoopMode = "training" | "deployment";

const views = {
  training: {
    label: "Training",
    accentDark: "#55bde8",
    accentLight: "#1f6886",
    nodes: [
      { eyebrow: "Input", title: "Demonstrated window", detail: "frames + state", tone: "input" },
      { eyebrow: "Model", title: "Policy", detail: "fixed current weights", tone: "model" },
      { eyebrow: "Output", title: "Predicted action", detail: "âₜ", tone: "action" },
      { eyebrow: "Supervision", title: "Expert target", detail: "compare with aₜ", tone: "target" },
    ],
    feedback: "gradient update",
    takeaway: "Each prediction is compared with an expert target from the dataset.",
    metric: "offline action loss",
  },
  deployment: {
    label: "Deployment",
    accentDark: "#84bd83",
    accentLight: "#376c3e",
    nodes: [
      { eyebrow: "Input", title: "Current observation", detail: "state created so far", tone: "input" },
      { eyebrow: "Model", title: "Policy", detail: "same learned weights", tone: "model" },
      { eyebrow: "Output", title: "Action", detail: "execute âₜ", tone: "action" },
      { eyebrow: "Dynamics", title: "Environment", detail: "world changes", tone: "world" },
    ],
    feedback: "next observation",
    takeaway: "The policy creates its next input, so small errors can compound.",
    metric: "closed-loop behavior",
  },
} as const;

function FlowArrow() {
  return (
    <div className="bcl-arrow" aria-hidden="true">
      <svg viewBox="0 0 44 12" preserveAspectRatio="none">
        <path d="M2 6H40M34.5 1.5L40 6L34.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

export function BehaviorCloningLoop() {
  const [mode, setMode] = useState<LoopMode>("training");
  const current = views[mode];
  const style = {
    "--bcl-accent-dark": current.accentDark,
    "--bcl-accent-light": current.accentLight,
  } as CSSProperties;

  return (
    <figure className="bcl not-prose" data-mode={mode} style={style} aria-labelledby="bcl-title">
      <style>{`
        .bcl {
          --bcl-accent: var(--bcl-accent-dark);
          --bcl-border: color-mix(in oklab, var(--color-base-content) 13%, transparent);
          --bcl-muted: color-mix(in oklab, var(--color-base-content) 58%, transparent);
          --bcl-soft: color-mix(in oklab, var(--color-base-content) 5.5%, transparent);
          margin: 3rem 0;
          overflow: hidden;
          border: 1px solid var(--bcl-border);
          border-radius: 1.3rem;
          background:
            radial-gradient(circle at 88% -15%, color-mix(in oklab, var(--bcl-accent) 11%, transparent), transparent 18rem),
            color-mix(in oklab, var(--color-base-200) 88%, transparent);
          box-shadow: 0 22px 68px rgb(0 0 0 / .14), inset 0 1px 0 rgb(255 255 255 / .035);
          color: var(--color-base-content);
          font-family: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
        }
        [data-theme="parchment"] .bcl {
          --bcl-accent: var(--bcl-accent-light);
          --bcl-border: rgb(30 26 22 / .12);
          --bcl-muted: #6b6560;
          --bcl-soft: rgb(30 26 22 / .05);
          box-shadow: 0 18px 52px rgb(38 31 24 / .075), inset 0 1px 0 rgb(255 255 255 / .78);
        }
        .bcl-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1rem;
          align-items: end;
          padding: clamp(1rem, 3vw, 1.4rem);
          border-bottom: 1px solid var(--bcl-border);
        }
        .bcl-kicker {
          display: block;
          margin-bottom: .5rem;
          color: var(--bcl-muted);
          font-size: .65rem;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .bcl h3 {
          max-width: 30rem;
          margin: 0;
          color: var(--color-base-content);
          font-size: clamp(1.25rem, 3vw, 1.65rem);
          font-weight: 680;
          line-height: 1.08;
          letter-spacing: -.045em;
          text-wrap: balance;
        }
        .bcl-tabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: .3rem;
          min-width: 13rem;
          padding: .28rem;
          border: 1px solid var(--bcl-border);
          border-radius: .8rem;
          background: color-mix(in oklab, var(--color-base-100) 72%, transparent);
        }
        .bcl-tab {
          min-height: 2.75rem;
          padding: .55rem .72rem;
          border: 0;
          border-radius: .58rem;
          cursor: pointer;
          color: var(--bcl-muted);
          background: transparent;
          font: 800 .68rem/1 var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
          letter-spacing: .06em;
          text-transform: uppercase;
          transition: color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 140ms cubic-bezier(.2,.8,.2,1);
        }
        .bcl-tab[aria-pressed="true"] {
          color: var(--color-base-content);
          background: color-mix(in oklab, var(--bcl-accent) 13%, var(--color-base-200));
          box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--bcl-accent) 36%, transparent), 0 4px 12px rgb(0 0 0 / .07);
        }
        .bcl-canvas {
          padding: clamp(1rem, 3vw, 1.45rem);
          background-image:
            linear-gradient(var(--bcl-soft) 1px, transparent 1px),
            linear-gradient(90deg, var(--bcl-soft) 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .bcl-flow {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 2rem minmax(0, 1fr) 2rem minmax(0, 1fr) 2rem minmax(0, 1fr);
          gap: .4rem;
          align-items: stretch;
        }
        .bcl-node {
          min-width: 0;
          min-height: 7rem;
          padding: .8rem;
          border: 1px solid var(--bcl-border);
          border-radius: .9rem;
          background: color-mix(in oklab, var(--color-base-200) 78%, transparent);
          box-shadow: inset 0 1px 0 rgb(255 255 255 / .035);
          transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }
        .bcl-node[data-tone="model"] {
          border-color: color-mix(in oklab, var(--bcl-accent) 48%, var(--bcl-border));
          background: color-mix(in oklab, var(--bcl-accent) 8%, var(--color-base-200));
          box-shadow: 0 9px 26px rgb(0 0 0 / .09), inset 0 0 0 1px color-mix(in oklab, var(--bcl-accent) 10%, transparent);
        }
        .bcl-node span {
          display: block;
          color: var(--bcl-muted);
          font-size: .56rem;
          font-weight: 850;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .bcl-node strong {
          display: block;
          margin-top: .72rem;
          color: var(--color-base-content);
          font-size: .78rem;
          font-weight: 760;
          line-height: 1.22;
          letter-spacing: -.018em;
          text-wrap: balance;
        }
        .bcl-node code {
          display: block;
          margin-top: .42rem;
          color: var(--bcl-muted);
          font: 700 .58rem/1.3 ui-monospace, SFMono-Regular, Menlo, monospace;
          white-space: normal;
        }
        .bcl-arrow {
          display: grid;
          place-items: center;
          min-width: 0;
          color: var(--bcl-accent);
        }
        .bcl-arrow svg {
          display: block;
          width: 100%;
          height: .75rem;
          overflow: visible;
        }
        .bcl-feedback {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          gap: .65rem;
          align-items: center;
          margin-top: .8rem;
          color: var(--bcl-accent);
        }
        .bcl-feedback svg {
          display: block;
          width: 100%;
          height: .72rem;
          overflow: visible;
        }
        .bcl-feedback span {
          color: var(--bcl-accent);
          font: 850 .59rem/1 ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .bcl-loop-icon { display: none; }
        .bcl-readout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1rem;
          align-items: start;
          padding: 1rem clamp(1rem, 3vw, 1.4rem) 1.15rem;
          border-top: 1px solid var(--bcl-border);
          background: color-mix(in oklab, var(--color-base-100) 42%, transparent);
        }
        .bcl-readout span {
          display: block;
          margin-bottom: .3rem;
          color: var(--bcl-accent);
          font-size: .61rem;
          font-weight: 900;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .bcl-readout p {
          max-width: 34rem;
          margin: 0;
          color: var(--color-base-content);
          font-size: .77rem;
          line-height: 1.45;
          text-wrap: pretty;
        }
        .bcl-readout code {
          align-self: center;
          color: var(--bcl-muted);
          font: 700 .61rem/1.3 ui-monospace, SFMono-Regular, Menlo, monospace;
          text-align: right;
        }
        @media (hover: hover) and (pointer: fine) {
          .bcl-tab:hover { color: var(--color-base-content); }
          .bcl-tab:hover:not([aria-pressed="true"]) { background: var(--bcl-soft); }
        }
        .bcl-tab:focus-visible {
          outline: 2px solid var(--bcl-accent);
          outline-offset: 2px;
        }
        .bcl-tab:active { transform: scale(.98); }
        @media (max-width: 680px) {
          .bcl-head { grid-template-columns: 1fr; }
          .bcl-tabs { min-width: 0; width: 100%; }
          .bcl-flow { grid-template-columns: 1fr; gap: .45rem; }
          .bcl-node { min-height: 0; }
          .bcl-arrow { min-height: 1.65rem; }
          .bcl-arrow svg { width: 2rem; transform: rotate(90deg); }
          .bcl-feedback { grid-template-columns: auto minmax(0, 1fr); justify-content: center; }
          .bcl-feedback > svg { display: none; }
          .bcl-loop-icon { display: block; font-size: 1.1rem; line-height: 1; }
          .bcl-readout { grid-template-columns: 1fr; }
          .bcl-readout code { text-align: left; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bcl-tab,
          .bcl-node { transition-duration: .01ms; }
        }
      `}</style>

      <header className="bcl-head">
        <div>
          <span className="bcl-kicker">Behavioral cloning · one policy, two loops</span>
          <h3 id="bcl-title">Where compounding error comes from</h3>
        </div>
        <div className="bcl-tabs" aria-label="Choose training or deployment view">
          {(Object.keys(views) as LoopMode[]).map((key) => (
            <button
              className="bcl-tab"
              key={key}
              type="button"
              aria-pressed={mode === key}
              onClick={() => setMode(key)}
            >
              {views[key].label}
            </button>
          ))}
        </div>
      </header>

      <div className="bcl-canvas">
        <div className="bcl-flow">
          {current.nodes.map((node, index) => (
            <div key={index} style={{ display: "contents" }}>
              <section className="bcl-node" data-tone={node.tone}>
                <span>{node.eyebrow}</span>
                <strong>{node.title}</strong>
                <code>{node.detail}</code>
              </section>
              {index < current.nodes.length - 1 ? <FlowArrow /> : null}
            </div>
          ))}
        </div>

        <div className="bcl-feedback" aria-label={`${current.feedback} returns from the final stage to the first stage`}>
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
            <path d="M100 6H3M9 1L3 6L9 11" fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
          </svg>
          <i className="bcl-loop-icon" aria-hidden="true">↺</i>
          <span>{current.feedback}</span>
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 6H100" fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>

      <figcaption className="bcl-readout" aria-live="polite">
        <div>
          <span>Offline score ≠ closed-loop robustness</span>
          <p>{current.takeaway}</p>
        </div>
        <code>{current.metric}</code>
      </figcaption>
    </figure>
  );
}
