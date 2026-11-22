import type { Model } from "./model";
import { residents } from "./residents";
import { Color } from "three";

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
  // A shallow swag between real anchors. Pendants hang vertically off the cord.
  function festoon(x1: number, z1: number, x2: number, z2: number, height: number, bulbs: number) {
    const point = (u: number) => [
      x1 + (x2 - x1) * u, height - 1.28 * u * (1 - u), z1 + (z2 - z1) * u,
    ];
    for (let i = 0; i <= bulbs; i++)
      beam(point(i / (bulbs + 1)), point((i + 1) / (bulbs + 1)), 0.027, iron);
    for (let i = 1; i <= bulbs; i++) {
      const [x, y, z] = point(i / (bulbs + 1));
      form("drum", x, y - 0.044, z, 0.064, 0.092, 0.064, iron);
      form("round", x, y - 0.13, z, 0.145, 0.17, 0.145, "bulb");
    }
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
    const hair = phase % 3 === 0 ? "#a16748" : "#483e37";
    form("round", 0, 0.95, -0.088, 0.23, 0.20, 0.12, hair, seat);
    if (phase % 3 === 0) form("round", 0.04, 0.91, -0.15, 0.145, 0.13, 0.13, hair, seat);
    form("round", 0, 0.91, 0.118, 0.06, 0.068, 0.055, "#bf8d72", seat);
    for (const side of [-1,1]) {
      form("round",side*.048,.932,.104,.027,.029,.018,iron,seat);
      form("round",side*.048,.951,.102,.053,.014,.018,hair,seat);
      form("box",side*.055,.723,.084,.076,.061,.024,chalk,seat,0,0,side*.48);
    }
    form("round",0,.869,.106,.062,.014,.016,"#915e50",seat);
    // One hand rests across the lap while the other lifts the cup.
    beam([-0.12, 0.69, 0], [-0.17, 0.5, 0.04], 0.10, shirt, seat);
    beam([-0.17, 0.5, 0.04], [-0.06, 0.45, 0.14], 0.078, "#bf8d72", seat);
    for (const dx of [-0.08, 0.08])
      form("round", dx, 0.093, 0.245, 0.12, 0.09, 0.17, wood, seat);
    const arm = group(0.14, 0.69, 0.02, seat);
    arm.userData.moving = true;
    beam([0, 0, 0], [0.02, -0.12, 0.1], 0.09, shirt, arm);
    beam([0.02, -0.12, 0.1], [0, -0.09, 0.26], 0.075, "#bf8d72", arm);
    form("drum", 0, -0.04, 0.27, 0.14, 0.14, 0.14, chalk, arm);
    m.choreographies.push(
      (t) => (arm.rotation.x = -0.78 * Math.pow(Math.max(0, Math.sin(t * (0.52 + 0.047 * phase) + phase)), 3)),
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
  return { house, tree, lamp, festoon, table, patron, boat, person: residents(m) };
}
