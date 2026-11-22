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
