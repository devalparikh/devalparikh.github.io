import { Vector3, type Group } from "three";
import type { Model } from "./model";
import type { streets } from "./streets";
import { ease } from "./motion";

const paper = "#f2e2bf", ink = "#40545a", wood = "#ae835f", red = "#bf6853", sage = "#73937b";
type Person = ReturnType<typeof streets>["person"];

// An open slatted delivery crate. Its contents can use the same floor-relative frame.
export function crate(m: Model, x: number, y: number, z: number, parent?: Group) {
  const g = m.group(x, y, z, parent);
  m.form("planks", 0, 0.038, 0, 0.65, 0.076, 0.44, wood, g);
  for (const side of [-1, 1]) {
    for (const h of [0.12, 0.24]) {
      m.form("planks", 0, h, side * 0.2, 0.65, 0.078, 0.042, wood, g);
      m.form("planks", side * 0.3, h, 0, 0.05, 0.078, 0.41, wood, g);
    }
    for (const end of [-1, 1])
      m.form("planks", side * 0.27, 0.16, end * 0.15, 0.053, 0.31, 0.053, "#8b684d", g);
  }
  return g;
}

export function foldedPaper(m: Model, g: Group) {
  for (const side of [-1, 1]) {
    const page = m.group(side * 0.087, 0, 0, g);
    page.rotation.set(-0.66, side * 0.16, 0);
    m.form("box", 0, 0, 0, 0.178, 0.245, 0.012, paper, page);
    m.form("box", 0, 0.068, 0.009, 0.139, 0.043, 0.007, side < 0 ? sage : ink, page);
    for (let row = 0; row < 4; row++)
      m.form("box", -0.01, 0.019 - row * 0.026, 0.01, row === 3 ? 0.082 : 0.121, 0.009, 0.007, "#958979", page);
  }
}

export function newsCorner(m: Model, person: Person) {
  const rack = m.group(3.61, 0.068, -2.6);
  rack.rotation.y = -0.38;
  m.form("planks", 0, 0.44, 0, 0.96, 0.73, 0.055, "#687f78", rack, -0.14);
  for (const side of [-1, 1])
    m.beam([side * 0.4, 0, -0.29], [side * 0.4, 0.74, -0.05], 0.05, wood, rack);
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 3; i++) {
      const issue = m.group((i - 1) * 0.28, 0.31 + row * 0.31, 0.086 - row * 0.045, rack);
      m.form("box", 0, 0, 0, 0.251, 0.32, 0.018, paper, issue, -0.14);
      m.form("box", 0, 0.073, 0.014, 0.185, 0.103, 0.015, [red, sage, ink][(i + row) % 3], issue, -0.14);
    }
    m.form("planks", 0, 0.18 + row * 0.31, 0.115 - row * 0.045, 0.99, 0.064, 0.17, wood, rack);
  }
  const bundle = crate(m, 4.31, 0.068, -2.64);
  for (let i = 0; i < 5; i++)
    m.form("box", 0, 0.12 + i * 0.048, 0, 0.49, 0.042, 0.3, i % 2 ? paper : "#d4c5a7", bundle, 0, 0.07 * i);
  person(3.56, -2.14, 3.94, -1.38, "#698f9a", "maker", 6, 0.068, {
    carry: hand => foldedPaper(m, hand),
  });
}

export function mallKite(m: Model, person: Person) {
  person(6.55, -1.61, 6.55, -1.61, "#c38554", "maker", 3, 0.068, {
    size: 0.77,
    perform: t => ({ x: 6.55, y: 0.068, z: -1.61, facing: -0.91, step: 0, reach: 0.67 + 0.09 * Math.sin(t * 0.67) }),
    carry(hand) {
      m.form("drum", 0, 0, 0, 0.13, 0.21, 0.13, red, hand, 0, 0, Math.PI / 2);
      // The tether and its sail rock about the child's hand.
      const line = m.group(0, 0.04, 0, hand);
      line.userData.moving = true;
      m.beam([0, 0, 0], [-0.37, 1.38, 1.46], 0.017, wood, line);
      m.beam([-0.37, 1.38, 1.46], [-0.71, 3.07, 2.32], 0.017, wood, line);
      const kite = m.group(-0.71, 3.07, 2.32, line);
      kite.rotation.set(0.33, 1.32, -0.08);
      m.form("box", 0, 0, 0, 0.74, 0.74, 0.038, red, kite, 0, 0, Math.PI / 4);
      m.form("box", 0, 0.16, 0.024, 0.43, 0.43, 0.015, "#efc168", kite, 0, 0, Math.PI / 4);
      m.beam([0, -0.52, -0.03], [0, 0.52, -0.03], 0.023, paper, kite);
      const tail = m.group(0, -0.48, 0.01, kite);
      m.beam([0, 0, 0], [0.27, -0.74, -0.1], 0.023, wood, tail);
      for (let i = 1; i <= 3; i++)
        m.form("box", i * 0.081, -i * 0.22, -0.03 * i, 0.23, 0.067, 0.035, i % 2 ? sage : red, tail, 0, 0, 0.3);
      m.choreographies.push(t => {
        line.rotation.z = 0.18 * Math.sin(t * 0.79) + 0.08 * Math.sin(t * 1.31);
        tail.rotation.z = 0.4 * Math.sin(t * 1.7);
      });
    },
  });
}

