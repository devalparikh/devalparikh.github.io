import { Coachwork, type Finish, type Point } from "./coachwork";

type RoadCar = "tesla" | "carrera" | "ferrari";
type Section = [x: number, sill: number, shoulder: number, halfWidth: number, deck: number];
type Cabin = [x: number, belt: number, crown: number, sillWidth: number, roofWidth: number];
// Model 3 (pre-refresh), 992.1 Carrera Coupé and 488 GTB. The axle
// spacing and overhangs are relative to each existing car’s scene length.
const profiles: Record<RoadCar, { axles: [number, number]; radius: number; body: Section[]; cabin: Cabin[] }> = {
  tesla: {
    axles: [-0.585, 0.644],
    radius: 0.146,
    body: [
      [-1, 0.145, 0.303, 0.298, 0.344],
      [-0.93, 0.103, 0.355, 0.365, 0.365],
      [-0.69, 0.079, 0.389, 0.391, 0.377],
      [-0.32, 0.073, 0.376, 0.394, 0.363],
      [0.22, 0.073, 0.356, 0.394, 0.349],
      [0.62, 0.077, 0.342, 0.386, 0.333],
      [0.82, 0.088, 0.323, 0.376, 0.29],
      [0.954, 0.101, 0.262, 0.339, 0.253],
      [1, 0.13, 0.218, 0.278, 0.231],
    ],
    cabin: [
      [-0.83, 0.365, 0.38, 0.308, 0.266],
      [-0.53, 0.372, 0.529, 0.336, 0.257],
      [-0.29, 0.369, 0.604, 0.347, 0.251],
      [-0.09, 0.362, 0.618, 0.35, 0.25],
      [0.12, 0.354, 0.602, 0.345, 0.248],
      [0.26, 0.347, 0.556, 0.34, 0.25],
      [0.59, 0.331, 0.349, 0.321, 0.272],
    ],
  },
  carrera: {
    axles: [-0.482, 0.539],
    radius: 0.145,
    body: [
      [-0.94, 0.128, 0.307, 0.294, 0.319],
      [-0.868, 0.084, 0.357, 0.365, 0.35],
      [-0.67, 0.071, 0.383, 0.386, 0.351],
      [-0.46, 0.061, 0.374, 0.383, 0.343],
      [-0.23, 0.063, 0.325, 0.36, 0.322],
      [0.17, 0.064, 0.302, 0.35, 0.295],
      [0.48, 0.067, 0.328, 0.374, 0.274],
      [0.68, 0.072, 0.316, 0.368, 0.246],
      [0.845, 0.082, 0.26, 0.338, 0.216],
      [0.94, 0.109, 0.199, 0.28, 0.206],
    ],
    cabin: [
      [-0.765, 0.345, 0.365, 0.274, 0.22],
      [-0.57, 0.35, 0.433, 0.291, 0.22],
      [-0.356, 0.339, 0.512, 0.3, 0.226],
      [-0.17, 0.325, 0.544, 0.303, 0.226],
      [0.06, 0.308, 0.543, 0.301, 0.232],
      [0.19, 0.3, 0.508, 0.296, 0.233],
      [0.418, 0.281, 0.303, 0.287, 0.242],
    ],
  },
  ferrari: {
    axles: [-0.66, 0.5],
    radius: 0.151,
    body: [
      [-1, 0.116, 0.32, 0.316, 0.354],
      [-0.923, 0.078, 0.371, 0.399, 0.377],
      [-0.67, 0.062, 0.399, 0.426, 0.361],
      [-0.415, 0.059, 0.373, 0.42, 0.334],
      [-0.2, 0.061, 0.304, 0.389, 0.295],
      [0.17, 0.057, 0.284, 0.38, 0.269],
      [0.54, 0.06, 0.332, 0.42, 0.258],
      [0.73, 0.066, 0.311, 0.411, 0.233],
      [0.91, 0.072, 0.242, 0.378, 0.194],
      [1, 0.09, 0.178, 0.295, 0.176],
    ],
    cabin: [
      [-0.63, 0.343, 0.372, 0.278, 0.206],
      [-0.379, 0.332, 0.46, 0.302, 0.216],
      [-0.245, 0.305, 0.511, 0.305, 0.213],
      [-0.09, 0.288, 0.529, 0.307, 0.216],
      [0.115, 0.276, 0.52, 0.307, 0.216],
      [0.216, 0.27, 0.493, 0.307, 0.221],
      [0.525, 0.257, 0.28, 0.308, 0.234],
    ],
  },
};

