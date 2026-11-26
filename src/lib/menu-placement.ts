/**
 * Where a dropdown sits under (or over) its trigger so that it never leaves
 * the viewport. Pure and DOM-free so the node test runner can check it; all
 * coordinates are viewport pixels.
 *
 * Horizontally it tries, in order:
 *   1. end-aligned - right edges flush, the desktop look;
 *   2. start-aligned - left edges flush, for a trigger near the left edge;
 *   3. clamped - as close to end-aligned as the gutters allow.
 * Vertically it opens below unless there is more room above and not enough
 * below. The height is capped to the room on that side, so a long list
 * scrolls inside the menu instead of off the screen.
 */

export interface MenuPlacementInput {
  trigger: { left: number; right: number; top: number; bottom: number };
  /** The menu's natural width. */
  menuWidth: number;
  /** The menu's natural height. */
  menuHeight: number;
  viewport: { width: number; height: number };
  /** Minimum distance from each viewport edge, safe areas included. */
  gutter: { left: number; right: number; top: number; bottom: number };
  /** Space between trigger and menu. */
  gap: number;
}

export type MenuAlign = "end" | "start" | "clamped";

export interface MenuPlacement {
  /** Left edge of the menu, in viewport pixels. */
  left: number;
  width: number;
  maxHeight: number;
  side: "bottom" | "top";
  align: MenuAlign;
  /** Horizontal transform origin inside the menu: under the trigger's centre. */
  originX: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function placeMenu({ trigger, menuWidth, menuHeight, viewport, gutter, gap }: MenuPlacementInput): MenuPlacement {
  const minLeft = gutter.left;
  const maxRight = viewport.width - gutter.right;
  const width = Math.max(0, Math.min(menuWidth, maxRight - minLeft));
  const fits = (left: number) => left >= minLeft - 0.5 && left + width <= maxRight + 0.5;

  let left = trigger.right - width;
  let align: MenuAlign = "end";
  if (!fits(left)) {
    left = trigger.left;
    align = "start";
    if (!fits(left)) {
      left = clamp(trigger.right - width, minLeft, maxRight - width);
      align = "clamped";
    }
  }

  const below = viewport.height - gutter.bottom - (trigger.bottom + gap);
  const above = trigger.top - gap - gutter.top;
  const side = below < menuHeight && above > below ? "top" : "bottom";
  const room = Math.max(0, side === "bottom" ? below : above);

  const centre = (trigger.left + trigger.right) / 2;
  return {
    left: Math.round(left),
    width: Math.round(width),
    maxHeight: Math.floor(room),
    side,
    align,
    originX: Math.round(clamp(centre - left, 0, width)),
  };
}