export function pollinators(m: Model) {
  for (let i = 0; i < 7; i++) {
    const x = 6.15 + i * 0.36, z = 2.72 + 0.14 * Math.sin(i * 1.8), h = 0.55 + 0.15 * Math.sin(i * 1.3);
    m.beam([x, 0.34, z], [x + 0.04, h, z], 0.025, sage);
    for (let p = 0; p < 5; p++) {
      const a = 2 * Math.PI * p / 5;
      m.form("leaf", x + 0.04 + 0.065 * Math.cos(a), h, z + 0.065 * Math.sin(a),
        0.12, 0.05, 0.12, i % 2 ? "#bc83a3" : "#daa6a2");
    }
    m.form("round", x + 0.04, h + 0.035, z, 0.09, 0.085, 0.09, "#cc9c48");
  }
  for (let i = 0; i < 3; i++) {
    const insect = m.group(0, 0, 0);
    insect.userData.moving = true;
    m.form("round", 0, 0, 0, 0.034, 0.033, 0.15, ink, insect);
    const wings = [-1, 1].map(side => {
      const wing = m.group(0, 0, 0, insect);
      m.form("leaf", side * 0.092, 0, 0.032, 0.2, 0.025, 0.17, ink, wing, 0, side * 0.36);
      m.form("leaf", side * 0.088, 0.014, 0.035, 0.143, 0.025, 0.122, "#dd9951", wing);
      m.form("leaf", side * 0.061, 0, -0.057, 0.136, 0.033, 0.117, red, wing);
      return wing;
    });
    m.choreographies.push(t => {
      const a = t * (0.53 + 0.06 * i) + 2.1 * i;
      const lift = (1 + Math.sin(1.9 * a)) / 2;
      insect.position.set(7.2 + 1.07 * Math.sin(a), 0.79 + 0.51 * lift, 2.67 + 0.49 * Math.sin(2 * a));
      insect.rotation.y = Math.atan2(1.07 * Math.cos(a), 0.98 * Math.cos(2 * a));
      const flap = 0.52 + (0.16 + 0.28 * lift) * Math.sin(t * 12.8 + 2 * i);
      wings[0].rotation.z = -flap;
      wings[1].rotation.z = flap;
    });
  }
}

export function dockAngler(m: Model, person: Person) {
  // A quiet spot at the pier head, away from both moored boats.
  const x = 7.47, z = 1.19;
  m.form("drum", x - 0.09, 0.44, z - 0.28, 0.23, 0.28, 0.23, "#759a97");
  const bob = m.group(x + 0.39, 0.125, z + 1.56);
  bob.userData.moving = true;
  m.form("round", 0, 0, 0, 0.083, 0.11, 0.083, paper, bob);
  m.form("cone", 0, 0.065, 0, 0.077, 0.084, 0.077, red, bob);
  const line = m.group(0, 0, 0);
  line.userData.moving = true;
  m.beam([0, 0, 0], [0, 1, 0], 0.014, "#858e83", line);
  const nibble = (t: number) => Math.max(0, Math.sin(t * 0.63)) ** 5;
  let tip: Group;
  person(x, z, x, z, "#c58e58", "maker", 5, 0.295, {
    perform: t => ({ x, y: 0.295, z, facing: 0, step: 0, reach: 0.18 + 0.58 * nibble(t) }),
    carry(hand) {
      m.beam([0, -0.06, -0.14], [0.17, 0.44, 0.9], 0.037, wood, hand);
      m.beam([0.17, 0.44, 0.9], [0.26, 0.54, 1.57], 0.024, ink, hand);
      m.form("drum", 0, -0.028, 0.03, 0.09, 0.066, 0.09, ink, hand, 0, 0, Math.PI / 2);
      tip = m.group(0.26, 0.54, 1.57, hand);
    },
  });
  const up = new Vector3(0, 1, 0), toTip = new Vector3();
  m.choreographies.push(t => {
    bob.position.y = 0.14 + 0.026 * Math.sin(t * 1.9) - 0.042 * nibble(t);
    line.position.copy(bob.position);
    line.parent!.worldToLocal(tip.getWorldPosition(toTip));
    toTip.sub(bob.position);
    line.scale.y = toTip.length();
    line.quaternion.setFromUnitVectors(up, toTip.normalize());
  });
}

