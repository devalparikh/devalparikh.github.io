/**
 * The arithmetic behind the speculative decoding figures. The figures draw
 * their counters, bars and labels from this model, so the post's numbers are
 * checked here rather than by eye.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  bestK,
  DRAFT_COST,
  SAMPLING_SLOT,
  samplingOutcome,
  SCENARIOS,
  speedup,
  timeline,
  tokensPerPass,
  verify,
} from "../src/components/writing/posts/speculative-decoding/model.ts";

const scenario = (id) => SCENARIOS.find((item) => item.id === id);

test("the centerpiece: 'on the mat .' against 'on the floor' keeps three tokens from one pass", () => {
  const round = verify(scenario("miss"));
  assert.deepEqual(round.inputs, ["sat", "on", "the", "mat", "."]);
  assert.deepEqual(round.kept, ["on", "the", "floor"]);
  assert.deepEqual(round.checks, ["match", "match", "miss", "skip", "skip"]);
  assert.equal(round.accepted, 2);
});

test("all guesses matching adds the bonus token; a wrong first guess still adds one", () => {
  const all = verify(scenario("all"));
  assert.equal(all.kept.length, 5);
  assert.equal(all.checks.at(-1), "bonus");
  const first = verify(scenario("first"));
  assert.deepEqual(first.kept, ["on"]);
  // Never fewer tokens than one normal step.
  for (const item of SCENARIOS) assert.ok(verify(item).kept.length >= 1);
  assert.throws(() => verify({ draft: ["a"], predictions: ["a"] }), /k \+ 1/);
});

test("one request: the check pass fits inside one weight read and the round is faster", () => {
  const { normal, speculative } = timeline(1);
  const check = speculative.passes.at(-1);
  assert.equal(check.positions, 5);
  assert.ok(check.math < check.read, "five positions of math hide under the weight read");
  assert.equal(check.duration, check.read);
  assert.equal(Math.round(normal.total), 160);
  assert.equal(Math.round(speculative.total), 65);
  assert.deepEqual(speculative.tokens, normal.tokens);
});

test("sixteen batched requests: math outlasts the read and speculation is slower", () => {
  const { normal, speculative } = timeline(16);
  const check = speculative.passes.at(-1);
  assert.equal(check.positions, 80);
  assert.ok(check.math > check.read);
  assert.ok(speculative.total > normal.total);
});

test("expected tokens and speedup follow Leviathan et al.'s formulas", () => {
  assert.equal(tokensPerPass(0.8, 4).toFixed(2), "3.36");
  assert.equal(speedup(0.8, 4, 0.06).toFixed(2), "2.71");
  assert.equal(tokensPerPass(1, 4), 5);
  // Table 1 in the paper (c = 0): alpha 0.8, gamma 5 gives 3.69x.
  assert.equal(speedup(0.8, 5, 0).toFixed(2), "3.69");
  assert.equal(DRAFT_COST, 0.06);
  assert.equal(speedup(0.8, 4, DRAFT_COST).toFixed(2), "2.71");
  assert.ok(bestK(0.3, DRAFT_COST, 8) < bestK(0.9, DRAFT_COST, 8), "better drafts justify more guesses");
});

test("the sampling rule gives back exactly the big model's odds", () => {
  const outcome = samplingOutcome(SAMPLING_SLOT);
  assert.deepEqual(outcome.final, [...SAMPLING_SLOT.target]);
  assert.equal(outcome.keptTotal, 70);
  assert.deepEqual(outcome.refill, [30, 0, 0]);
});

test("figure steps split the loop by span and land picks inside each step's hold", async () => {
  const { buildSteps, phases, stepAt } = await import("../src/components/writing/posts/speculative-decoding/scene.ts");
  const steps = buildSteps([
    { id: "a", label: "A", text: "", span: 1 },
    { id: "b", label: "B", text: "", span: 3 },
  ]);
  assert.deepEqual(steps.map((step) => [step.start, step.end]), [[0, 0.25], [0.25, 1]]);
  for (const step of steps) assert.equal(stepAt(steps, step.hold).id, step.id);
  const p = phases(steps, steps[1].hold);
  assert.equal(p.done("a"), 1);
  assert.equal(p.done("b"), 1, "motion is finished by the hold");
  assert.equal(p.moving("b"), null);
  assert.ok(p.on("b") && p.reached("a"));
});

test("a figure starts playing at 75% visible and keeps going down to 25%", async () => {
  const { nextOnScreen, visibleShare } = await import("../src/components/writing/posts/speculative-decoding/usePlayback.ts");
  const entry = (shown, height = 400) => ({ isIntersecting: shown > 0, intersectionRect: { height: shown }, boundingClientRect: { height } });
  assert.equal(nextOnScreen(false, visibleShare(entry(280), 844)), false);
  assert.equal(nextOnScreen(false, visibleShare(entry(300), 844)), true);
  assert.equal(nextOnScreen(true, visibleShare(entry(120), 844)), true);
  assert.equal(nextOnScreen(true, visibleShare(entry(80), 844)), false);
  // A drawing taller than the screen counts as fully visible when it fills it.
  assert.equal(visibleShare(entry(844, 1200), 844), 1);
});
