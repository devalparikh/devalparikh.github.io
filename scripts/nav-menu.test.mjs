import test from "node:test";
import assert from "node:assert/strict";
import { placeMenu } from "../src/lib/menu-placement.ts";

/** The nav's "More" trigger: 70px wide, in a 56px bar. */
const trigger = (left) => ({ left, right: left + 70, top: 10, bottom: 46 });
const gutter = { left: 20, right: 20, top: 12, bottom: 12 };
const place = (overrides) =>
  placeMenu({ trigger: trigger(82), menuWidth: 176, menuHeight: 275, viewport: { width: 390, height: 844 }, gutter, gap: 9.6, ...overrides });

const inside = (placement, viewport, g = gutter) => {
  assert.ok(placement.left >= g.left, `left ${placement.left} is inside the left gutter`);
  assert.ok(placement.left + placement.width <= viewport.width - g.right, `right ${placement.left + placement.width} is inside the right gutter`);
};

test("desktop keeps the menu end-aligned under its trigger", () => {
  const placement = place({ trigger: trigger(883), menuHeight: 85, viewport: { width: 1440, height: 900 } });
  assert.equal(placement.align, "end");
  assert.equal(placement.left + placement.width, 953);
  assert.equal(placement.side, "bottom");
  assert.equal(placement.width, 176);
});

test("a trigger near the left edge start-aligns instead of running off it", () => {
  for (const width of [320, 360, 390]) {
    const viewport = { width, height: 640 };
    const placement = place({ viewport });
    assert.equal(placement.align, "start", `at ${width}px`);
    assert.equal(placement.left, 82);
    inside(placement, viewport);
  }
});

test("a menu too wide for either alignment is clamped to the gutters", () => {
  const viewport = { width: 320, height: 568 };
  const placement = place({ menuWidth: 260, trigger: trigger(150), viewport });
  assert.equal(placement.align, "clamped");
  inside(placement, viewport);
  // A long item never makes the menu wider than the screen allows.
  const huge = place({ menuWidth: 900, viewport });
  assert.equal(huge.width, 280);
  inside(huge, viewport);
});

test("safe-area insets widen the gutters", () => {
  const viewport = { width: 844, height: 390 };
  const notch = { left: 47, right: 47, top: 12, bottom: 21 };
  const placement = place({ trigger: trigger(30), viewport, gutter: notch });
  inside(placement, viewport, notch);
});

test("the transform origin sits under the trigger", () => {
  const start = place({});
  assert.equal(start.originX, 35);
  const end = place({ trigger: trigger(883), viewport: { width: 1440, height: 900 } });
  assert.equal(end.originX, 176 - 35);
});

test("height is capped to the room below, and flips above when below is short", () => {
  const landscape = place({ trigger: trigger(585), viewport: { width: 844, height: 320 } });
  assert.equal(landscape.side, "bottom");
  assert.equal(landscape.maxHeight, Math.floor(320 - 12 - 46 - 9.6));

  const lowTrigger = { left: 82, right: 152, top: 780, bottom: 816 };
  const flipped = place({ trigger: lowTrigger });
  assert.equal(flipped.side, "top");
  assert.ok(flipped.maxHeight >= 275);
});
