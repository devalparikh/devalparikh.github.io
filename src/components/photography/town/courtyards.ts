import type { Model } from "./model";
import type { streets } from "./streets";
import { ease } from "./motion";
import type { neighborhood } from "./neighborhood";

const wood = "#a17b56", iron = "#465d61", paper = "#f2e4c4", red = "#b7644d",
  sage = "#778c69", blue = "#7598a4", gold = "#d5aa5f", floor = 0.068;

// Dimensions are in the same street units as the existing landmark precincts.
export function courtyards(m: Model, street: ReturnType<typeof streets>, n: ReturnType<typeof neighborhood>) {
  const { form, beam, group, sign } = m;
  const { person, tree, table, patron } = street;

  function trestle(x: number, z: number, w: number, d: number, top = 0.61, base = floor) {
    for (const dx of [-1, 1])
      for (const dz of [-1, 1])
        form("planks", x + dx * (w / 2 - 0.08), (base + top) / 2, z + dz * (d / 2 - 0.07),
          0.09, top - base, 0.09, wood);
    form("planks", x, top - 0.045, z, w, 0.09, d, "#c09a6f");
  }

  // A reach, a pause to inspect the work, then a return to rest.
  function worker(x: number, z: number, facing: number, color: string, phase: number, base = floor) {
    person(x, z, x, z, color, "maker", phase, base, {
      perform(t) {
        const cycle = (t + phase) % (5.7 + phase * 0.17);
        return {
          x, y: base, z, facing, step: 0,
          reach: ease(cycle / 1.6) * (1 - ease((cycle - 2.7) / 1.4))
        };
      },
    });
  }

  function pot(x: number, y: number, z: number, size: number, color: string) {
    form("round", x, y + size * 0.45, z, size, size * 0.91, size, color);
    form("drum", x, y + size * 0.83, z, size * 0.82, size * 0.15, size * 0.82, color);
    form("drum", x, y + size * 0.912, z, size * 0.63, 0.014, size * 0.63, "#665642");
  }
  function dryingLine(x: number, z: number, sheets: string[]) {
    for (const dx of [-1.32, 1.32])
      form("planks", x + dx, 0.88, z, 0.08, 1.62, 0.08, wood);
    for (const side of [-1, 1]) beam([x, 1.52, z], [x + side * 1.32, 1.66, z], 0.025, iron);
    sheets.forEach((color, i) => {
      const dx = (i - 1.5) * 0.59;
      const sheet = group(x + dx, 1.52 + 0.106 * Math.abs(dx), z);
      sheet.userData.moving = true;
      form("box", 0, -0.31, 0, 0.46, 0.62, 0.024, paper, sheet);
      form("box", 0, -0.29, 0.016, 0.36, 0.42, 0.014, color, sheet);
      form("spire", -0.035, -0.36, 0.029, 0.27, 0.18, 0.014, sage, sheet);
      form("round", 0.08, -0.19, 0.03, 0.09, 0.09, 0.01, paper, sheet);
      form("planks", -0.12, -0.015, 0.015, 0.03, 0.08, 0.04, wood, sheet);
      m.choreographies.push(t => { sheet.rotation.x = 0.11 * Math.sin(t * 1.46 + i * 0.67); });
    });
  }

  function awning(x: number, z: number, width: number, depth: number, tint: string, base = floor) {
    for (const side of [-1, 1])
      for (const end of [-1, 1])
        form("planks", x + side * (width / 2 - 0.12), base + 0.92 + end * 0.05,
          z + end * (depth / 2 - 0.1), 0.075, 1.84 + end * 0.1, 0.075, wood);
    for (let i = 0; i < 9; i++) {
      const u = x + (i - 4) * width / 9, color = i % 2 ? paper : tint;
      form("box", u, base + 1.85, z, width / 9 + 0.001, 0.051, depth, color, undefined, -0.096);
      form("box", u, base + 1.72, z - depth / 2, width / 9, 0.14, 0.043, color);
    }
  }

  function gunwales(x: number, y: number, z: number, length: number, height: number, width: number) {
    for (const side of [-1, 1]) {
      const point = (u: number) => [x + length * u / 2, y + height * (0.36 + 0.7 * u ** 4), z + side * width * (1 - u * u) / 2];
      for (let i = 0; i < 14; i++)
        beam(point(i / 7 - 1), point((i + 1) / 7 - 1), 0.038, "#cdac7c");
    }
  }

  function telescope(x: number, z: number, tint: string, angle: number) {
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      beam([x, 0.83, z], [x + 0.43 * Math.cos(a), floor, z + 0.43 * Math.sin(a)], 0.07, wood);
    }
    const mount = group(x, 0.84, z);
    mount.rotation.y = angle;
    const tube = group(0, 0.13, 0, mount);
    tube.rotation.x = 1.13;
    form("round", 0, -0.08, 0, 0.22, 0.35, 0.24, iron, mount);
    form("drum", 0, 0, 0, 0.22, 0.88, 0.22, tint, tube);
    form("drum", 0, 0.44, 0, 0.26, 0.08, 0.26, iron, tube);
    form("drum", 0, 0.483, 0, 0.21, 0.017, 0.21, blue, tube);
    form("drum", 0, -0.49, 0, 0.11, 0.15, 0.11, iron, tube);
  }

  return {
    printYard() {
      dryingLine(7.5, -2.65, [blue, gold, red, blue]);
      trestle(7.46, -0.43, 2.16, 0.85);
      form("box", 7.33, 0.64, -0.43, 1.2, 0.06, 0.69, iron);
      for (const x of [6.87, 7.79]) form("box", x, 0.82, -0.48, 0.07, 0.37, 0.12, iron);
      form("drum", 7.33, 0.85, -0.48, 0.28, 0.91, 0.28, blue, undefined, 0, 0, Math.PI / 2);
      form("rim", 7.91, 0.85, -0.48, 0.52, 0.52, 0.43, iron, undefined, 0, Math.PI / 2);
      for (const [i, ink] of [iron, red, blue].entries()) {
        form("drum", 8.22, 0.685, -0.69 + i * 0.24, 0.16, 0.15, 0.16, ink);
        form("drum", 8.22, 0.77, -0.69 + i * 0.24, 0.17, 0.026, 0.17, paper);
      }
      worker(7.56, 0.12, Math.PI, red, 3);
      // The canal continues between the new print yard and its towpath.
      form("lagoon", 7.52, 0.1, 3.95, 4.4, 0.055, 1.48, "#83ada8");
      for (const z of [3.15, 4.75]) form("masonry", 7.52, 0.21, z, 4.4, 0.35, 0.22, "#cfbfa6");
    },
    chessGrove() {
      tree(7.96, -2.97, 2.52, "#a7b988");
      form("setts", 7.12, 0.073, 0.54, 2.78, 0.012, 1.95, "#d3ccab");
      trestle(7.12, 0.54, 0.92, 0.88, 0.53);
      for (let i = 0; i < 64; i++) {
        const x = 6.805 + (i % 8) * 0.09, z = 0.225 + Math.floor(i / 8) * 0.09;
        form("box", x, 0.539, z, 0.091, 0.018, 0.091, (i + Math.floor(i / 8)) % 2 ? sage : paper);
        if ([1, 3, 14, 19, 33, 38, 50, 60].includes(i))
          form("cone", x, 0.594, z, 0.065, 0.09, 0.065, i < 32 ? iron : "#fff4d7");
      }
      for (const side of [-1, 1]) {
        const x = 7.12 + side * 0.65;
        trestle(x, 0.54, 0.4, 0.42, 0.31);
        person(x, 0.54, x, 0.54, side < 0 ? red : blue, "maker", 4 + side, 0.31, {
          perform(t) {
            return {
              x, y: 0.31, z: 0.54, facing: -side * Math.PI / 2, sitting: 1, step: 0,
              reach: Math.max(0, side * Math.sin(t * 0.68)) ** 3
            };
          },
        });
      }
      person(6.03, 3.23, 7.2, 2.38, blue, "reader", 5);
    },
    propagation() {
      awning(7.54, -2.22, 3.24, 1.51, "#8da57e");
      trestle(7.54, -2.02, 2.5, 0.9);
      for (let i = 0; i < 5; i++) {
        const x = 6.61 + i * 0.45;
        pot(x, 0.61, -2.03, 0.32, red);
        for (const side of [-1, 1])
          form("leaf", x + side * 0.062, 0.98, -2.03, 0.12, 0.23, 0.12, sage, undefined, 0, 0, -side * 0.52);
      }
      worker(7.53, -1.42, Math.PI, sage, 1);
      for (const z of [1.15, 2.68]) {
        form("planks", 7.2, 0.18, z, 2.7, 0.22, 0.82, wood);
        form("meadow", 7.2, 0.295, z, 2.57, 0.04, 0.69, "#907457");
        for (let i = 0; i < 9; i++)
          form("leaf", 6.13 + i * 0.266, 0.39, z + 0.13 * Math.sin(i), 0.24, 0.22, 0.28, i % 2 ? sage : "#adbd78");
      }
    },
    puppetShow() {
      const x = 7.48, z = -1.61;
      form("planks", x, 0.56, z, 2.38, 0.98, 0.93, "#759488");
      form("planks", x, 1.53, z - 0.38, 2.38, 1.13, 0.09, blue);
      for (const side of [-1, 1]) {
        form("planks", x + side * 1.13, 1.58, z, 0.12, 1.15, 0.93, wood);
        form("round", x + side * 0.96, 1.57, z + 0.42, 0.29, 0.98, 0.17, red);
        const doll = group(x + side * 0.44, 1.1, z + 0.18);
        doll.userData.moving = true;
        form("cone", 0, 0.17, 0, 0.27, 0.37, 0.23, side < 0 ? red : sage, doll);
        form("round", 0, 0.41, 0, 0.18, 0.2, 0.18, "#d5a380", doll);
        form("cone", 0, 0.56, 0, 0.21, 0.22, 0.2, gold, doll);
        for (const arm of [-1, 1])
          beam([arm * 0.06, 0.25, 0], [arm * 0.18, 0.28 - arm * side * 0.06, 0.035], 0.053, paper, doll);
        form("round", 0, 0.42, 0.082, 0.055, 0.05, 0.058, red, doll);
        m.choreographies.push(t => {
          const speak = Math.max(0, side * Math.sin(t * 0.73));
          doll.position.y = 1.1 + 0.13 * speak * Math.sin(t * 4.2);
          doll.rotation.z = side * (0.16 + speak * 0.23);
        });
      }
      form("gable", x, 2.17, z, 2.65, 0.42, 1.22, red);
      sign("GUIGNOL", x, 2.05, z + 0.53, 1.49, 0.29, iron);
      form("planks", x, 1.05, z + 0.44, 2.35, 0.09, 0.24, wood);
      for (let i = 0; i < 7; i++) form("box", x + (i - 3) * 0.33, 0.52, z + 0.47, 0.22, 0.67, 0.03, i % 2 ? "#799e93" : "#87a89a");
      person(7.15, 0.26, x, z, blue, "picnicker", 7);
      person(8.09, 0.5, x, z, gold, "picnicker", 2);
    },
    squero() {
      form("planks", 7.45, 0.17, -1.87, 4.26, 0.23, 6.54, "#bf9e78");
      // A tiled, open-front boat shed with loft timber and a caulking bench.
      for (const x of [6.19, 8.67])
        for (const z of [-4.55, -3.01]) form("planks", x, 1.09, z, 0.14, 1.61, 0.14, wood);
      form("planks", 7.43, 1.08, -4.61, 2.64, 1.59, 0.12, "#a58364");
      form("gable", 7.43, 2.01, -3.79, 3.02, 0.58, 2.02, "#af6c54");
      trestle(7.43, -4.12, 2.09, 0.52, 0.83, 0.285);
      for (let i = 0; i < 3; i++) form("planks", 7.46, 0.87 + i * 0.082, -4.11, 1.76, 0.075, 0.24, wood);
      for (const x of [6.47, 8.03]) trestle(x, -1.7, 0.3, 1.05, 0.57, 0.285);
      form("hull", 7.25, 0.63, -1.7, 3.37, 0.4, 0.74, "#645348");
      gunwales(7.25, 0.63, -1.7, 3.37, 0.4, 0.74);
      for (const x of [6.93, 7.49]) form("planks", x, 0.81, -1.7, 0.16, 0.055, 0.56, wood);
      worker(7.35, -1.13, Math.PI, blue, 5, 0.285);
      for (let i = 0; i < 3; i++)
        beam([6.51, 0.31, 0.52 + i * 0.15], [8.73, 0.32, 0.37 + i * 0.15], 0.09, wood);
    },
    pottery() {
      awning(7.5, -2.48, 3.24, 1.43, blue);
      trestle(7.5, -2.25, 2.79, 0.91);
      for (let i = 0; i < 6; i++) pot(6.41 + i * 0.43, 0.61, -2.23, 0.28 + 0.07 * (i % 3), [blue, red, gold][i % 3]);
      form("drum", 7.25, 0.27, -0.08, 0.36, 0.4, 0.36, wood);
      const wheel = group(7.25, 0.48, -0.08);
      wheel.userData.moving = true;
      form("drum", 0, 0, 0, 0.78, 0.07, 0.78, wood, wheel);
      form("round", 0, 0.16, 0, 0.37, 0.31, 0.37, red, wheel);
      form("drum", 0, 0.31, 0, 0.22, 0.04, 0.22, iron, wheel);
      form("rim", 0.18, 0.2, 0, 0.13, 0.17, 0.13, red, wheel);
      m.choreographies.push(t => { wheel.rotation.y = t * 1.85 + 0.18 * Math.sin(t * 2); });
      worker(7.23, 0.32, Math.PI, red, 2);
      n.stall(7.73, 3.45, "flowers", "#ab8654");
    },
    bottling() {
      for (const z of [-2.65, -1.94, -1.23]) {
        n.barrel(6.12, z, floor);
        n.barrel(6.72, z, floor);
      }
      trestle(7.75, 0.55, 2.12, 0.83);
      for (let i = 0; i < 10; i++) {
        const x = 7.1 + i % 5 * 0.26, z = 0.36 + Math.floor(i / 5) * 0.29;
        form("drum", x, 0.78, z, 0.13, 0.34, 0.13, "#556c57");
        form("drum", x, 0.99, z, 0.059, 0.105, 0.059, sage);
        form("drum", x, 0.78, z, 0.134, 0.1, 0.134, paper);
      }
      worker(7.62, 1.08, Math.PI, gold, 7);
      person(6.35, 3.28, 8.51, 1.69, red, "shopper", 4);
    },
    sailing() {
      // A finger pier branches from the existing tackle quay.
      form("planks", 6.74, 0.18, -4.61, 2.99, 0.23, 1.23, "#d6bc93");
      form("planks", 7.73, 0.18, -1.34, 1.01, 0.23, 5.39, wood);
      for (const z of [-3.55, -1.42, 0.96])
        form("drum", 8.15, 0.33, z, 0.14, 0.57, 0.14, iron);
      street.boat(6.57, -1.75, gold);
      street.boat(8.93, 1.74, "#8cb4ab");
      const ring = group(7.94, 0.84, 0.98);
      form("planks", 0, -0.25, 0, 0.08, 0.78, 0.09, wood, ring);
      form("rim", 0, 0, 0.075, 0.57, 0.57, 0.54, red, ring);
      for (const side of [-1, 1]) form("box", side * 0.246, 0, 0.077, 0.069, 0.12, 0.058, paper, ring);
      person(7.59, -3.7, 7.62, 0.47, blue, "hiker", 4, 0.295);
    },
    canoeBeach() {
      form("lagoon", 7.48, 0.085, 3.32, 4.38, 0.045, 4, "#93c5d4");
      form("round", 6.9, 0.12, 1.75, 5.4, 0.31, 2.64, "#e4cda0");
      // A lashed ama sits parallel to the dugout on its beach cradles.
      for (const x of [6.54, 8.12]) trestle(x, 0.28, 0.26, 1.49, 0.37);
      form("hull", 7.33, 0.39, -0.04, 3.43, 0.37, 0.48, "#a65e42");
      gunwales(7.33, 0.39, -0.04, 3.43, 0.37, 0.48);
      form("hull", 7.33, 0.43, 0.9, 2.35, 0.2, 0.19, wood);
      for (const x of [6.65, 7.89]) {
        beam([x, 0.55, -0.14], [x, 0.55, 0.92], 0.065, wood);
        form("planks", x, 0.59, 0.87, 0.1, 0.03, 0.17, paper);
      }
      for (const x of [8.37, 9.24]) form("planks", x, 0.57, -0.91, 0.1, 1.01, 0.13, wood);
      form("planks", 8.8, 0.96, -0.91, 1.12, 0.09, 0.21, wood);
      for (let i = 0; i < 3; i++) {
        const x = 8.5 + i * 0.26;
        beam([x, 1.18, -0.84], [x, 0.27, -0.67], 0.045, wood);
        form("leaf", x, 0.29, -0.67, 0.19, 0.43, 0.056, i % 2 ? gold : red, undefined, -0.18);
      }
      worker(7.21, -0.46, 0, red, 6);
      tree(8.31, -3.49, 2.71, sage, "palm");
      person(6.07, -2.15, 8.42, -1.67, gold, "beachcomber", 9);
      form("setts", 7.51, 0.076, -2.25, 4.42, 0.017, 0.62, "#cfbc9f");
    },
    fieldStation() {
      // Low cinder windbreak and weather instruments below the observatory shoulder.
      for (let i = 0; i < 12; i++) {
        const angle = 1.55 + i * 0.19;
        form("basalt", 7.41 + 1.87 * Math.cos(angle), 0.18, -1.86 + 1.32 * Math.sin(angle),
          0.53, 0.34 + 0.1 * Math.sin(i), 0.43, i % 3 ? "#9e8273" : "#a98f7f", undefined, 0, i);
      }
      form("drum", 8.61, 0.93, -3.62, 0.09, 1.73, 0.09, iron);
      const sensor = group(8.61, 1.83, -3.62);
      sensor.userData.moving = true;
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI * 2 / 3, dx = 0.29 * Math.cos(a), dz = 0.29 * Math.sin(a);
        beam([0, 0, 0], [dx, 0, dz], 0.033, iron, sensor);
        form("round", dx, 0, dz, 0.17, 0.11, 0.17, paper, sensor);
      }
      m.choreographies.push(t => { sensor.rotation.y = t * 2.1 + 0.38 * Math.sin(t * 0.83); });
      telescope(7.21, 0.9, paper, -0.9);
      trestle(7.78, -1.91, 1.96, 0.77);
      for (let i = 0; i < 5; i++) {
        const x = 7.02 + i * 0.35;
        form("box", x, 0.63, -1.92, 0.3, 0.04, 0.4, paper);
        form("basalt", x, 0.72, -1.92, 0.236, 0.17 + i % 2 * 0.08, 0.25, i % 2 ? "#936d5b" : iron, undefined, 0, i);
      }
      worker(7.57, -1.39, Math.PI, blue, 8);
      person(6.56, 1.94, 7.82, 1.45, gold, "photographer", 8);
    },
    practiceGreen() {
      form("round", 7.28, 0.105, -0.22, 3.93, 0.08, 7.57, "#b3c88b");
      for (const z of [-2.65, 1.04]) {
        form("drum", 7.56, 0.149, z, 0.17, 0.012, 0.17, iron);
        form("drum", 7.56, 0.53, z, 0.025, 0.76, 0.025, paper);
        form("box", 7.7, 0.84, z, 0.27, 0.14, 0.019, gold);
      }
      person(7.78, -0.82, 7.72, -1.54, sage, "golfer", 1, 0.143);
      for (const x of [6.23, 6.66]) {
        form("drum", x, 0.34, 3.42, 0.26, 0.55, 0.26, red);
        for (let i = 0; i < 3; i++) {
          const dx = 0.07 * (i - 1);
          beam([x + dx, 0.59, 3.42], [x + 2 * dx, 1.03 + i * 0.04, 3.47], 0.024, iron);
          form("round", x + 2 * dx, 1.06 + i * 0.04, 3.47, 0.11, 0.06, 0.06, iron);
        }
      }
    },
    juiceLanai() {
      n.kiosk(7.43, -3.27, "FRESH JUICE");
      trestle(7.48, -2.12, 1.64, 0.59);
      for (const x of [6.99, 7.37, 7.75]) {
        form("drum", x, 0.79, -2.1, 0.255, 0.36, 0.255, x < 7.1 ? gold : "#c58c5d");
        form("drum", x, 0.98, -2.1, 0.27, 0.045, 0.27, paper);
        form("box", x, 0.7, -1.95, 0.05, 0.07, 0.09, iron);
      }
      person(7.08, -0.87, 7.49, -1.65, sage, "shopper", 7);
      table(7.82, 0.82, "#a5b999");
      patron(7.82, 0.82, 1, blue, 5);
      form("lagoon", 7.48, 0.085, 3.35, 4.4, 0.05, 3.91, "#93c5d4");
      for (let i = 0; i < 7; i++)
        form("basalt", 5.55 + i * 0.62, 0.16, 1.83 + 0.21 * Math.cos(i * 1.2), 0.93, 0.36, 0.75, "#79786b", undefined, 0, i);
    },
    lookout() {
      form("setts", 7.25, 0.077, 0.07, 2.95, 0.025, 2.93, "#cfbf9e");
      telescope(7.18, -0.28, sage, -2.12);
      person(7.61, 0.04, 8.12, 0.85, "#9b6c51", "hiker", 4, 0.09);
      n.bench(8.01, -1.98, -0.26);
      tree(8.31, -3.85, 2.25, "#64826e", "pine");
      tree(6.54, 3.67, 1.67, sage, "pine");
    },
    parcelPlatform() {
      form("setts", 6.38, 0.16, 0.29, 6.51, 0.17, 0.94, "#c1afa0");
      for (let i = 0; i < 9; i++) form("planks", 5.43 + i * 0.45, 0.12, 1.37, 0.13, 0.09, 0.8, wood);
      for (const z of [1.15, 1.62]) form("box", 7.17, 0.21, z, 3.82, 0.08, 0.07, iron);
      form("planks", 9.02, 0.42, 1.37, 0.23, 0.43, 0.94, red);
      n.chalet(7.29, -3.54, "EXPÉDITION");
      const trolley = group(7.4, floor, -1.25);
      trolley.userData.moving = true;
      for (const dx of [-0.37, 0.37])
        for (const dz of [-0.24, 0.24]) form("rim", dx, 0.12, dz, 0.24, 0.24, 0.39, iron, trolley);
      form("planks", 0, 0.25, 0, 1.15, 0.1, 0.63, wood, trolley);
      for (const dz of [-0.23, 0.23]) beam([-0.5, 0.25, dz], [-0.66, 0.62, dz], 0.045, iron, trolley);
      beam([-0.66, 0.62, -0.23], [-0.66, 0.62, 0.23], 0.05, iron, trolley);
      for (const [dx, y, w, h, c] of [[-0.2, 0.49, 0.52, 0.38, red], [0.29, 0.45, 0.37, 0.3, sage], [-0.2, 0.79, 0.47, 0.22, gold]] as const) {
        form("box", dx, y, 0, w, h, 0.42, c, trolley);
        for (const side of [-1, 1]) form("box", dx + side * w * 0.29, y, 0, 0.033, h + 0.012, 0.43, paper, trolley);
      }
      // The porter pushes the load to dispatch, waits, then pulls it back.
      const shuttle = (t: number) => ease((t % 20 - 1) / 6) - ease((t % 20 - 11) / 6);
      m.choreographies.push(t => { trolley.position.x = 6.9 + 1.66 * shuttle(t); });
      person(0, 0, 0, 0, blue, "maker", 3, floor, {
        perform(t) {
          const u = shuttle(t);
          return {
            x: 6.02 + 1.66 * u, y: floor, z: -1.25, facing: Math.PI / 2,
            step: 0.68 * Math.sin(8 * Math.PI * u), reach: 0.89
          };
        },
      });
    },
    dairy() {
      n.chalet(7.37, -3.71, "FROMAGERIE");
      for (const z of [-0.96, 1.35]) {
        trestle(7.53, z, 2.29, 0.78);
        for (let i = 0; i < 4; i++) {
          const x = 6.76 + i * 0.51;
          form("drum", x, 0.715, z, 0.44, 0.21, 0.44, gold);
          form("drum", x, 0.727, z, 0.45, 0.045, 0.45, "#c39356");
          if (i % 2) form("drum", x, 0.90, z, 0.39, 0.16, 0.39, "#e3c37e");
        }
      }
      worker(7.59, -0.43, Math.PI, paper, 9);
      person(8.88, 2.92, 7.51, 2.08, red, "shopper", 5);
    },
    boules() {
      form("setts", 7.42, 0.083, 0, 3.36, 0.032, 6.14, "#d8c6a6");
      for (const x of [5.75, 9.09]) form("planks", x, 0.13, 0, 0.09, 0.12, 6.17, wood);
      for (const z of [-3.04, 3.04]) form("planks", 7.42, 0.13, z, 3.4, 0.12, 0.09, wood);
      // Two players at opposite ends roll the same boule back across the piste.
      for (const side of [-1, 1]) {
        person(7.42, side * 2.28, 7.42, 0, side > 0 ? red : blue, "maker", 5 + side, 0.1, {
          perform(t) {
            const cycle = (t + (side > 0 ? 0 : 7)) % 14;
            return {
              x: 7.42, y: 0.10, z: side * 2.28, facing: side > 0 ? Math.PI : 0, step: 0,
              reach: ease(cycle / 0.85) * (1 - ease((cycle - 0.91) / 1.05))
            };
          },
        });
      }
      const boule = group(7.43, 0.166, 0);
      boule.userData.moving = true;
      form("round", 0, 0, 0, 0.136, 0.136, 0.136, iron, boule);
      m.choreographies.push(t => {
        const leg = (t % 7 - 0.85) / 2.5, u = 1 - (1 - Math.min(1, Math.max(0, leg))) ** 2;
        boule.position.z = (Math.floor(t / 7) % 2 ? -1 : 1) * (1.99 - 3.98 * u);
      });
      form("round", 7.64, 0.145, -1.83, 0.09, 0.09, 0.09, "#b8814c");
      n.bench(7.74, 4.02);
    },
    busker() {
      const musician = group(7.38, floor, -0.98);
      person(0, 0, 0, 0, red, "maker", 4, 0, {
        parent: musician,
        perform: t => ({ x: 0, y: 0, z: 0, facing: 0, step: 0, reach: 0.52 + 0.17 * Math.sin(2.1 * t) })
      });
      const bellows = group(0, 0.41, 0.173, musician);
      bellows.userData.moving = true;
      for (let i = 0; i < 9; i++) form("box", -0.088 + i * 0.022, 0, 0, 0.023, 0.17 + (i % 2) * 0.024, 0.12 + (i % 2) * 0.012, i % 2 ? iron : gold, bellows);
      for (const x of [-0.14, 0.14]) form("box", x, 0, 0, 0.083, 0.23, 0.15, red, bellows);
      for (let i = 0; i < 7; i++) form("box", 0.146, i * 0.026 - 0.08, 0.08, 0.069, 0.018, 0.013, paper, bellows);
      m.choreographies.push(t => { bellows.scale.x = 1 + 0.21 * Math.sin(2.1 * t); });
      form("planks", 7.45, 0.13, -0.37, 0.87, 0.12, 0.43, "#745643");
      form("planks", 7.45, 0.27, -0.58, 0.88, 0.31, 0.06, wood, undefined, -0.26);
      for (let i = 0; i < 4; i++) form("drum", 7.22 + i * 0.103, 0.20, -0.37 + 0.045 * Math.cos(i), 0.06, 0.016, 0.06, gold);
      person(8.43, 1.48, 8.08, 0.14, blue, "photographer", 4);
      table(6.62, 3.39, sage);
      patron(6.62, 3.39, -1, gold, 7);
    },
    bindery() {
      form("setts", 6.64, 0.16, -4.53, 2.77, 0.24, 1.6, "#cdc0ab");
      form("planks", 7.45, 0.17, -2.04, 3.59, 0.22, 3.52, "#bc9e79");
      trestle(7.43, -2.09, 2.14, 0.71, 0.86, 0.28);
      for (let i = 0; i < 7; i++)
        form("box", 6.86, 0.889 + i * 0.054, -2.09, 0.41, 0.05, 0.32, i % 2 ? red : paper, undefined, 0, i * 0.049);
      for (const x of [7.42, 8.0])
        form("drum", x, 1.12, -2.03, 0.055, 0.52, 0.055, iron);
      form("planks", 7.71, 1.23, -2.03, 0.71, 0.083, 0.37, wood);
      form("planks", 7.71, 0.955, -2.03, 0.65, 0.12, 0.39, wood);
      worker(7.61, -1.58, Math.PI, sage, 6, 0.28);
      street.boat(7.7, 2.21, "#b7c1a1");
    },
  };
}
