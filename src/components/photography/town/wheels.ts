import type { Group } from "three";
import type { Model } from "./model";

// Tire centers stay fixed in the wheel wells. The two faces share a geometry
// and turn about the chassis's transverse (+Z) axis, even on a graded road.
export function fitWheels(m: Model, body: Group, radius: number, axles: { x: number; track: number }[],
  draw: (hub: Group, side: number) => void) {
  const hubs = axles.flatMap(({ x, track }) => [-1, 1].map(side => {
    const hub = m.group(x, radius, side * track, body);
    hub.name = "road wheel";
    draw(hub, side);
    return hub;
  }));
  return (distance: number, headingChange = 0) => {
    for (const hub of hubs)
      hub.rotation.z = -(distance / body.scale.x + hub.position.z * headingChange) / radius;
  };
}

export function utilityWheels(m: Model, body: Group, axles: number[], track: number, radius: number, width: number) {
  return fitWheels(m, body, radius, axles.map(x => ({ x, track })), (hub, side) => {
    const face = side * (width / 2 + 0.005);
    m.form("drum", 0, 0, 0, 2 * radius, width, 2 * radius, "#373e40", hub, Math.PI / 2);
    m.form("drum", 0, 0, face, radius * 1.27, 0.013, radius * 1.27, "#bebbb0", hub, Math.PI / 2);
    for (let spoke = 0; spoke < 3; spoke++)
      m.form("box", 0, 0, face + side * 0.011, radius * 0.15, radius * 1.06, 0.012,
        "#515b5a", hub, 0, 0, spoke * Math.PI / 3);
    m.form("drum", 0, 0, face + side * 0.022, radius * 0.43, 0.015, radius * 0.43, "#b0aa99", hub, Math.PI / 2);
  });
}
