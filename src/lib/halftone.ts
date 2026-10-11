/**
 * Geometry of `public/img/earth-sprite.webp` - 240 greyscale frames of one
 * full rotation, laid out left to right, top to bottom. Regenerating the sheet
 * means updating these.
 */
export const SPRITE = {
  src: "/img/earth-sprite.webp",
  frame: 160,
  columns: 16,
  rows: 15,
  frames: 240,
} as const;

/**
 * Resting rotation speed, in sprite frames per second.
 *
 * One loop is a full rotation, so seconds-per-rotation at rest is
 * `SPRITE.frames / FRAMES_PER_SECOND` - 240 frames at 20fps is 12s. Lowering
 * this slows the globe but also enlarges the angular step between drawn
 * frames, which starts to read as stutter much below 20; to go slower still,
 * re-extract the sheet with more frames rather than dropping the rate.
 */
export const FRAMES_PER_SECOND = 20;

/**
 * How the globe answers the scroll. Scrolling down spins it one way and
 * scrolling up the other; the spin then keeps going in whichever direction the
 * page last moved, the way a spinning top keeps its last push.
 */
export const SPIN = {
  /** Extra speed per pixel scrolled, as a multiple of the resting speed. */
  gain: 0.009,
  /** Ceiling on that extra speed, so a fling does not turn into a blur. */
  maxBoost: 5,
  /** How fast the extra speed bleeds away, per second. */
  decay: 2.6,
  /**
   * How quickly the actual speed chases its target, per second. Low enough
   * that a change of direction visibly slows, stops and winds back up rather
   * than snapping into reverse.
   */
  response: 3.2,
  /**
   * Drawing is capped here even while a fast scroll asks for more frames:
   * each draw is a few milliseconds of main-thread work during a scroll.
   */
  maxDrawRate: 40,
} as const;

export interface HalftoneOptions {
  /** Distance between dot centres, in CSS pixels. */
  cell: number;
  /** Largest a dot may grow, as a fraction of the cell. */
  maxDot: number;
  /** Below this luminance a cell draws nothing, which keeps space empty. */
  floor: number;
  /** < 1 lifts the dark mid-tones so the globe's body reads. */
  gamma: number;
}

export const DEFAULT_OPTIONS: HalftoneOptions = {
  cell: 5,
  maxDot: 0.92,
  floor: 0.028,
  gamma: 0.45,
};

/**
 * Maps a sample's luminance to the side length of its dot. Squares rather than
 * circles: they read the same at this size and fill an order of magnitude
 * faster, which matters at ~10k dots a frame.
 */
export function dotSize(luminance: number, options: HalftoneOptions): number {
  if (luminance <= options.floor) return 0;

  const normalised = (luminance - options.floor) / (1 - options.floor);
  return Math.pow(normalised, options.gamma) * options.cell * options.maxDot;
}