const rubber = "#292c30",
  dark = "#242a2d",
  glass = "#415966",
  windshield = "#536b77",
  alloy = "#a5a7a4",
  lens = "headlamp",
  red = "#ad3a39";

// A turned section includes the tyre shoulder, sidewall, rim lip and dish.
// The spare uses the same wheel rotated onto the tailgate.
function wheel(
  m: Coachwork,
  kind: RoadCar | "jeep",
  x: number,
  r: number,
  track: number,
  side: number,
  spare = false,
) {
  const truck = kind === "jeep",
    aero = kind === "tesla";
  const width = truck ? 0.067 : 0.05;
  const at = (u: number, v: number, depth: number): Point =>
    spare ? [-0.87 - depth, 0.439 + v, u] : [x + u, r + v, side * (track + depth)];
  const point = (rad: number, t: number, d: number) => at(rad * r * Math.cos(t), rad * r * Math.sin(t), d);
  const axial: Point = spare ? [-1, 0, 0] : [0, 0, side];
  const rim = truck ? 0.57 : 0.72;
  const lathe: [number, number, Finish][] = [
    [0.12, -width, rubber],
    [0.88, -width, rubber],
    [1, -width * 0.74, rubber],
    [1, width * 0.64, rubber],
    [0.94, width, rubber],
    [rim, width * 1.07, rubber],
    [rim - 0.045, width * 1.1, alloy],
    [rim - 0.08, width * 0.91, "#66696a"],
    [0.015, width * 0.91, aero ? "#626971" : "#404447"],
  ];
  const count = truck ? 20 : 24;
  for (let j = 1; j < lathe.length; j++) {
    const [a, da] = lathe[j - 1],
      [b, db, color] = lathe[j];
    const points: Point[] = [],
      indices: number[] = [];
    for (let i = 0; i <= count; i++) {
      const t = (i * 2 * Math.PI) / count;
      points.push(point(a, t, da), point(b, t, db));
      if (i < count) {
        const n = i * 2;
        if (side === 1) indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
        else indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      }
    }
    m.surface(points, indices, color);
  }
  const spokes = kind === "carrera" ? 10 : 5;
  for (let i = 0; i < spokes; i++) {
    const t = Math.PI / 2 + (i * 2 * Math.PI) / spokes;
    const tip = aero ? 0.46 : truck ? 0.38 : kind === "ferrari" ? 0.19 : 0.105;
    const d = width * 1.13;
    m.panel(
      [
        point(0.15, t - 0.38, d),
        point(rim - 0.052, t - tip, d),
        point(rim - 0.052, t + tip, d),
        point(0.36, t + (aero ? 0.34 : 0.13), d),
        point(0.15, t + 0.38, d),
      ],
      axial,
      aero ? "#949ca0" : truck ? "#7c8180" : alloy,
    );
  }
  m.panel(
    Array.from({ length: 12 }, (_, i) => point(truck ? 0.235 : 0.163, (i * Math.PI) / 6, width * 1.18)),
    axial,
    kind === "ferrari" ? "#dab451" : truck ? "#42494b" : "#bec0b9",
  );
}

function sectionAt(sections: Section[], x: number): Section {
  const end = sections.findIndex((row) => row[0] >= x);
  if (end <= 0) return end === 0 ? sections[0] : sections[sections.length - 1];
  const a = sections[end - 1],
    b = sections[end];
  const t = (x - a[0]) / (b[0] - a[0]);
  return [x, ...a.slice(1).map((v, i) => v + (b[i + 1] - v) * t)] as Section;
}

