import type { Group } from "three";
import type { Model } from "./model";

const ivory = "#eee2c3",
  ink = "#393536";

// The dog stays beside the hiker through the approach, portrait and return.
export function companionDog({ group, form, beam }: Model, walker: Group) {
  const dog = group(0.51, 0, 0.24, walker);
  const coat = "#b67843";
  form("round", 0, 0.244, 0, 0.235, 0.238, 0.45, coat, dog);
  form("round", 0, 0.267, 0.14, 0.216, 0.24, 0.18, ivory, dog);
  const head = group(0, 0.355, 0.18, dog);
  form("round", 0, 0.041, 0.043, 0.218, 0.218, 0.205, coat, head);
  form("round", 0, 0.013, 0.151, 0.145, 0.095, 0.156, ivory, head);
  form("round", 0, 0.028, 0.221, 0.073, 0.047, 0.048, ink, head);
  for (const s of [-1, 1]) {
    form("round", s * 0.071, 0.076, 0.116, 0.038, 0.04, 0.037, ink, head);
    form("round", s * 0.107, 0.044, -0.007, 0.087, 0.18, 0.098, "#855031", head, -0.28, 0, s * 0.17);
  }
  form("drum", 0, 0.341, 0.153, 0.207, 0.041, 0.176, "#337d7e", dog, -0.27);
  const tail = group(0, 0.273, -0.169, dog);
  beam([0, 0, 0], [0, 0.119, -0.116], 0.078, coat, tail);
  beam([0, 0.11, -0.109], [0, 0.166, -0.142], 0.061, ivory, tail);
  const legs = [-1, 1].flatMap((side) =>
    [-1, 1].map((end) => {
      const leg = group(side * 0.073, 0.219, end * 0.137, dog);
      beam([0, 0, 0], [0, -0.142, -0.018], 0.069, coat, leg);
      form("round", 0, -0.17, 0.009, 0.066, 0.096, 0.098, ivory, leg);
      return { leg, phase: side * end };
    }),
  );
  beam([0.16, 0.41, 0.069], [0.33, 0.322, 0.27], 0.015, "#795847", walker);
  beam([0.33, 0.322, 0.27], [0.51, 0.353, 0.393], 0.015, "#795847", walker);
  return (t: number, stride: number, gesture: number) => {
    for (const { leg, phase } of legs) leg.rotation.x = phase * stride * 0.41;
    tail.rotation.z = 0.56 * Math.sin(t * 5.3);
    head.rotation.x = -0.38 * gesture;
    head.rotation.y = 0.25 * Math.sin(t * 1.2);
  };
}

export function shopCat(m: Model, x: number, y: number, z: number) {
  const { form, group, beam } = m;
  const cat = group(x, y, z);
  cat.rotation.y = 0.68;
  const fur = "#bf895e",
    stripe = "#78563f";
  form("round", 0, 0.157, -0.025, 0.218, 0.285, 0.28, fur, cat);
  form("round", 0, 0.228, 0.058, 0.167, 0.246, 0.15, ivory, cat);
  const head = group(0, 0.338, 0.07, cat);
  head.userData.moving = true;
  form("round", 0, 0, 0, 0.235, 0.197, 0.191, fur, head);
  for (const s of [-1, 1]) {
    form("spire", s * 0.078, 0.089, -0.01, 0.095, 0.132, 0.078, fur, head, 0, 0, -s * 0.15);
    form("spire", s * 0.079, 0.088, 0.018, 0.054, 0.081, 0.03, "#be8780", head);
    form("round", s * 0.049, 0.014, 0.079, 0.043, 0.033, 0.024, ink, head);
    form("round", s * 0.029, -0.028, 0.085, 0.075, 0.05, 0.05, ivory, head);
    beam([s * 0.044, 0.2, 0.094], [s * 0.065, 0.044, 0.12], 0.06, fur, cat);
    form("round", s * 0.067, 0.029, 0.136, 0.066, 0.052, 0.081, ivory, cat);
    for (let i = 0; i < 2; i++)
      beam([s * 0.107, 0.006 - i * 0.034, 0], [s * 0.098, -0.006 - i * 0.034, 0.045], 0.016, stripe, head);
  }
  form("round", 0, -0.013, 0.11, 0.032, 0.024, 0.023, stripe, head);
  const tail = group(0.075, 0.061, -0.095, cat);
  tail.userData.moving = true;
  beam([0, 0, 0], [0.083, -0.016, -0.12], 0.068, fur, tail);
  beam([0.083, -0.016, -0.12], [0.182, 0.048, -0.13], 0.062, stripe, tail);
  beam([0.182, 0.048, -0.13], [0.197, 0.119, -0.095], 0.054, fur, tail);
  m.choreographies.push((t) => {
    head.rotation.y = 0.4 * Math.sin(t * 0.72);
    tail.rotation.y = 0.31 * Math.sin(t * 1.43);
  });
}

// A bird forages between two spots. Both hops finish on the paving, with the
// wings folding back against the body before it puts its beak down again.
export function foragingBird(m: Model, x: number, y: number, z: number, phase: number, plumage: string, period: number) {
  const bird = m.group(x, y, z);
  bird.userData.moving = true;
  const breast = m.group(0, 0.093, 0, bird);
  m.form("round", 0, 0.045, 0, 0.14, 0.145, 0.24, plumage, breast);
  m.form("round", 0, 0.126, 0.077, 0.105, 0.12, 0.105, plumage, breast);
  m.form("cone", 0, 0.124, 0.144, 0.04, 0.082, 0.042, "#ae8b59", breast, Math.PI / 2);
  m.form("leaf", 0, 0.062, -0.146, 0.088, 0.044, 0.185, "#5c6261", breast, 0.22);
  const wings = [-1, 1].map(side => {
    const wing = m.group(side * 0.052, 0.089, 0.017, breast);
    m.form("leaf", side * 0.025, -0.013, -0.038, 0.064, 0.10, 0.19, "#68716e", wing, -0.22);
    m.form("round", side * 0.055, 0.148, 0.091, 0.015, 0.018, 0.019, ink, breast);
    m.beam([side * 0.032, 0.10, 0], [side * 0.042, 0.016, 0.014], 0.019, "#ab846e", bird);
    return wing;
  });
  m.choreographies.push(t => {
    const clock = (t + phase) % period;
    const leg = clock < period / 2 ? clock : clock - period / 2;
    const reverse = clock >= period / 2;
    const u = Math.min(1, leg / 0.97);
    const glide = u * u * (3 - 2 * u);
    const hop = Math.sin(u * Math.PI) ** 2;
    const toward = reverse ? 1 - glide : glide;
    bird.position.set(x + 0.39 * toward, y + 0.24 * hop, z + 0.17 * toward);
    const pivot = Math.min(1, Math.max(0, (leg - period / 2 + 0.48) / 0.48));
    bird.rotation.y = 1.16 + Math.PI * (Number(reverse) + pivot * pivot * (3 - 2 * pivot));
    breast.rotation.x = (1 - hop) * (0.1 + 0.88 * Math.max(0, Math.cos(t * 3.48 + phase)) ** 5);
    for (const [i, wing] of wings.entries())
      wing.rotation.z = (i ? 1 : -1) * hop * (1.03 + 0.56 * Math.sin(14 * leg));
  });
}
