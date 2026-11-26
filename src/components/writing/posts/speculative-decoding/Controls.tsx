"use client";

/** Play/pause/replay plus a row of named stops, shared by the animated figures. */
export function PlaybackControls({
  stops,
  phase,
  playing,
  progress,
  reducedMotion,
  onSelect,
  onToggle,
}: {
  stops: readonly string[];
  phase: number;
  playing: boolean;
  progress: number;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
  onToggle: () => void;
}) {
  const label = playing ? "Pause" : progress >= 1 ? "Replay" : "Play";
  return (
    <div className="sdv-controls">
      {!reducedMotion && (
        <button type="button" className="sdv-button sdv-play" onClick={onToggle} aria-label={`${label} animation`}>
          <span aria-hidden="true">{playing ? "❚❚" : progress >= 1 ? "↺" : "▶"}</span>
          {label}
        </button>
      )}
      <div className="sdv-stops" role="group" aria-label="Steps">
        {stops.map((stop, index) => (
          <button
            key={stop}
            type="button"
            className="sdv-button"
            aria-pressed={!playing && phase === index}
            data-current={phase === index}
            onClick={() => onSelect(index)}
          >
            <span className="sdv-stop-number" aria-hidden="true">{index + 1}</span>
            {stop}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A small segmented choice, e.g. which example to run. */
export function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="sdv-choice" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          className="sdv-button"
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
