import assert from "node:assert/strict";
import test from "node:test";
import { OrthographicCamera, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mapDrag } from "../src/components/photography/town/map-touch.ts";
import { moveMapCamera } from "../src/components/photography/town/map-camera.ts";

const point = (x, y) => ({ x, y });
const rect = { left: 13, top: 42, width: 820, height: 1180 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

function setup() {
  const camera = new OrthographicCamera(-10, 10, 14, -14, 0.1, 150);
  camera.position.set(38, 34, 40);
  const controls = new OrbitControls(camera);
  controls.minZoom = 0.58;
  controls.maxZoom = 4;
  controls.minPolarAngle = 0.4;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.update();
  camera.updateMatrixWorld();
  const project = (p) => {
    const v = p.clone().project(camera);
    return point(rect.left + (1 + v.x) * rect.width / 2, rect.top + (1 - v.y) * rect.height / 2);
  };
  const drag = mapDrag(true, motion => moveMapCamera(camera, controls, rect, motion));
  return { camera, controls, project, drag };
}

test("drag, moving pinch and clockwise twist preserve an off-center ground anchor", () => {
  const { camera, project, drag } = setup();
  const street = new Vector3(-4, 0, 2);
  const start = project(street);
  const end = point(start.x + 60, start.y + 25);
  drag.rebase([start]);
  drag.move([end]);
  near(project(street).x, end.x);
  near(project(street).y, end.y);

  drag.rebase([point(end.x - 40, end.y), point(end.x + 40, end.y)]);
  const right = new Vector3(4, 0, 2 - 8 * 38 / 40);
  near(project(right).y, end.y);
  const center = point(end.x - 35, end.y + 12);
  drag.move([point(center.x, center.y - 80), point(center.x, center.y + 80)]);
  near(camera.zoom, 2);
  near(project(street).x, center.x);
  near(project(street).y, center.y);
  assert.ok(project(right).y > center.y);
  drag.move([point(center.x, center.y - 20), point(center.x, center.y + 20)]);
  near(camera.zoom, 0.58);
  near(project(street).x, center.x);
  near(project(street).y, center.y);
});

test("parallel swipes tilt in both directions around one pivot without twisting or zooming", () => {
  const { camera, controls, project, drag } = setup();
  const street = new Vector3(4, 0, -2), center = project(street);
  const pair = dy => [point(center.x - 40, center.y + dy), point(center.x + 40, center.y + dy)];
  const initial = controls.getPolarAngle(), heading = controls.getAzimuthalAngle();
  drag.rebase(pair(0));
  drag.move(pair(-15));
  drag.move(pair(-40));
  assert.ok(controls.getPolarAngle() > initial);
  near(project(street).x, center.x);
  near(project(street).y, center.y);
  drag.move(pair(0));
  near(controls.getPolarAngle(), initial);
  near(controls.getAzimuthalAngle(), heading);
  near(camera.zoom, 1);
});

test("changing the contact set rebases without carrying pinch, tilt or canceled deltas", () => {
  const motions = [];
  const drag = mapDrag(true, m => motions.push(m));
  const a = point(50, 60), b = point(220, 60), c = point(400, 350);
  drag.rebase([a, b]);
  drag.rebase([a, b, c]);
  drag.move([point(55, 60), b, c]);
  drag.rebase([b, c]);
  drag.rebase([c]);
  drag.move([point(408, 370)]);
  drag.rebase([]);
  drag.move([a]);
  assert.deepEqual(motions, [{ from: c, to: point(408, 370), scale: 1, turn: 0, tilt: 0 }]);
});
