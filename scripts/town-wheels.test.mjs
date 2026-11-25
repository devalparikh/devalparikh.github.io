import test from "node:test";
import assert from "node:assert/strict";
import { Group } from "three";
import { fitWheels } from "../src/components/photography/town/wheels.ts";
import { lapDistance } from "../src/components/photography/town/motion.ts";

function near(actual, expected, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) < tolerance, `Expected ${expected}, got ${actual}`);
}

test("tread follows road distance through a stop, a reversal and a turn at miniature scale", () => {
  const radius = 0.18, track = 0.31;
  const body = new Group();
  body.scale.setScalar(0.4);
  const model = { group(x, y, z, parent) {
    const hub = new Group();
    parent.add(hub);
    hub.position.set(x, y, z);
    return hub;
  } };
  const roll = fitWheels(model, body, radius, [{ x: -0.46, track }, { x: 0.46, track }], () => {});
  const lap = 2 * Math.PI * radius * body.scale.x;
  roll(lap);
  for (const hub of body.children) near(hub.rotation.z, -2 * Math.PI);
  roll(lap);
  for (const hub of body.children) near(hub.rotation.z, -2 * Math.PI);
  roll(-lap);
  for (const hub of body.children) near(hub.rotation.z, 2 * Math.PI);

  const turn = Math.PI / 2;
  roll(lap, turn);
  for (const hub of body.children)
    near(-hub.rotation.z * radius, lap / body.scale.x + hub.position.z * turn);
});

test("graded route distance follows the surface and stays continuous between laps", () => {
  // A unit circle in a tilted plane still travels one circumference per lap.
  const distance = lapDistance(u => {
    const a = u * 2 * Math.PI;
    return [Math.cos(a), Math.sin(a) * 0.6, Math.sin(a) * 0.8];
  });
  for (const lap of [0, 0.25, 0.9999, 1, 1.0001, 2.3])
    near(distance(lap), 2 * Math.PI * lap, 0.0001);
});
