import type { Model } from "./model";
import type { Group } from "three";

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
    form("box", 0, h / 2, 0, w, h, d, wall, g);
    form("box", 0, 0.11, 0, w + 0.14, 0.22, d + 0.12, chalk, g);
    form("box", 0, h - 0.1, 0, w + 0.17, 0.19, d + 0.18, chalk, g);
    if (kind === "gable") {
      for (const side of [-1, 1]) {
        form("box", 0, h + 0.28, side * 0.62, w + 0.34, 0.13, 1.52, roof, g, side * 0.43);
        for (let i = 0; i < 9; i++)
          form("box", ((i - 4) * w) / 9, h + 0.36, side * 0.62, 0.035, 0.06, 1.51, "#765348", g, side * 0.43);
      }
    } else {
      form("box", 0, h + 0.1, 0, w + 0.24, 0.2, d + 0.24, roof, g);
      form("box", 0, h + 0.23, 0, w - 0.25, 0.15, d - 0.2, roof, g);
    }
    form("box", w * 0.26, h + 0.56, -0.55, 0.35, 0.85, 0.36, wall, g);
    form("box", w * 0.26, h + 0.99, -0.55, 0.43, 0.11, 0.44, chalk, g);
    // Herringbone patches, downspouts, shutters and roof flashing break up
    // the larger painted surfaces at the scale of a shop window.
    for (let row = 0; row < Math.floor(h * 4); row++) {
      for (let j = 0; j < 3; j++) {
        const xx = (random() - 0.5) * (w - 0.32);
        form(
          "box",
          xx,
          0.27 + row * 0.22,
          1.132,
          0.13 + random() * 0.15,
          0.045,
          0.018,
          j % 2 ? "#bc967b" : "#d2ab87",
          g,
        );
        form(
          "box",
          w / 2 + 0.008,
          0.27 + row * 0.22,
          (random() - 0.5) * 1.95,
          0.018,
          0.043,
          0.21,
          "#b59377",
          g,
        );
      }
    }
    form("drum", w / 2 - 0.08, h * 0.49, 1.19, 0.065, h * 0.96, 0.065, "#7c7867", g);
    if (kind === "cornice") {
      form("box", -0.22, h + 0.29, -0.33, 0.69, 0.08, 0.65, "#304749", g);
      form("box", -0.22, h + 0.38, -0.33, 0.55, 0.13, 0.52, "#95aeb0", g);
      form("box", -0.22, h + 0.47, -0.33, 0.045, 0.05, 0.52, chalk, g);
    }
    const cols = Math.max(2, Math.round(w / 0.72));
    for (let y = 1.83; y < h - 0.25; y += 1.09) {
      for (let i = 0; i < cols; i++) {
        const xx = w * ((i + 0.5) / cols - 0.5);
        form("box", xx, y, 1.14, 0.45, 0.69, 0.08, chalk, g);
        form("box", xx, y, 1.2, 0.34, 0.54, 0.04, "glass", g);
        form("box", xx, y, 1.23, 0.38, 0.045, 0.04, chalk, g);
        form("box", xx, y - 0.37, 1.18, 0.55, 0.075, 0.16, chalk, g);
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
    if (name) {
      sign(name, 0, 1.38, 1.19, w * 0.92, 0.33, iron, g);
      for (let i = 0; i < 11; i++) {
        const awning = i % 2 ? chalk : roof;
        form("box", w * ((i + 0.5) / 11 - 0.5), 1.1, 1.42, w / 11 + 0.005, 0.085, 0.54, awning, g, 0.24);
        form("box", w * ((i + 0.5) / 11 - 0.5), 0.99, 1.69, w / 11 + 0.005, 0.14, 0.06, awning, g);
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
      for (let i = 0; i < 3; i++)
        form(
          "cone",
          0,
          i * height * 0.17,
          0,
          height * (0.55 - i * 0.12),
          height * 0.46,
          height * (0.55 - i * 0.12),
          i === 1 ? "#657f5c" : color,
          crown,
        );
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
      for (let i = 0; i < 15; i++) {
        const a = i * 2.4,
          r = height * 0.17 * Math.sqrt(random());
        form(
          "leaf",
          Math.sin(a) * r,
          height * (0.12 + random() * 0.29),
          Math.cos(a) * r,
          height * 0.34,
          height * 0.39,
          height * 0.32,
          color,
          crown,
          random(),
          a,
        );
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
    form("leaf", 0, 0.1, 0, 0.76, 0.38, 2.4, wood, g);
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
  ) {
    const g = group(x, base, z),
      body = group(0, 0, 0, g);
    g.userData.moving = true;
    const skin = phase % 2 ? "#9f6348" : "#dba382";
    form("round", 0, 0.5, 0, 0.32, 0.46, 0.23, shirt, body);
    form("round", 0, 0.81, 0, 0.25, 0.29, 0.25, skin, body);
    form("round", 0, 0.91, -0.025, 0.29, 0.16, 0.28, occupation === "baker" ? chalk : "#4c3930", body);
    const legs: Group[] = [];
    for (const side of [-1, 1]) {
      const leg = group(side * 0.079, 0.37, 0, body);
      legs.push(leg);
      form("drum", 0, -0.16, 0, 0.115, 0.3, 0.12, iron, leg);
      form("box", 0, -0.32, 0.035, 0.13, 0.09, 0.2, wood, leg);
    }
    const hand = group(0.16, 0.61, 0, body);
    form("box", 0, -0.1, 0.05, 0.1, 0.22, 0.11, shirt, hand, -0.35);
    form("round", 0, -0.2, 0.11, 0.105, 0.1, 0.1, skin, hand);
    form("box", -0.17, 0.48, 0, 0.1, 0.24, 0.12, shirt, body);
    if (occupation === "photographer") form("box", 0, -0.08, 0.2, 0.24, 0.14, 0.16, iron, hand);
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
    const heading = Math.atan2(endX - x, endZ - z);
    m.choreographies.push((t) => {
      const cycle = (t * pace + phase) % 12;
      const outbound = cycle < 6;
      const legTime = cycle % 6;
      const progress = Math.min(1, legTime / 3.7);
      const distance = outbound ? progress : 1 - progress;
      const walking = progress < 1;
      const stride = Math.sin(t * (5 + 3 * pace) + phase);
      // Stop at the counter, flower bed or tee before turning for the return.
      const turn = Math.max(0, (legTime - 5.4) / 0.6);
      g.position.set(x + (endX - x) * distance, base, z + (endZ - z) * distance);
      g.rotation.y = heading + (Number(!outbound) + turn) * Math.PI;
      legs[0].rotation.x = walking ? stride * 0.48 : 0;
      legs[1].rotation.x = -legs[0].rotation.x;
      body.position.y = walking ? 0.027 * Math.abs(stride) : 0;
      const gesture = walking ? 0 : Math.sin(Math.PI * Math.min(1, (legTime - 3.7) / 1.7));
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