function shell(m: Coachwork, kind: RoadCar) {
  const { body, axles, radius } = profiles[kind];
  const stations = new Set(body.map((s) => s[0]));
  const clearance = radius + 0.011;
  for (const axle of axles) {
    for (let i = 0; i <= 12; i++) stations.add(axle - clearance * Math.cos((i * Math.PI) / 12));
    for (const side of [-1, 1]) stations.add(axle + side * (clearance + 0.008));
  }
  const rings = [...stations]
    .sort((a, b) => a - b)
    .map((x) => {
      const [, sill, shoulder, w, deck] = sectionAt(body, x);
      const offset = Math.min(...axles.map((a) => Math.abs(x - a)));
      const lip =
        offset <= clearance + 1e-8 ? radius + Math.sqrt(Math.max(0, clearance ** 2 - offset ** 2)) : sill;
      const belt = Math.max(shoulder - 0.04, lip + 0.008);
      const sideProfile = [
        [lip, w - 0.012],
        [Math.min(belt, lip + 0.018), w - 0.003],
        [belt, w],
        [shoulder - 0.013, w * 0.935],
        [shoulder + 0.004, w * 0.74],
        [deck, w * 0.62],
        [deck + 0.004, 0],
      ];
      return [
        [x, sill, -w * 0.66] as Point,
        [x, sill, w * 0.66] as Point,
        ...sideProfile.map(([h, z]): Point => [x, h, z]),
        ...sideProfile
          .slice(0, -1)
          .reverse()
          .map(([h, z]): Point => [x, h, -z]),
      ];
    });
  m.loft(rings);
}

function cabin(m: Coachwork, sections: Cabin[], kind: RoadCar | "jeep") {
  for (let i = 1; i < sections.length; i++) {
    const back = sections[i - 1],
      front = sections[i];
    for (const side of [-1, 1]) {
      const sample = (u: number, v: number): Point => {
        const [x, low, high, w, roof] = back.map((b, j) => b + (front[j] - b) * u);
        return [x, low + (high - low) * v, side * (w + (roof - w) * v)];
      };
      // Continue a pane over intermediate sections. Only structural pillars
      // interrupt the daylight opening.
      const u0 = i === 2 ? 0.14 : i === 4 ? (kind === "jeep" ? 0.7 : 0.1) : 0;
      const u1 = i === sections.length - 1 ? 0.92 : 1;
      const pane = (a: number, b: number, c: number, d: number, finish?: Finish) => {
        if (b > a && d > c)
          m.panel([sample(a, c), sample(b, c), sample(b, d), sample(a, d)], [0, 0, side], finish);
      };
      pane(0, 1, 0, 0.067);
      pane(0, 1, 0.93, 1);
      pane(0, u0, 0.067, 0.93, i === 4 ? dark : undefined);
      pane(u1, 1, 0.067, 0.93);
      pane(u0, u1, 0.067, 0.93, i === 1 && kind !== "tesla" ? undefined : glass);
      const screen = i === sections.length - 1 || i === 1 || (i === 2 && kind !== "jeep");
      const roofColor = screen ? windshield : kind === "tesla" ? "#34454c" : undefined;
      const crown = (s: Cabin, t: number): Point => [s[0], s[2] + 0.008 * (1 - t), side * s[4] * t];
      m.panel([crown(back, 0), crown(front, 0), crown(front, 0.94), crown(back, 0.94)], [0, 1, 0], roofColor);
      m.panel([crown(back, 0.94), crown(front, 0.94), crown(front, 1), crown(back, 1)], [0, 1, 0]);
    }
  }
}

