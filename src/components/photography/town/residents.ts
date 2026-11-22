import type { Group } from "three";
import { ease, travel } from "./motion";
import { easel } from "./activities";
import { companionDog } from "./pets";
import type { Model } from "./model";

const ink = "#354449", leather = "#78533e", linen = "#f1debd";
export type Performance = (time: number) => {
  x: number; y: number; z: number; facing: number;
  step: number; sitting?: number; reach?: number;
};
type Occupation = "gardener" | "waiter" | "photographer" | "golfer" | "baker" | "hiker"
  | "beachcomber" | "surfer" | "reader" | "driver" | "shopper" | "commuter" | "artist" | "picnicker";

export function residents(m: Model) {
  const { form, group, beam } = m;
  return function person(
    x: number, z: number, endX: number, endZ: number, shirt: string,
    occupation: Occupation, phase: number, base = 0.068,
    { route, groundHeight, portraitPartner = false, perform, parent }: {
      route?: (distance: number) => [number, number, number];
      groundHeight?: (x: number, z: number) => number;
      portraitPartner?: boolean;
      perform?: Performance;
      parent?: Group;
    } = {},
  ) {
    const g = group(x, base, z, parent);
    g.userData.moving = true;
    g.scale.setScalar(0.79 + (phase % 4) * 0.029);
    g.scale.x *= 0.92 + (phase % 3) * 0.074;
    const dog = portraitPartner && occupation === "hiker" ? companionDog(m, g) : undefined;
    const skin = ["#bd8060", "#956446", "#d9a584", "#af765b"][phase % 4];
    const hair = ["#493930", "#684737", "#39383a", "#8e6348"][phase % 4];
    const barefoot = occupation === "surfer" || occupation === "reader" || occupation === "beachcomber";
    const trousers = occupation === "gardener" ? "#4d6556" : phase % 2 ? "#495669" : ink;
    const hips = group(0, 0.405, 0, g);
    const chest = group(0, 0, 0, hips);
    const head = group(0, 0.37, 0.01, chest);
    form("round", 0, 0.02, 0, 0.29, 0.17, 0.22, trousers, hips);
    form("octagon", 0, 0.162, 0, 0.33, 0.29, 0.235, shirt, chest);
    form("round", 0, 0.285, 0, 0.36, 0.125, 0.22, shirt, chest);
    form("drum", 0, 0.326, 0, 0.115, 0.11, 0.115, skin, chest);
    form("round", 0, 0.076, 0, 0.235, 0.272, 0.215, skin, head);
    form("round", 0, 0.159, -0.023, 0.25, 0.161, 0.227, hair, head);
    form("round", -0.039, 0.14, 0.069, 0.17, 0.08, 0.085, hair, head, 0, 0, 0.19);
    form("round", 0, 0.072, 0.107, 0.056, 0.065, 0.056, skin, head);
    for (const side of [-1, 1]) {
      form("round", side * 0.111, 0.078, -0.005, 0.045, 0.069, 0.046, skin, head);
      form("round", side * 0.051, 0.095, 0.097, 0.043, 0.029, 0.024, linen, head, 0, side * 0.28);
    }
    if (phase % 3 === 1)
      form("round", 0.037, 0.091, -0.114, 0.14, 0.145, 0.14, hair, head);
    // Brows, cheeks and a lower lip read from the street-facing three-quarter view.
    for (const side of [-1, 1]) {
      form("round", side * 0.052, 0.095, 0.11, 0.023, 0.027, 0.014, ink, head);
      form("round", side * 0.051, 0.12, 0.103, 0.06, 0.016, 0.02, hair, head, 0, 0, -side * 0.12);
      form("round", side * 0.073, 0.058, 0.077, 0.054, 0.031, 0.023, skin, head);
      form("box",side*.071,.283,.106,.081,.064,.024,
        occupation === "waiter" ? linen : shirt,chest,0,0,side*.57);
    }
    form("round", 0, 0.032, 0.103, 0.065, 0.014, 0.019, "#874e42", head);
    if (occupation === "photographer" && phase % 2 === 0) {
      for (const side of [-1,1]) {
        form("rim",side*.052,.10,.105,.089,.077,.066,ink,head,0,side*.21);
        beam([side*.09,.102,.10],[side*.117,.098,-.016],.012,ink,head);
      }
      beam([-.014,.10,.103],[.014,.10,.103],.014,ink,head);
    }
    const legs = [-1, 1].map(side => {
      const thigh = group(side * 0.084, 0, 0, hips);
      const shin = group(0, -0.19, 0, thigh);
      const foot = group(0, -0.19, 0, shin);
      form("round", 0, -0.085, 0, 0.126, 0.25, 0.139, trousers, thigh);
      form("drum", 0, -0.086, 0, 0.106, 0.205, 0.111, barefoot ? skin : trousers, shin);
      form("round", 0, 0, 0.029, 0.13, 0.088, 0.20, barefoot ? skin : leather, foot);
      return { thigh, shin, foot, reach: 0, ankle: 0 };
    });
    // The hands share a shoulder-height pivot when holding the camera.
    const arms = group(0, 0.28, 0, chest);
    const leftShoulder = group(-0.145, 0, 0, arms), rightShoulder = group(0.145, 0, 0, arms);
    const left = group(0.145, 0, 0, leftShoulder), right = group(-0.145, 0, 0, rightShoulder);
    const camera = occupation === "photographer";
    for (const side of [-1, 1]) {
      const arm = side === 1 ? right : left;
      const elbow = [side * 0.194, -0.147, 0.037];
      const forwardHand = occupation === "hiker" ? side === -1 : side === 1;
      const palm = camera ? [side * 0.09, -0.093, 0.185]
        : forwardHand ? [side * 0.162, -0.118, 0.193] : [side * 0.15, -0.281, 0.069];
      beam([side * 0.145, 0, 0], elbow, 0.106, shirt, arm);
      beam(elbow, palm, 0.079, skin, arm);
      form("round", side*.183,-.121,.029,.11,.053,.108,occupation === "waiter" ? linen : shirt,arm);
      form("round", palm[0], palm[1], palm[2], 0.088, 0.087, 0.096, skin, arm);
    }
    if (occupation === "artist") {
      easel(m, g);
      g.rotation.y = Math.atan2(endX - x, endZ - z);
      // Smock, a thumb palette in the left hand and a long flat brush in the right.
      form("box", 0, 0.078, 0.119, 0.265, 0.31, 0.026, "#a7b7a1", chest);
      form("round", -0.157, -0.27, 0.105, 0.26, 0.031, 0.21, "#cea571", left);
      for (const [i, color] of ["#ac5547", "#e9bc62", "#7298a6"].entries())
        form("round", -0.245 + i * 0.062, -0.248, 0.126, 0.043, 0.02, 0.046, color, left);
      beam([0.13, -0.16, 0.17], [0.34, 0.018, 0.294], 0.021, leather, right);
      beam([0.34, 0.018, 0.294], [0.372, 0.05, 0.315], 0.026, "#698c87", right);
      legs[0].thigh.position.z = -0.066;
      legs[1].thigh.position.z = 0.07;
      hips.position.y = 0.423;
      m.choreographies.push(t => {
        const stroke = Math.sin(t * 1.8);
        rightShoulder.rotation.z = 0.17 * stroke;
        rightShoulder.position.z = -0.037 * Math.max(0, Math.cos(t * 0.68));
        head.rotation.y = 0.43 + 0.15 * stroke;
        head.rotation.x = 0.08 * Math.cos(t * 0.68);
      });
      return;
    }
    if (occupation === "surfer") {
      // The stance runs across the board. Knees absorb the roll while the arms counterbalance.
      for (const [i, leg] of legs.entries()) {
        leg.thigh.rotation.order = "ZXY";
        leg.thigh.rotation.z = i ? 0.38 : -0.38;
        leg.foot.rotation.z = -leg.thigh.rotation.z;
      }
      m.choreographies.push(t => {
        const carve = Math.sin(t * 0.57 + 0.19 * Math.sin(t * 0.87));
        const bend = 0.51 + 0.18 * carve;
        hips.position.y = 0.044 + 0.38 * Math.cos(bend) * Math.cos(0.38);
        for (const { thigh, shin, foot } of legs) {
          thigh.rotation.x = -bend;
          shin.rotation.x = 2 * bend;
          foot.rotation.x = -bend;
        }
        chest.rotation.z = 0.18 * carve;
        head.rotation.y = 0.83 - 0.13 * carve;
        leftShoulder.rotation.z = -1.04 - 0.26 * carve;
        rightShoulder.rotation.z = 1.12 - 0.3 * carve;
      });
      return;
    }
    if (occupation === "picnicker" || occupation === "reader") {
      const sipping = phase % 2 === 0;
      g.rotation.y = Math.atan2(endX - x, endZ - z);
      hips.position.y = 0.091;
      for (const [i, { thigh, shin, foot }] of legs.entries()) {
        thigh.rotation.y = (i ? 1 : -1) * (sipping ? 0.53 : 0.28);
        thigh.rotation.x = i ? -1.95 : -1.68;
        shin.rotation.x = i ? 1.0 : 0.47;
        foot.rotation.x = -thigh.rotation.x - shin.rotation.x;
      }
      if (occupation === "reader") {
        for (const side of [-1, 1])
          form("box", 0.105 + side * 0.054, -0.085, 0.21, 0.11, 0.023, 0.16, linen, right, -0.25, 0, side * 0.18);
      } else if (sipping) {
        form("drum", 0.162, -0.08, 0.214, 0.098, 0.106, 0.098, "#548788", right);
        form("drum", 0.162, -0.024, 0.214, 0.077, 0.008, 0.077, leather, right);
      } else {
        form("round", 0.162, -0.087, 0.21, 0.133, 0.09, 0.17, "#d4a15d", right);
        form("round", 0.162, -0.088, 0.21, 0.138, 0.022, 0.176, "#68805e", right);
      }
      m.choreographies.push(t => {
        const gesture = (1 + Math.sin(t * 0.79 + phase)) / 2;
        rightShoulder.rotation.x = occupation === "reader" ? -0.45 - 0.09 * gesture : -(sipping ? 1.09 : 0.46) * gesture;
        head.rotation.y = 0.19 * Math.sin(t * 0.71 + phase);
        chest.rotation.x = 0.075 + 0.09 * gesture;
        head.rotation.x = occupation === "reader" ? 0.31 * gesture : (sipping ? -0.13 : 0.17) * gesture;
      });
      return;
    }
    if (occupation === "beachcomber") {
      form("drum", -0.15, -0.435, 0.069, 0.19, 0.155, 0.19, "#70a39d", left);
      for (const dx of [-0.083, 0.083])
        beam([-0.15 + dx, -0.36, 0.069], [-0.15, -0.275, 0.069], 0.017, linen, left);
    }
    if (occupation === "driver") {
      form("round", 0, 0.2, 0, 0.24, 0.12, 0.23, "#e1d5b6", head);
      form("round", 0, 0.174, 0.082, 0.22, 0.029, 0.23, "#688579", head);
    }
    if (occupation === "shopper") {
      for (const dz of [-0.06, 0.06])
        beam([-0.15, -0.28, 0.069], [-0.18, -0.39, 0.069 + dz], 0.021, leather, left);
      form("box", -0.18, -0.46, 0.069, 0.16, 0.2, 0.23, "#b59c67", left);
      form("round", -0.18, -0.34, 0.11, 0.065, 0.23, 0.075, "#c88c4e", left, -0.32);
    }
    if (occupation === "commuter") {
      beam([-0.116, 0.31, 0.078], [0.15, 0.014, 0.103], 0.031, leather, chest);
      form("planks", 0.144, -0.003, 0.065, 0.137, 0.177, 0.194, "#956b4e", chest);
      form("box", 0.162, -0.099, 0.223, 0.15, 0.017, 0.203, linen, right, -0.28);
    }
    const cameraBody = camera ? group(0, -0.086, 0.187, arms) : undefined;
    if (cameraBody) {
      form("box", 0, 0, 0, 0.199, 0.134, 0.105, ink, cameraBody);
      form("drum", 0, 0.003, 0.07, 0.108, 0.087, 0.108, leather, cameraBody, Math.PI / 2);
      form("drum", 0, 0.003, 0.118, 0.083, 0.016, 0.083, "#789a9d", cameraBody, Math.PI / 2);
      form("box", -0.04, 0.079, -0.007, 0.071, 0.043, 0.064, ink, cameraBody);
      form("octagon", 0, 0.028, 0, 0.339, 0.088, 0.245, shirt, chest);
      beam([0, 0.28, 0.114], [0, 0.028, 0.117], 0.016, linen, chest);
      beam([-0.114, 0.31, 0.085], [0.115, 0.033, 0.116], 0.034, leather, chest);
      form("box", 0.145, 0.047, 0.034, 0.136, 0.176, 0.16, leather, chest);
    }
    if (occupation === "baker" || occupation === "waiter") {
      form("box", 0, 0.062, 0.111, 0.245, 0.287, 0.032, linen, chest);
      form("box", 0, 0.156, 0.132, 0.26, 0.032, 0.02, leather, chest);
      form("drum", 0.162, -0.089, 0.214, 0.34, 0.034, 0.34, ink, right);
      if (occupation === "baker") {
        form("round", 0, 0.206, -0.01, 0.27, 0.14, 0.25, linen, head);
        form("drum",0,.193,-.009,.251,.078,.24,linen,head);
        for (const dx of [-.077,0,.077])
          form("round",dx,.249,-.015,.135,.138,.226,"#fff3d9",head);
        form("box",.083,.092,.139,.085,.115,.015,"#d2bc98",chest);
        for (const dx of [-0.072, 0.069])
          form("round", 0.162 + dx, -0.042, 0.224, 0.093, 0.099, 0.259, "#c88f49", right);
        for (const dx of [-.072,.069]) for (const dz of [-.062,0,.062])
          form("round",.162+dx,-.001,.224+dz,.065,.015,.021,linen,right,0,.32);
      } else {
        form("box", -.125,.078,.122,.076,.17,.035,"#b85f50",chest);
        form("box", 0, 0.287, 0.11, 0.098, 0.039, 0.028, ink, chest);
        form("drum", 0.162, -0.019, 0.214, 0.123, 0.108, 0.123, linen, right);
      }
    }
    if (occupation === "gardener" || occupation === "golfer") {
      const gardening = occupation === "gardener";
      form("round", 0, 0.20, 0, 0.245, 0.131, 0.248, gardening ? "#cead71" : linen, head);
      form("round", 0, 0.166, gardening ? 0 : 0.084, gardening ? 0.36 : 0.218,
        0.036, gardening ? 0.35 : 0.227, gardening ? "#b5955c" : linen, head);
      beam([0.162, -0.11, 0.185], [0.22, -0.584, 0.35], 0.032, leather, right);
      form("box", 0.22, -0.586, 0.35, 0.166, 0.05, 0.066, ink, right);
      if (gardening) {
        form("box", 0, 0.135, 0.112, 0.182, 0.228, 0.03, trousers, chest);
        form("box",0,.16,.138,.114,.069,.023,"#78917b",chest);
        for (const dx of [-0.075, 0.075]) {
          beam([dx, 0.159, 0.13], [dx, 0.301, 0.073], 0.036, trousers, chest);
          form("box", 0.22 + dx, -0.613, 0.367, 0.025, 0.088, 0.033, ink, right);
        }
      }
    }
    if (occupation === "hiker") {
      // A folded neckerchief and a bedroll break the pack silhouette.
      form("drum", 0, 0.316, 0, 0.166, 0.054, 0.155, "#647e78", chest);
      beam([0.06, 0.303, 0.08], [0.094, 0.214, 0.116], 0.05, "#647e78", chest);
      form("round", 0, 0.171, -0.143, 0.243, 0.32, 0.166, "#976243", chest);
      form("drum", 0, 0.295, -0.166, 0.103, 0.265, 0.103, "#79938c", chest, 0, 0, Math.PI / 2);
      for (const dx of [-0.10, 0.10])
        beam([dx, 0.306, 0.05], [dx, 0.121, 0.105], 0.037, leather, chest);
    }
    if (perform) {
      m.choreographies.push(t => {
        const { x, y, z, facing, step, sitting = 0, reach = 0 } = perform(t);
        g.position.set(x, y, z);
        g.rotation.y = facing;
        hips.position.y = 0.422 - 0.31 * sitting - 0.015 * step * step;
        for (const [i, { thigh, shin, foot }] of legs.entries()) {
          const swing = step * (i ? 1 : -1);
          thigh.rotation.x = -1.53 * sitting - 0.43 * swing;
          shin.rotation.x = 1.48 * sitting + 0.49 * Math.max(0, -swing);
          foot.rotation.x = -thigh.rotation.x - shin.rotation.x;
        }
        leftShoulder.rotation.x = 0.23 * step - 0.53 * sitting;
        rightShoulder.rotation.x = -0.18 * step - 0.8 * reach - 0.37 * sitting;
        chest.rotation.x = 0.12 * reach;
        head.rotation.y = 0.12 * Math.sin(1.13 * t + phase);
      });
      return;
    }
    const speeds = { gardener: 0.56, waiter: 0.98, photographer: 0.65, golfer: 0.47, baker: 0.82, hiker: 0.74, shopper: 0.71, commuter: 0.87, driver: 0.72, beachcomber: 0.55 };
    const variation = Math.sin(17.3 * x + 7.1 * z + phase);
    const pace = portraitPartner ? speeds.photographer : speeds[occupation] * (1 + 0.16 * variation);
    let travelTime = 3.7;
    let length = Math.hypot(endX - x, endZ - z);
    if (route) {
      let previous = route(0);
      length = 0;
      for (let i = 1; i <= 16; i++) {
        const point = route(i / 16);
        length += Math.hypot(point[0] - previous[0], point[1] - previous[1], point[2] - previous[2]);
        previous = point;
      }
      travelTime = Math.max(travelTime, length / 0.92);
    }
    const halfLap = travelTime + 2.3 + (portraitPartner ? 0 : 0.68 * variation);
    const stepCount = Math.max(2, Math.round(length / (0.49 * g.scale.z)));
    const swing = length / (4 * stepCount * g.scale.z);
    const heading = Math.atan2(endX - x, endZ - z);
    m.choreographies.push((t) => {
      const cycle = (t * pace + (portraitPartner ? 4.5 : phase + (1 + variation) * halfLap)) % (2 * halfLap);
      const outbound = cycle < halfLap;
      const legTime = cycle % halfLap;
      const progress = travel(legTime / travelTime);
      const distance = outbound ? progress : 1 - progress;
      const walking = progress < 1;
      const stepAngle = progress * stepCount * Math.PI * 2;
      const stride = Math.sin(stepAngle);
      let grade = 0;
      // Stop at the counter, flower bed or tee before turning for the return.
      const turn = ease((legTime - halfLap + 0.8) / 0.8);
      let bearing = heading;
      if (route) {
        const [px, py, pz] = route(distance);
        const step = distance < 0.999 ? 0.001 : -0.001;
        const [nx, ny, nz] = route(distance + step);
        bearing = Math.atan2((nx - px) / step, (nz - pz) / step);
        grade = ((ny - py) * Math.sign(step) * (outbound ? 1 : -1)) / (Math.hypot(nx - px, nz - pz) || 1);
        g.position.set(px, py, pz);
      } else {
        const drift = portraitPartner ? 0 : 0.043 * variation * Math.sin(Math.PI * distance) ** 2;
        g.position.set(x + (endX - x) * distance + Math.cos(heading) * drift,
          base, z + (endZ - z) * distance - Math.sin(heading) * drift);
      }
      g.rotation.y = bearing + (Number(!outbound) + turn) * Math.PI;
      const gesture = walking ? 0 : Math.sin(Math.PI * ease((legTime - travelTime) / (halfLap - travelTime - 0.4)));
      dog?.(t, stride, gesture);
      const pose = portraitPartner && outbound ? gesture : 0;
      const lean = occupation === "gardener" ? 0.58 * gesture : 0.08 * gesture;
      hips.position.y = 0.411 - 0.075 * lean - Math.abs(stride) * 0.012 - Math.min(0.08, Math.abs(grade) * 0.15);
      // Solve two equal leg segments to a level shoe. Only the returning
      // foot lifts; the other sole stays on the route through the stride.
      for (const [i, leg] of legs.entries()) {
        const sign = i === 0 ? -1 : 1;
        // Linear travel on the planted half-step cancels the walker's advance.
        leg.reach = sign * (0.034 + swing * Math.asin(stride) * 2 / Math.PI);
        const lift = walking ? 0.055 * Math.max(0, sign * Math.cos(stepAngle))
          * Math.min(1, legTime * 5, (travelTime - legTime) * 5) : 0;
        let ground = grade * leg.reach;
        if (groundHeight) {
          const dx = leg.thigh.position.x * g.scale.x, dz = (leg.reach + 0.029) * g.scale.z;
          const cos = Math.cos(g.rotation.y), sin = Math.sin(g.rotation.y);
          const surface = groundHeight(g.position.x + dx * cos + dz * sin, g.position.z - dx * sin + dz * cos);
          ground = (surface - g.position.y) / g.scale.y;
        }
        leg.ankle = ground + lift + 0.044;
        hips.position.y = Math.min(hips.position.y, leg.ankle + Math.sqrt(0.38 ** 2 - leg.reach ** 2));
      }
      for (const { thigh, shin, foot, reach, ankle } of legs) {
        const drop = hips.position.y - ankle;
        const knee = Math.acos(Math.min(1, Math.hypot(drop, reach) / 0.38));
        thigh.rotation.x = -Math.atan2(reach, drop) - knee;
        shin.rotation.x = 2 * knee;
        foot.rotation.x = -shin.rotation.x - thigh.rotation.x;
      }
      chest.rotation.x = lean + (occupation === "hiker" ? 0.12 : 0);
      chest.rotation.z = walking ? 0.038 * stride : 0.065 * pose;
      head.rotation.y = walking ? 0.09 * stride : (camera ? 0.04 : 0.36) * gesture;
      head.rotation.x = camera ? 0.10 * gesture : -0.075 * gesture;
      leftShoulder.rotation.x = camera ? 0 : -stride * 0.32;
      rightShoulder.rotation.x = camera ? 0 : stride * 0.15;
      arms.rotation.x = camera ? -1.16 * gesture : 0;
      if (cameraBody) cameraBody.rotation.x = -arms.rotation.x - chest.rotation.x;
      if (occupation === "beachcomber") {
        chest.rotation.x += 0.49 * gesture;
        head.rotation.x += 0.24 * gesture;
        rightShoulder.rotation.x -= 0.29 * gesture;
      }
      if (occupation === "commuter") {
        rightShoulder.rotation.x -= 0.67 * gesture;
        head.rotation.x += 0.34 * gesture;
      }
      if (occupation === "shopper") {
        leftShoulder.rotation.x *= 0.28;
        rightShoulder.position.z = 0.062 * gesture;
      }
      if (occupation === "golfer") arms.rotation.y = 1.02 * gesture * Math.sin(legTime * 3);
      if (occupation === "gardener") rightShoulder.rotation.x -= gesture * (0.18 + 0.17 * Math.sin(t * 2));
      if (occupation === "waiter" || occupation === "baker") {
        // Bring the tray forward to offer it at the end of the walk.
        rightShoulder.position.z = 0.085 * gesture;
        rightShoulder.position.y = 0.032 * gesture;
        head.rotation.x = 0.16 * gesture;
        rightShoulder.rotation.x = -chest.rotation.x;
        rightShoulder.rotation.z = -0.26 * gesture;
      }

      if (occupation === "hiker") {
        if (dog) {
          rightShoulder.rotation.x = 0;
          leftShoulder.rotation.z = -2.13 * pose;
        } else {
          rightShoulder.rotation.z = 2.13 * pose;
        }
        chest.rotation.y = 0.42 * gesture;
      }
    });
  };
}
