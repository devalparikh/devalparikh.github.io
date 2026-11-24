import { MathUtils, OrthographicCamera, Spherical, Vector3 } from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Contact, MapMotion } from "./map-touch";

export function moveMapCamera(
  camera: OrthographicCamera,
  controls: OrbitControls,
  rect: DOMRect,
  { from, to, scale, turn, tilt }: MapMotion,
) {
  if (!rect.width || !rect.height) return;
  function ground(point: Contact) {
    const origin = new Vector3(
      2 * (point.x - rect.left) / rect.width - 1,
      1 - 2 * (point.y - rect.top) / rect.height,
      0,
    ).unproject(camera);
    const direction = camera.getWorldDirection(new Vector3());
    return origin.addScaledVector(direction, -origin.y / direction.y);
  }
  camera.updateMatrixWorld();
  const anchor = ground(from);
  const orbit = new Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  orbit.theta += turn;
  orbit.phi = MathUtils.clamp(orbit.phi + tilt * Math.PI / rect.height,
    controls.minPolarAngle, controls.maxPolarAngle);
  camera.position.setFromSpherical(orbit).add(controls.target);
  camera.zoom = MathUtils.clamp(camera.zoom * scale, controls.minZoom, controls.maxZoom);
  camera.updateProjectionMatrix();
  camera.lookAt(controls.target);
  camera.updateMatrixWorld();

  // Keep the grabbed patch of street beneath the moving centroid, even when
  // the camera is oblique or the pinch is far from the centre of the canvas.
  const shift = anchor.sub(ground(to));
  controls.target.add(shift);
  camera.position.add(shift);
  controls.update();
}