function sportsCar(m: Coachwork, kind: RoadCar) {
  const { body, axles, radius } = profiles[kind];
  shell(m, kind);
  cabin(m, profiles[kind].cabin, kind);
  for (const s of [-1, 1]) {
    for (const x of axles) wheel(m, kind, x, radius, sectionAt(body, x)[3] - 0.052, s);
    const sidePanel = (points: number[][], color: Finish) =>
      m.panel(
        points.map(([x, y, z]): Point => [x, y, s * z]),
        [0, 0, s],
        color,
      );
    // Contoured headlamp lenses follow the changing fender height and width.
    const top = (x: number, t: number, lift: number): Point => {
      const [, , h, w, deck] = sectionAt(body, x);
      const y =
        t < 0.62
          ? deck + 0.004 * (1 - t / 0.62)
          : t < 0.74
            ? deck + ((h + 0.004 - deck) * (t - 0.62)) / 0.12
            : h + 0.004 - (0.017 * (t - 0.74)) / 0.195;
      return [x, y + lift, s * w * t];
    };
    // Trace lenses and bonnet shut lines with short cross-sections. A single
    // flat decal would vanish into the fender as it curves down to the nose.
    function hoodStrip(rows: number[][], finish: Finish, lift = 0.006) {
      for (let i = 1; i < rows.length; i++) {
        const [x, a, b] = rows[i - 1],
          [nx, na, nb] = rows[i];
        m.panel([top(x, a, lift), top(x, b, lift), top(nx, nb, lift), top(nx, na, lift)], [0, 1, 0], finish);
      }
    }
    const seam = kind === "tesla" ? "#abb1ac" : kind === "carrera" ? "#647f8a" : "#a13a32";
    function doorLine(nodes: number[][]) {
      const locate = ([x, y]: number[], dx: number, dy: number): Point => {
        const [, sill, shoulder, w] = sectionAt(body, x + dx);
        const breadth = w * (1 - 0.065 * Math.max(0, (y + dy - (shoulder - 0.04)) / 0.04));
        return [x + dx, y + dy, s * (breadth + 0.0015 - 0.004 * Math.max(0, (sill + 0.025 - y) / 0.025))];
      };
      for (let i = 1; i < nodes.length; i++) {
        const a = nodes[i - 1],
          b = nodes[i],
          dx = b[0] - a[0],
          dy = b[1] - a[1];
        const scale = 0.0022 / Math.hypot(dx, dy);
        m.panel(
          [
            locate(a, -dy * scale, dx * scale),
            locate(b, -dy * scale, dx * scale),
            locate(b, dy * scale, -dx * scale),
            locate(a, dy * scale, -dx * scale),
          ],
          [0, 0, s],
          seam,
        );
      }
    }
    const frontDoor = kind === "tesla" ? 0.39 : 0.286;
    const rearDoor = kind === "tesla" ? -0.57 : kind === "carrera" ? -0.286 : -0.19;
    doorLine([
      [frontDoor, 0.326],
      [frontDoor + 0.028, 0.257],
      [frontDoor + 0.018, 0.154],
      [frontDoor - 0.018, 0.116],
      [-0.07, 0.107],
      [rearDoor + 0.075, 0.123],
      [rearDoor + 0.042, 0.191],
      [rearDoor, 0.299],
    ]);
    if (kind === "tesla")
      doorLine([
        [-0.09, 0.355],
        [-0.104, 0.285],
        [-0.127, 0.15],
        [-0.141, 0.113],
      ]);
    if (kind !== "ferrari")
      hoodStrip(
        [
          [0.52, 0.588, 0.6],
          [0.67, 0.551, 0.564],
          [0.81, 0.494, 0.509],
          [0.89, 0.421, 0.436],
          [0.926, 0.319, 0.334],
        ],
        seam,
        0.0038,
      );
    const mirrorX = kind === "tesla" ? 0.379 : 0.265;
    const mirrorY = kind === "tesla" ? 0.393 : kind === "carrera" ? 0.34 : 0.324;
    m.box([mirrorX, mirrorY, s * 0.341], [0.039, 0.026, 0.082], dark, [s * 0.22, 0, 0]);
    const mirror = [
      [-0.041, 0.027, 0.014],
      [-0.023, 0.04, 0.021],
      [0.017, 0.037, 0.02],
      [0.046, 0.015, 0.011],
    ];
    m.loft(
      mirror.map(([dx, w, h]) => {
        const y = mirrorY + 0.014,
          z = s * 0.389,
          x = mirrorX + dx;
        return [
          [x, y - h, z - w * 0.74],
          [x, y - h, z + w * 0.74],
          [x, y, z + w],
          [x, y + h, z + w * 0.68],
          [x, y + h, z - w * 0.68],
          [x, y, z - w],
        ] as Point[];
      }),
    );
    m.box([mirrorX - 0.041, mirrorY + 0.014, s * 0.389], [0.005, 0.022, 0.04], glass);
    if (kind === "tesla") {
      hoodStrip(
        [
          [0.717, 0.875, 0.892],
          [0.764, 0.77, 0.913],
          [0.82, 0.724, 0.908],
          [0.88, 0.681, 0.887],
          [0.922, 0.674, 0.81],
          [0.939, 0.701, 0.753],
        ],
        "#56636a",
      );
      hoodStrip(
        [
          [0.751, 0.846, 0.87],
          [0.785, 0.778, 0.878],
          [0.82, 0.756, 0.87],
          [0.88, 0.704, 0.852],
          [0.916, 0.701, 0.786],
          [0.928, 0.718, 0.75],
        ],
        lens,
        0.01,
      );
      m.panel(
        [
          [1.002, 0.204, s * 0.197],
          [1.002, 0.207, s * 0.265],
          [1.002, 0.177, s * 0.258],
          [1.002, 0.193, s * 0.249],
        ],
        [1, 0, 0],
        "#747b79",
      );
      sidePanel(
        [
          [0.459, 0.298, 0.393],
          [0.503, 0.293, 0.39],
          [0.494, 0.281, 0.391],
        ],
        "#737d7d",
      );
      for (const x of [-0.406, 0.083]) m.box([x, 0.328, s * 0.392], [0.073, 0.011, 0.011], "#50565a");
      const tail: Point[] = [
        [-1.003, 0.31, s * 0.119],
        [-1.003, 0.319, s * 0.286],
        [-1.003, 0.274, s * 0.294],
        [-1.003, 0.285, s * 0.199],
        [-1.003, 0.293, s * 0.12],
      ];
      m.panel(tail, [-1, 0, 0], "tailLight");
      m.panel(
        [
          [-1.003, 0.319, s * 0.286],
          [-0.933, 0.337, s * 0.365],
          [-0.829, 0.343, s * 0.388],
          [-0.867, 0.32, s * 0.386],
          [-0.934, 0.299, s * 0.368],
          [-1.003, 0.274, s * 0.294],
        ],
        [-0.6, 0, s],
        "tailLight",
      );
      m.panel(
        [
          [-1.006, 0.309, s * 0.184],
          [-1.006, 0.308, s * 0.278],
          [-1.006, 0.298, s * 0.272],
          [-1.006, 0.299, s * 0.186],
        ],
        [-1, 0, 0],
        "#e8b6a2",
      );
    } else if (kind === "carrera") {
      // Oval upright lenses nested in the fender peaks, with four DRL points.
      const oval = (center: Point, length: number, width: number, finish: string) => {
        const points = Array.from({ length: 24 }, (_, i): Point => {
          const t = (i * Math.PI) / 12,
            dx = length * Math.cos(t);
          return [center[0] + dx, center[1] - 0.57 * dx, s * (center[2] + width * Math.sin(t))];
        });
        m.panel(points, [0.57, 1, 0], finish);
      };
      // Painted headlamp buckets rise out of the two front wings.
      const rings: Point[][] = [];
      for (const [len, w, h] of [
        [0.134, 0.081, -0.047],
        [0.096, 0.069, -0.009],
        [0.076, 0.058, 0],
      ]) {
        rings.push(
          Array.from({ length: 24 }, (_, i): Point => {
            const t = (i * Math.PI) / 12,
              dx = len * Math.cos(t);
            return [0.667 + dx, 0.335 - 0.57 * dx + h, s * (0.297 + w * Math.sin(t))];
          }),
        );
      }
      for (let j = 1; j < rings.length; j++)
        for (let i = 0; i < 24; i++) {
          const next = (i + 1) % 24;
          m.panel([rings[j - 1][i], rings[j - 1][next], rings[j][next], rings[j][i]], [0, 1, 0]);
        }
      oval([0.667, 0.336, 0.297], 0.076, 0.058, dark);
      oval([0.667, 0.338, 0.297], 0.066, 0.049, "#a0afaf");
      for (const dx of [-0.03, 0.03])
        for (const dz of [-0.021, 0.021])
          oval([0.667 + dx, 0.341 - 0.57 * dx, 0.297 + dz], 0.009, 0.008, "runningLight");
      const grille = (x: number, points: number[][], color: string) =>
        m.panel(
          points.map(([y, z]): Point => [x, y, s * z]),
          [1, 0, 0],
          color,
        );
      grille(
        0.942,
        [
          [0.19, 0.037],
          [0.195, 0.263],
          [0.174, 0.275],
          [0.117, 0.264],
          [0.124, 0.058],
        ],
        dark,
      );
      grille(
        0.944,
        [
          [0.161, 0.062],
          [0.167, 0.265],
          [0.158, 0.265],
          [0.152, 0.063],
        ],
        "#747b7a",
      );
      grille(
        0.944,
        [
          [0.185, 0.14],
          [0.19, 0.262],
          [0.181, 0.262],
          [0.177, 0.14],
        ],
        lens,
      );
      m.box([-0.933, 0.129, s * 0.239], [0.043, 0.039, 0.087], "#686a68");
      m.box([-0.956, 0.13, s * 0.239], [0.004, 0.023, 0.065], dark);
      m.box([-0.246, 0.296, s * 0.358], [0.067, 0.011, 0.013], "#485a61");
    } else {
      hoodStrip(
        [
          [0.545, 0.881, 0.903],
          [0.612, 0.818, 0.925],
          [0.7, 0.767, 0.923],
          [0.77, 0.721, 0.921],
          [0.83, 0.698, 0.903],
          [0.866, 0.737, 0.871],
          [0.886, 0.788, 0.825],
        ],
        "#4a5051",
        0.01,
      );
      hoodStrip(
        [
          [0.569, 0.884, 0.894],
          [0.613, 0.856, 0.901],
          [0.7, 0.807, 0.882],
          [0.77, 0.765, 0.866],
          [0.822, 0.746, 0.868],
          [0.853, 0.767, 0.84],
        ],
        lens,
        0.016,
      );
      hoodStrip(
        [
          [0.542, 0.549, 0.567],
          [0.65, 0.511, 0.529],
          [0.73, 0.462, 0.483],
          [0.856, 0.384, 0.4],
        ],
        seam,
      );
      sidePanel(
        [
          [-0.491, 0.363, 0.426],
          [-0.341, 0.335, 0.418],
          [-0.155, 0.283, 0.392],
          [-0.25, 0.207, 0.398],
          [-0.391, 0.226, 0.419],
        ],
        dark,
      );
      sidePanel(
        [
          [-0.429, 0.3, 0.428],
          [-0.161, 0.283, 0.397],
          [-0.277, 0.271, 0.412],
          [-0.427, 0.285, 0.428],
        ],
        undefined,
      );
      sidePanel(
        [
          [-0.353, 0.116, 0.417],
          [-0.185, 0.148, 0.397],
          [0.366, 0.103, 0.406],
          [0.395, 0.085, 0.407],
          [-0.344, 0.084, 0.416],
        ],
        undefined,
      );
      m.panel(
        [
          [1.003, 0.17, s * 0.035],
          [1.003, 0.167, s * 0.277],
          [1.003, 0.11, s * 0.263],
          [1.003, 0.117, s * 0.061],
        ],
        [1, 0, 0],
        dark,
      );
      m.panel(
        [
          [1.004, 0.13, s * 0.122],
          [1.004, 0.123, s * 0.257],
          [1.004, 0.117, s * 0.256],
          [1.004, 0.121, s * 0.103],
        ],
        [1, 0, 0],
        "#777879",
      );
      m.box([-0.158, 0.271, s * 0.395], [0.046, 0.012, 0.013]);
      for (const [rad, depth, color] of [
        [0.048, 0.002, dark],
        [0.038, 0.005, "tailLight"],
        [0.017, 0.007, "#e39d79"],
      ] as const)
        m.panel(
          Array.from({ length: 20 }, (_, i): Point => [
            -1 - depth,
            0.299 + rad * Math.cos((i * Math.PI) / 10),
            s * (0.258 + rad * Math.sin((i * Math.PI) / 10)),
          ]),
          [-1, 0, 0],
          color,
        );
      for (const [rad, depth, finish] of [
        [0.027, 0.014, alloy],
        [0.019, 0.017, dark],
      ] as const)
        m.panel(
          Array.from({ length: 16 }, (_, i): Point => [
            -1 - depth,
            0.18 + rad * Math.cos((i * Math.PI) / 8),
            s * (0.198 + rad * Math.sin((i * Math.PI) / 8)),
          ]),
          [-1, 0, 0],
          finish,
        );
    }
  }
  if (kind === "tesla") {
    m.panel(
      [
        [1.004, 0.163, -0.24],
        [1.004, 0.163, 0.24],
        [1.004, 0.135, 0.201],
        [1.004, 0.135, -0.201],
      ],
      [1, 0, 0],
      dark,
    );
    m.panel(
      [
        [-1.005, 0.18, -0.278],
        [-1.005, 0.18, 0.278],
        [-1.005, 0.151, 0.246],
        [-1.005, 0.151, -0.246],
      ],
      [-1, 0, 0],
      "#62676a",
    );
    m.box([-1, 0.228, 0], [0.012, 0.047, 0.114], "#cec6b0");
  } else if (kind === "carrera") {
    m.box([-0.943, 0.19, 0], [0.013, 0.042, 0.116], "#afa999");
    m.box([-0.941, 0.283, 0], [0.016, 0.028, 0.586], dark);
    m.box([-0.951, 0.289, 0], [0.006, 0.013, 0.585], "tailLight");
    m.box([-0.836, 0.355, 0], [0.132, 0.012, 0.405], dark, [0, 0, 0.065]);
    for (let i = -8; i <= 8; i++)
      m.box([-0.836, 0.364, i * 0.022], [0.123, 0.009, 0.008], i === 0 ? red : "#637074", [0, 0, 0.065]);
  } else {
    m.box([-0.778, 0.369, 0], [0.24, 0.012, 0.389], glass, [0, 0, -0.08]);
    for (const s of [-1, 1])
      for (let i = 0; i < 4; i++)
        m.box([-0.858 + i * 0.046, 0.385 - i * 0.003, s * 0.133], [0.021, 0.011, 0.102], dark, [
          0,
          s * 0.12,
          -0.08,
        ]);
    m.box([-1, 0.197, 0], [0.018, 0.067, 0.569], dark);
    m.box([-1.011, 0.207, 0], [0.008, 0.035, 0.105], "#aea999");
    m.box([-1, 0.337, 0], [0.031, 0.015, 0.59], undefined);
  }
}