export function breezeSock(m: Model, x: number, z: number) {
  m.form("drum", x, 0.98, z, 0.065, 1.82, 0.065, ink);
  const swivel = m.group(x, 1.87, z);
  swivel.userData.moving = true;
  m.form("rim", 0, 0, 0, 0.33, 0.33, 0.3, paper, swivel, 0, Math.PI / 2);
  let joint = swivel;
  const sections: Group[] = [];
  for (let i = 0; i < 5; i++) {
    joint = m.group(i ? 0.185 : 0, 0, 0, joint);
    const width = 0.31 - i * 0.044;
    m.form("drum", 0.099, 0, 0, width, 0.198, width, i % 2 ? paper : red, joint, 0, 0, Math.PI / 2);
    sections.push(joint);
  }
  m.choreographies.push(t => {
    swivel.rotation.y = -0.57 + 0.27 * Math.sin(t * 0.49);
    for (const [i, joint] of sections.entries())
      joint.rotation.z = -0.072 + 0.075 * Math.sin(t * 1.89 - i * 0.58);
  });
}

export function danceCouple(person: Person) {
  for (const side of [-1, 1]) {
    person(0, 0, 0, 0, side < 0 ? "#789c99" : "#b96c58", "dancer", 6 + side, 0.068, {
      perform(t) {
        const phrase = (t % 15) / 15;
        const angle = 0.38 + 2 * Math.PI * ease(phrase);
        const sway = Math.sin(t * 2 * Math.PI / 1.875);
        const radius = 0.244 + 0.022 * sway;
        return {
          x: 7.34 + side * Math.cos(angle) * radius, z: 1.56 + side * Math.sin(angle) * radius,
          y: 0.068, facing: Math.atan2(-side * Math.cos(angle), -side * Math.sin(angle)),
          step: side * 0.67 * sway, reach: 0.71 - side * 0.09 * sway,
        };
      },
    });
  }
}

export function postcardStand(m: Model, person: Person) {
  const x = 6.39, z = 1.68;
  m.form("drum", x, 0.12, z, 0.52, 0.09, 0.52, ink);
  m.form("drum", x, 0.66, z, 0.059, 1.09, 0.059, ink);
  const rack = m.group(x, 0.25, z);
  rack.userData.moving = true;
  for (let face = 0; face < 4; face++) {
    const side = m.group(0, 0, 0, rack);
    side.rotation.y = face * Math.PI / 2;
    for (let row = 0; row < 3; row++) {
      const y = 0.13 + row * 0.227, tint = [red, "#78a0a8", sage, "#c49a61"][(face + row) % 4];
      m.form("box", 0, y, 0.19, 0.36, 0.212, 0.036, paper, side, -0.12);
      m.form("box", 0, y + 0.008, 0.212, 0.29, 0.145, 0.014, tint, side, -0.12);
      m.form("round", 0.062, y + 0.046, 0.221, 0.048, 0.048, 0.016, paper, side);
      m.form("box", 0, y - 0.074, 0.236, 0.38, 0.019, 0.02, ink, side);
    }
    for (const dx of [-0.187, 0.187]) m.beam([dx, 0.04, 0.226], [dx, 0.70, 0.226], 0.019, ink, side);
  }
  const turn = (t: number) => ease(((t + 2) % 5.2 - 1) / 1.24);
  m.choreographies.push(t => { rack.rotation.y = (Math.floor((t + 2) / 5.2) + turn(t)) * Math.PI / 2; });
  person(x + 0.42, z + 0.17, x, z, "#8b788f", "maker", 2, 0.068, {
    perform: t => ({ x: x + 0.42, y: 0.068, z: z + 0.17, facing: -1.98, step: 0,
      reach: 0.25 + 0.69 * Math.sin(Math.PI * turn(t)) }),
  });
  const returns = crate(m, x - 0.62, 0.068, z - 0.23);
  for (let i = 0; i < 5; i++)
    m.form("drum", (i - 2) * 0.094, 0.31, 0, 0.085, 0.48 + (i % 3) * 0.055, 0.085, paper, returns, -0.17, 0, i * 0.065);
}
