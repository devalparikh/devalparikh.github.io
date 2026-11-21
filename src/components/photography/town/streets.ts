import type { Model } from "./model";
import { Color, type Group } from "three";

const chalk = "#f5deba",
  iron = "#334548",
  wood = "#86674d";
export function streets(m: Model) {
  const { form, group, beam, sign, random } = m;
  function house(
    x: number,
    z: number,
    w: number,
    h: number,
    wall: string,
    roof: string,
    name = "",
    kind = "cornice",
    base = 0,
  ) {
    const g = group(x, base, z);
    const d = 2.25;
    form("masonry", 0, h / 2, 0, w, h, d, wall, g);
    form("box", 0, 0.11, 0, w + 0.14, 0.22, d + 0.12, chalk, g);
    form("box", 0, h - 0.1, 0, w + 0.17, 0.19, d + 0.18, chalk, g);
    if (kind === "gable") {
      for (const side of [-1, 1]) {
        form("slate", 0, h + 0.28, side * 0.62, w + 0.34, 0.13, 1.52, roof, g, side * 0.43);
      }
      // Triangular end wall between the roof slopes, with a ridge tile above.
      form("gable", 0, h + 0.25, 0, w, 0.54, 2.25, wall, g);
      form("drum", 0, h + 0.605, 0, 0.1, w + 0.29, 0.1, roof, g, 0, 0, Math.PI / 2);
      if (w > 2.3) {
        form("box", -w * 0.2, h + 0.41, 0.58, 0.44, 0.42, 0.42, wall, g);
        form("box", -w * 0.2, h + 0.44, 0.8, 0.31, 0.25, 0.04, "glass", g);
        form("box", -w * 0.2, h + 0.65, 0.58, 0.55, 0.07, 0.56, roof, g, 0.13);
      }
    } else if (kind === "mansard" || kind === "palazzo") {
      const french = kind === "mansard", rise = french ? 0.96 : 0.43;
      form("mansard", 0, h + rise / 2, 0, w + 0.26, rise, d + 0.28, roof, g);
      if (french) {
        for (const xx of [-w * 0.24, w * 0.24]) {
          form("box", xx, h + 0.32, 1.05, 0.41, 0.58, 0.36, chalk, g);
          form("arcade", xx, h + 0.09, 1.25, 0.45, 0.58, 0.08, chalk, g);
          form("round", xx, h + 0.42, 1.245, 0.29, 0.3, 0.035, "glass", g);
          form("box", xx, h + 0.28, 1.245, 0.29, 0.24, 0.03, "glass", g);
          form("gable", xx, h + 0.69, 1.07, 0.54, 0.2, 0.53, roof, g, 0, Math.PI/2);
        }
      }
    } else {
      form("box", 0, h + 0.1, 0, w + 0.24, 0.2, d + 0.24, roof, g);
      form("planks", 0, h + 0.23, 0, w - 0.25, 0.15, d - 0.2, roof, g);
    }
    form("box", w * 0.26, h + 0.56, -0.55, 0.35, 0.85, 0.36, wall, g);
    form("box", w * 0.26, h + 0.99, -0.55, 0.43, 0.11, 0.44, chalk, g);
    form("drum", w / 2 - 0.08, h * 0.49, 1.19, 0.065, h * 0.96, 0.065, "#7c7867", g);
    if (kind === "cornice") {
      form("box", -0.22, h + 0.29, -0.33, 0.69, 0.08, 0.65, "#304749", g);
      form("box", -0.22, h + 0.38, -0.33, 0.55, 0.13, 0.52, "#95aeb0", g);
      form("box", -0.22, h + 0.47, -0.33, 0.045, 0.05, 0.52, chalk, g);
    }
    if (kind === "oriel") {
      // A projecting three-light reading room, with splayed side sashes
      // and a sheet-metal cap. Corbels carry the bay above the entrance.
      for (const dx of [-0.39, 0.39])
        beam([dx, 1.5, 1.13], [dx, 1.75, 1.62], 0.093, roof, g);
      form("octagon", 0, 2.72, 1.15, 1.52, 1.99, 1.06, wall, g, 0, Math.PI/8);
      for (const y of [1.73, 2.59, 3.68])
        form("octagon", 0, y, 1.15, 1.6, 0.11, 1.18, chalk, g, 0, Math.PI/8);
      form("octagonalRoof", 0, 3.87, 1.16, 1.62, 0.34, 1.21, roof, g, 0, Math.PI/8);
      for (const side of [-1, 0, 1]) {
        const sash = group(side * 0.47, 0, side ? 1.52 : 1.66, g);
        sash.rotation.y = side * 0.62;
        for (const y of [2.13, 3.13]) {
          form("box", 0, y, 0, 0.5, 0.68, 0.06, chalk, sash);
          form("box", 0, y, 0.04, 0.41, 0.56, 0.035, "glass", sash);
          form("box", 0, y + 0.07, 0.06, 0.43, 0.036, 0.027, chalk, sash);
        }
      }
      for (let i = 0; i < 7; i++)
        form("box", w * (i - 3) / 7, h - 0.21, 1.19, 0.095, 0.23, 0.19, chalk, g);
    }
    const cols = Math.max(2, Math.round(w / 0.72));
    for (let y = 1.83; y < h - 0.25; y += 1.09) {
      for (let i = 0; i < cols; i++) {
        const xx = w * ((i + 0.5) / cols - 0.5);
        if (kind === "oriel") continue;
        if (kind === "palazzo") {
          const trim = "#f0ddbc";
          form("box", xx, y - 0.06, 1.15, 0.36, 0.57, 0.055, "glass", g);
          form("round", xx, y + 0.19, 1.15, 0.38, 0.41, 0.054, "glass", g);
          form("arcade", xx, y - 0.36, 1.19, 0.48, 0.86, 0.065, trim, g);
          for (const side of [-1, 1])
            form("planks", xx + side * 0.29, y - 0.04, 1.2, 0.13, 0.65, 0.055, "#668376", g, 0, side * 0.36);
          form("box", xx, y - 0.38, 1.21, 0.55, 0.07, 0.2, trim, g);
          continue;
        }
        form("box", xx, y, 1.14, 0.45, 0.69, 0.08, chalk, g);
        form("box", xx, y, 1.2, 0.34, 0.54, 0.04, "glass", g);
        form("box", xx, y, 1.23, 0.38, 0.045, 0.04, chalk, g);
        form("box", xx, y - 0.37, 1.18, 0.55, 0.075, 0.16, chalk, g);
        form("box", xx, y, 1.227, 0.028, 0.54, 0.038, chalk, g);
        if (kind === "gable" && i % 2 === 0) {
          for (const dx of [-0.29, 0.29]) form("planks", xx + dx, y, 1.17, 0.12, 0.61, 0.043, roof, g);
        }
        if (kind === "mansard") {
          form("box", xx, y - 0.18, 1.4, 0.59, 0.055, 0.29, iron, g);
          form("box", xx, y + 0.07, 1.52, 0.6, 0.04, 0.04, iron, g);
          for (const rail of [-0.24, -0.12, 0, 0.12, 0.24])
            form("drum", xx + rail, y - 0.05, 1.52, 0.028, 0.26, 0.028, iron, g);
        }
        if (i % 2 === 0 && y < 2) {
          form("box", xx, y - 0.37, 1.31, 0.51, 0.13, 0.18, "#765742", g);
          for (let j = 0; j < 5; j++)
            form(
              "leaf",
              xx - 0.19 + j * 0.095,
              y - 0.26,
              1.31,
              0.14,
              0.14,
              0.14,
              j % 3 ? "#77905b" : "#d28075",
              g,
            );
        }
      }
      for (const side of [-1, 1])
        for (const zz of [-0.6, 0.55]) {
          form("box", side * (w / 2 + 0.01), y, zz, 0.06, 0.62, 0.39, chalk, g);
          form("box", side * (w / 2 + 0.05), y, zz, 0.04, 0.51, 0.29, "glass", g);
        }
    }
    form("box", 0, 0.68, 1.14, w * 0.82, 1.06, 0.07, iron, g);
    for (const side of [-1, 1]) form("box", side * w * 0.25, 0.77, 1.19, w * 0.27, 0.71, 0.08, "glass", g);
    form("box", 0, 0.52, 1.2, 0.35, 0.91, 0.07, wood, g);
    form("box", 0, 0.68, 1.248, 0.25, 0.39, 0.028, "glass", g);
    form("round", 0.106, 0.43, 1.266, 0.043, 0.043, 0.035, chalk, g);
    if (name) {
      sign(name, 0, 1.38, 1.19, w * 0.92, 0.33, iron, g);
      if (kind === "oriel" || kind === "palazzo") {
        form("box", 0, 1.58, 1.24, w * 0.96, 0.07, 0.27, chalk, g);
      } else for (let i = 0; i < 11; i++) {
        const awning = i % 2 ? chalk : roof;
        form("box", w * ((i + 0.5) / 11 - 0.5), 1.1, 1.42, w / 11 + 0.005, 0.085, 0.54, awning, g, 0.24);
        form("round", w * ((i + 0.5) / 11 - 0.5), 0.976, 1.69, w / 11, 0.119, 0.045, awning, g);
        form("box", w * ((i + 0.5) / 11 - 0.5), 1.02, 1.69, w / 11 + 0.005, 0.095, 0.045, awning, g);
      }
    }
    return g;
  }
  function tree(x: number, z: number, height = 2.6, color = "#839866", type = "deciduous", base = 0) {
    const g = group(x, base, z);
    form("drum", 0, height * 0.29, 0, 0.16, height * 0.58, 0.16, wood, g);
    const crown = group(0, height * 0.43, 0, g);
    crown.userData.moving = true;
    m.trees.push(crown);
    if (type === "pine") {
      for (let i = 0; i < 5; i++) {
        const spread = height * (0.58 - i * 0.086);
        form("spruce", 0, height * (i * 0.115 - 0.05), 0, spread, height * (0.43 - i * 0.034),
          spread, i % 2 ? "#708570" : color, crown, 0, i * 1.27);
      }
    } else if (type === "palm") {
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4,
          spread = height * 0.19;
        form(
          "frond",
          Math.sin(a) * spread,
          height * 0.18,
          Math.cos(a) * spread,
          0.52,
          height * 0.87,
          height * 0.55,
          i % 3 ? color : "#8daa68",
          crown,
          0.18,
          a,
        );
        beam([0, -0.2, 0], [Math.sin(a) * spread, height * 0.23, Math.cos(a) * spread], 0.09, wood, crown);
      }
    } else {
      const underleaf = "#" + new Color(color).multiplyScalar(0.82).getHexString();
      const sunleaf = "#" + new Color(color).lerp(new Color("#e4dfab"), 0.13).getHexString();
      for (let i = 0; i < 6; i++) {
        const a = i * 2.4 + x, reach = height * (0.14 + 0.075 * random());
        const dx = Math.sin(a) * reach, dz = Math.cos(a) * reach;
        const y = height * (0.11 + i * 0.045);
        beam([0, -height * 0.12, 0], [dx, y, dz], height * 0.035, wood, crown);
        for (let j = 0; j < 3; j++) {
          const spread = j * height * 0.049;
          form("leaf", dx + spread * Math.cos(a + j), y + height * (0.05 + j * 0.063),
            dz + spread * Math.sin(a + j), height * (0.28 + random() * 0.08),
            height * 0.24, height * 0.29, j === 2 ? sunleaf : j === 0 ? underleaf : color,
            crown, 0.24, a + j);
        }
      }
    }
  }
  function lamp(x: number, z: number) {
    form("drum", x, 0.12, z, 0.3, 0.24, 0.3, iron);
    form("drum", x, 0.9, z, 0.09, 1.7, 0.09, iron);
    form("box", x, 1.85, z, 0.24, 0.36, 0.24, "glass");
    form("spire", x, 2.09, z, 0.36, 0.18, 0.36, iron);
  }
  function table(x: number, z: number, color: string) {
    form("drum", x, 0.4, z, 0.09, 0.8, 0.09, iron);
    form("drum", x, 0.68, z, 0.78, 0.1, 0.78, wood);
    form("drum", x, 1.05, z, 0.055, 0.9, 0.055, wood);
    form("cone", x, 1.67, z, 1.48, 0.35, 1.48, color);
    for (const side of [-1, 1]) {
      form("box", x + side * 0.62, 0.28, z, 0.36, 0.12, 0.4, wood);
      form("box", x + side * 0.78, 0.52, z, 0.08, 0.4, 0.39, wood);
      form("box", x + side * 0.62, 0.14, z, 0.13, 0.28, 0.16, iron);
    }
  }
  function patron(x: number, z: number, side: number, shirt: string, phase: number) {
    const seat = group(x + side * 0.62, 0, z);
    seat.rotation.y = (-side * Math.PI) / 2;
    form("round", 0, 0.57, 0, 0.31, 0.48, 0.24, shirt, seat);
    form("round", 0, 0.91, 0, 0.24, 0.27, 0.24, "#bf8d72", seat);
    form("round", 0, 1, -0.015, 0.25, 0.14, 0.25, iron, seat);
    for (const dx of [-0.08, 0.08]) {
      beam([dx, 0.37, 0], [dx, 0.31, 0.19], 0.11, iron, seat);
      beam([dx, 0.31, 0.19], [dx, 0.08, 0.21], 0.1, iron, seat);
    }
    const arm = group(0.14, 0.69, 0.02, seat);
    arm.userData.moving = true;
    beam([0, 0, 0], [0.02, -0.12, 0.1], 0.09, shirt, arm);
    beam([0.02, -0.12, 0.1], [0, -0.09, 0.26], 0.075, "#bf8d72", arm);
    form("drum", 0, -0.04, 0.27, 0.14, 0.14, 0.14, chalk, arm);
    m.choreographies.push(
      (t) => (arm.rotation.x = -0.78 * Math.pow(Math.max(0, Math.sin(t * 0.84 + phase)), 3)),
    );
  }
  function boat(x: number, z: number, color: string) {
    const g = group(x, 0.05, z);
    g.userData.moving = true;
    form("hull", 0, 0.09, 0, 2.4, 0.31, 0.76, wood, g, 0, Math.PI/2);
    for (const z of [-0.42, 0.37])
      form("planks", 0, 0.18, z, 0.55, 0.055, 0.14, chalk, g);
    beam([0, 1.87, 0], [0, 0.29, -1.05], 0.021, iron, g);
    form("drum", 0, 0.97, 0, 0.055, 1.9, 0.055, wood, g);
    form("spire", 0, 1.18, 0.17, 0.07, 1.46, 1.19, color, g, 0, 0, -0.08);
    m.choreographies.push((t) => {
      g.rotation.z = 0.065 * Math.sin(t * 1.4);
      g.position.z = z + 0.5 * Math.sin(t * 0.22);
    });
    return g;
  }
  function person(
    x: number,
    z: number,
    endX: number,
    endZ: number,
    shirt: string,
    occupation: "gardener" | "waiter" | "photographer" | "golfer" | "baker" | "hiker",
    phase: number,
    base = 0,
    route?: (distance: number) => [number, number, number],
  ) {
    const g = group(x, base, z),
      body = group(0, 0, 0, g);
    g.userData.moving = true;
    g.scale.setScalar(0.84);
    const skin = phase % 2 ? "#9f6348" : "#dba382";
    form("round", 0, 0.5, 0, 0.32, 0.46, 0.23, shirt, body);
    form("round", 0, 0.81, 0, 0.25, 0.29, 0.25, skin, body);
    form("round", 0, 0.91, -0.025, 0.29, 0.16, 0.28, occupation === "baker" ? chalk : "#4c3930", body);
    form("round", 0, 0.8, 0.116, 0.083, 0.086, 0.081, skin, body);
    if (phase % 3 === 0)
      form("round", 0.05, 0.79, -0.116, 0.14, 0.24, 0.14, "#503e34", body);
    const legs: Group[] = [];
    for (const side of [-1, 1]) {
      const leg = group(side * 0.079, 0.37, 0, body);
      legs.push(leg);
      form("drum", 0, -0.16, 0, 0.115, 0.3, 0.12, iron, leg);
      form("round", 0, -0.32, 0.035, 0.14, 0.105, 0.22, wood, leg);
    }
    const hand = group(0.16, 0.61, 0, body);
    form("box", 0, -0.1, 0.05, 0.1, 0.22, 0.11, shirt, hand, -0.35);
    form("round", 0, -0.2, 0.11, 0.105, 0.1, 0.1, skin, hand);
    form("box", -0.17, 0.48, 0, 0.1, 0.24, 0.12, shirt, body);
    if (occupation === "photographer") {
      form("box", 0, -0.1, 0.2, 0.23, 0.15, 0.13, iron, hand);
      form("drum", 0.025, -0.11, 0.29, 0.11, 0.1, 0.11, "#555c5a", hand, Math.PI/2);
      beam([-0.12, 0.69, 0.06], [0.1, 0.41, 0.13], 0.031, wood, body);
      form("round", 0.13, 0.4, 0.08, 0.16, 0.21, 0.21, wood, body);
    }
    if (occupation === "waiter" || occupation === "baker") {
      form("drum", 0, -0.18, 0.21, 0.44, 0.045, 0.44, iron, hand);
      form("round", 0, -0.11, 0.21, 0.25, 0.12, 0.15, "#dca65b", hand);
      form("box", 0, 0.45, 0.104, 0.21, 0.25, 0.03, chalk, body);
    }
    if (occupation === "gardener" || occupation === "golfer") {
      beam([0, -0.18, 0.13], [0.08, -0.58, 0.43], 0.045, wood, hand);
      form("box", 0.1, -0.57, 0.43, 0.18, 0.06, 0.1, iron, hand);
      form("drum", 0, 0.92, 0, 0.36, 0.055, 0.36, "#d6ad63", body);
    }
    if (occupation === "hiker") form("box", 0, 0.53, -0.13, 0.22, 0.29, 0.16, "#c98548", body);
    const pace = { gardener: 0.56, waiter: 0.98, photographer: 0.65, golfer: 0.47, baker: 0.82, hiker: 0.74 }[
      occupation
    ];
    let travelTime = 3.7;
    if (route) {
      let previous = route(0), length = 0;
      for (let i = 1; i <= 16; i++) {
        const point = route(i / 16);
        length += Math.hypot(point[0] - previous[0], point[1] - previous[1], point[2] - previous[2]);
        previous = point;
      }
      travelTime = Math.max(travelTime, length / 0.92);
    }
    const halfLap = travelTime + 2.3;
    const heading = Math.atan2(endX - x, endZ - z);
    m.choreographies.push((t) => {
      const cycle = (t * pace + phase) % (2 * halfLap);
      const outbound = cycle < halfLap;
      const legTime = cycle % halfLap;
      const progress = Math.min(1, legTime / travelTime);
      const distance = outbound ? progress : 1 - progress;
      const walking = progress < 1;
      const stride = Math.sin(t * (5 + 3 * pace) + phase);
      // Stop at the counter, flower bed or tee before turning for the return.
      const turn = Math.max(0, (legTime - halfLap + 0.6) / 0.6);
      let bearing = heading;
      if (route) {
        const [px, py, pz] = route(distance);
        const step = distance < 0.999 ? 0.001 : -0.001;
        const [nx, , nz] = route(distance + step);
        bearing = Math.atan2((nx - px) / step, (nz - pz) / step);
        g.position.set(px, py, pz);
      } else {
        g.position.set(x + (endX - x) * distance, base, z + (endZ - z) * distance);
      }
      g.rotation.y = bearing + (Number(!outbound) + turn) * Math.PI;
      legs[0].rotation.x = walking ? stride * 0.48 : 0;
      legs[1].rotation.x = -legs[0].rotation.x;
      body.position.y = walking ? 0.027 * Math.abs(stride) : 0;
      const gesture = walking ? 0 : Math.sin(Math.PI * Math.min(1, (legTime - travelTime) / 1.7));
      hand.rotation.x = walking ? stride * 0.2 : 0;
      if (occupation === "photographer") hand.rotation.x -= 1.75 * gesture;
      if (occupation === "gardener") body.rotation.x = 0.38 * gesture * Math.abs(Math.sin(t * 2));
      if (occupation === "golfer") hand.rotation.z = gesture * Math.sin(t * 3.1);
      if (occupation === "hiker") body.rotation.y = gesture * Math.sin(t * 1.4) * 0.62;
      if (occupation === "waiter" || occupation === "baker") {
        hand.rotation.x = -0.12 * gesture;
        body.rotation.x = 0.21 * gesture;
      }
    });
  }
  return { house, tree, lamp, table, patron, boat, person };
}