// Two-door JL Sport with the black removable hardtop and five-spoke wheels.
function wrangler(m: Coachwork) {
  const axle = 0.555,
    r = 0.183;
  // Narrow hood between separate raised front wings. The tub tucks behind
  // the tyres so daylight shows under the short front and rear overhangs.
  m.box([-0.18, 0.339, 0], [1.29, 0.243, 0.624]);
  m.box([-0.022, 0.348, 0], [0.652, 0.273, 0.756]);
  m.box([-0.568, 0.459, 0], [0.522, 0.104, 0.745]);
  m.box([0.531, 0.418, 0], [0.571, 0.205, 0.55]);
  m.box([0.533, 0.527, 0], [0.6, 0.033, 0.574], undefined, [0, 0, -0.028]);
  m.box([-0.018, 0.235, 0], [1.63, 0.077, 0.493], rubber);
  m.box([0.834, 0.417, 0], [0.045, 0.228, 0.665]);
  for (let i = -3; i <= 3; i++) {
    const z = i * 0.056;
    m.box([0.858, 0.414, z], [0.009, 0.15, 0.031], dark);
    m.box([0.864, 0.412, z - 0.016], [0.006, 0.135, 0.005], "#58605e");
  }
  const cab: Cabin[] = [
    [-0.81, 0.511, 0.763, 0.36, 0.351],
    [-0.773, 0.511, 0.789, 0.368, 0.354],
    [-0.584, 0.511, 0.79, 0.369, 0.354],
    [-0.316, 0.504, 0.79, 0.369, 0.354],
    [-0.245, 0.5, 0.79, 0.369, 0.354],
    [0.169, 0.485, 0.787, 0.366, 0.35],
    [0.31, 0.484, 0.526, 0.36, 0.344],
  ];
  cabin(m, cab, "jeep");
  m.box([-0.312, 0.805, 0], [1.021, 0.038, 0.731], "#2d3235");
  for (const z of [-0.19, 0.19]) m.box([-0.53, 0.827, z], [0.465, 0.008, 0.024], "#41474a");
  m.box([-0.816, 0.65, 0], [0.019, 0.264, 0.709]);
  m.box([-0.827, 0.656, 0], [0.008, 0.201, 0.637], glass);
  m.box([-0.827, 0.239, 0], [0.107, 0.088, 0.805], rubber);
  m.box([0.847, 0.274, 0], [0.136, 0.093, 0.834], rubber);
  for (const s of [-1, 1]) {
    const faceLamp = (x: number, y: number, z: number, rad: number, color: string) =>
      m.panel(
        Array.from({ length: 20 }, (_, i): Point => [
          x,
          y + rad * Math.cos((i * Math.PI) / 10),
          s * z + rad * Math.sin((i * Math.PI) / 10),
        ]),
        [1, 0, 0],
        color,
      );
    faceLamp(0.861, 0.456, 0.255, 0.061, "#161c20");
    faceLamp(0.865, 0.456, 0.255, 0.049, lens);
    faceLamp(0.917, 0.274, 0.313, 0.025, "#bbbcb1");
    for (const x of [-axle, axle]) {
      wheel(m, "jeep", x, r, 0.356, s);
      // Angular arch lip with a broad horizontal top surface.
      const outer = [
        [-0.245, 0.238],
        [-0.215, 0.357],
        [-0.137, 0.445],
        [0.134, 0.445],
        [0.213, 0.364],
        [0.243, 0.238],
      ];
      const inner = [
        [-0.21, 0.238],
        [-0.18, 0.345],
        [-0.121, 0.396],
        [0.12, 0.396],
        [0.182, 0.345],
        [0.21, 0.238],
      ];
      for (let i = 1; i < outer.length; i++) {
        const p = (ring: number[][], j: number, z: number): Point => [x + ring[j][0], ring[j][1], s * z];
        m.panel(
          [p(outer, i - 1, 0.437), p(outer, i, 0.437), p(inner, i, 0.437), p(inner, i - 1, 0.437)],
          [0, 0, s],
          "#373c3d",
        );
        m.panel(
          [p(outer, i - 1, 0.437), p(outer, i, 0.437), p(outer, i, 0.275), p(outer, i - 1, 0.275)],
          [0, 1, 0],
          "#414646",
        );
      }
    }
    m.panel(
      [
        [0.3, 0.551, s * 0.053],
        [0.297, 0.557, s * 0.052],
        [0.279, 0.588, s * 0.259],
        [0.282, 0.581, s * 0.26],
      ],
      [1, 1, 0],
      dark,
    );
    m.box([0.304, 0.523, s * 0.242], [0.067, 0.021, 0.043], "#454b4c");
    m.box([0.751, 0.385, s * 0.402], [0.02, 0.027, 0.072], "#dfb47c", [0, 0, -0.6]);
    m.box([-0.828, 0.448, s * 0.321], [0.043, 0.082, 0.071], dark);
    m.box([-0.853, 0.449, s * 0.321], [0.008, 0.063, 0.056], "tailLight");
    m.box([0.217, 0.545, s * 0.38], [0.048, 0.043, 0.073]);
    m.box([0.215, 0.562, s * 0.421], [0.083, 0.069, 0.044], rubber);
    m.box([-0.133, 0.45, s * 0.381], [0.082, 0.019, 0.013], rubber);
    for (const y of [0.318, 0.432]) m.box([0.235, y, s * 0.383], [0.055, 0.021, 0.014], "#596160");
    m.box([0.708, 0.485, s * 0.286], [0.026, 0.059, 0.017], dark);
    m.box([-0.025, 0.211, s * 0.387], [0.608, 0.024, 0.055], dark);
  }
  wheel(m, "jeep", 0, r, 0.356, 1, true);
  m.box([-0.881, 0.61, 0], [0.036, 0.058, 0.035], rubber);
  m.box([-0.893, 0.644, 0], [0.033, 0.018, 0.08], red);
}

export function carShapes() {
  function build(kind: RoadCar | "jeep") {
    const model = new Coachwork();
    if (kind === "jeep") wrangler(model);
    else sportsCar(model, kind);
    return [model.paint.geometry(false), model.trim.geometry(true)] as const;
  }
  const [teslaBody, teslaTrim] = build("tesla");
  const [carreraBody, carreraTrim] = build("carrera");
  const [ferrariBody, ferrariTrim] = build("ferrari");
  const [jeepBody, jeepTrim] = build("jeep");
  return { teslaBody, teslaTrim, carreraBody, carreraTrim, ferrariBody, ferrariTrim, jeepBody, jeepTrim };
}
