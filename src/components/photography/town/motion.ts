// A clamped transition with zero speed at both ends.
export function ease(value: number) {
  const u = Math.min(1, Math.max(0, value));
  return u * u * (3 - 2 * u);
}

// Reach cruising speed after the first ramp, then brake over the last.
export function travel(value: number, ramp = 0.15) {
  const u = Math.min(1, Math.max(0, value));
  if (u < ramp) return u * u / (2 * ramp * (1 - ramp));
  if (u > 1 - ramp) return 1 - (1 - u) ** 2 / (2 * ramp * (1 - ramp));
  return (u - ramp / 2) / (1 - ramp);
}

// Sample a closed route once. Absolute lap counts keep the wheels continuous
// across the seam and give the same pose at a given time at any frame rate.
export function lapDistance(point: (lap: number) => readonly [number, number, number, ...number[]]) {
  const samples = 512;
  const lengths = new Float64Array(samples + 1);
  let previous = point(0);
  for (let i = 1; i <= samples; i++) {
    const next = point(i / samples);
    lengths[i] = lengths[i - 1] + Math.hypot(next[0] - previous[0], next[1] - previous[1], next[2] - previous[2]);
    previous = next;
  }
  return (lap: number) => {
    const whole = Math.floor(lap);
    const sample = (lap - whole) * samples;
    const i = Math.min(samples - 1, Math.floor(sample));
    return whole * lengths[samples] + lengths[i] + (sample - i) * (lengths[i + 1] - lengths[i]);
  };
}
