"use client";

import type { ComponentType, ReactNode } from "react";
import { stepAt, type Step } from "./scene";
import { useCompactLayout, useSceneClock } from "./usePlayback";
import "./figures.css";

export interface SceneProps {
  /** Normalised loop time, 0 to 1. */
  t: number;
  /** True for the phone composition. */
  compact: boolean;
}

interface Size {
  w: number;
  h: number;
}

interface SceneFigureProps {
  steps: readonly Step[];
  /** Step shown before playback and with reduced motion. */
  stillStep: string;
  durationMs: number;
  scene: ComponentType<SceneProps>;
  wide: Size;
  narrow: Size;
  /** Text alternative for the drawing. */
  label: string;
  caption: ReactNode;
  /** Choices that change what the scene shows, placed above it. Give the figure a `key` per choice so the loop restarts. */
  toolbar?: ReactNode;
}

/**
 * Shell shared by the animated figures: a wide and a phone composition of the
 * same drawing, the numbered steps of the mechanism, one narration line for
 * the current step, and a caption. One clock drives all of it.
 */
export function SceneFigure({ steps, stillStep, durationMs, scene: Scene, wide, narrow, label, caption, toolbar }: SceneFigureProps) {
  const still = steps.find((step) => step.id === stillStep) ?? steps[steps.length - 1];
  const { stageRef, t, playing, reducedMotion, seek, toggle } = useSceneClock(durationMs, still.hold);
  const compact = useCompactLayout();
  const current = stepAt(steps, t);

  return (
    <figure className="not-prose sdv-figure">
      {toolbar}
      <div ref={stageRef} className="sdv-stage">
        <svg className="sdv-svg sdv-wide" viewBox={`0 0 ${wide.w} ${wide.h}`} role="img" aria-label={label}>
          <Scene t={compact ? still.hold : t} compact={false} />
        </svg>
        <svg className="sdv-svg sdv-narrow" viewBox={`0 0 ${narrow.w} ${narrow.h}`} role="img" aria-label={label}>
          <Scene t={compact ? t : still.hold} compact />
        </svg>
      </div>

      <div className="sdv-controls">
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            className="sdv-step-button"
            aria-current={step.id === current.id ? "step" : undefined}
            aria-label={`Step ${step.index + 1}: ${step.label}`}
            onClick={() => seek(step.hold)}
          >
            <span className="sdv-step-number" aria-hidden="true">{step.index + 1}</span>
            <span className="sdv-step-label" aria-hidden="true">{step.label}</span>
          </button>
        ))}
        {reducedMotion ? null : (
          <button type="button" className="sdv-play" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            <span className="sdv-play-icon" aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
            <span className="sdv-play-label" aria-hidden="true">{playing ? "Pause" : "Play"}</span>
          </button>
        )}
      </div>

      <div className="sdv-narration">
        {steps.map((step) => (
          <p key={step.id} data-current={step.id === current.id} aria-hidden={step.id !== current.id}>
            <strong>{step.label}.</strong> {step.text}
          </p>
        ))}
      </div>

      <figcaption className="sdv-caption">{caption}</figcaption>
    </figure>
  );
}

/** A row of mode buttons above a figure. */
export function Modes<T extends string>({ label, options, value, onChange }: { label: string; options: readonly { id: T; label: string; short?: string }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div className="sdv-modes" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.id} type="button" className="sdv-mode" aria-pressed={value === option.id} aria-label={option.label} onClick={() => onChange(option.id)}>
          {option.short ? (
            <>
              <span className="sdv-long" aria-hidden="true">{option.label}</span>
              <span className="sdv-short" aria-hidden="true">{option.short}</span>
            </>
          ) : (
            option.label
          )}
        </button>
      ))}
    </div>
  );
}
