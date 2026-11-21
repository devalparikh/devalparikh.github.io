import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildTown } from "./squares";

export function mountTown(canvas: HTMLCanvasElement) {
  const renderer = new T.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-10, 10, 8, -8, 0.1, 150);
  const controls = new OrbitControls(camera, canvas);
  canvas.style.touchAction = "pan-y";
  controls.enablePan = true;
  controls.cursor.set(0, 1.3, 0);
  controls.maxTargetRadius = 24;
  controls.enableDamping = false;
  controls.minPolarAngle = 0.4;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minZoom = 0.58;
  controls.maxZoom = 3.6;
  controls.screenSpacePanning = false;
  // Keep ordinary wheel scrolling on the page. OrbitControls still receives
  // pinch gestures, modified-wheel zoom and all wheel input in fullscreen.
  function pageWheel(e: WheelEvent) {
    if (!e.ctrlKey && !e.metaKey && !canvas.closest('[data-expanded="true"]')) e.stopImmediatePropagation();
  }
  canvas.addEventListener("wheel", pageWheel, { capture: true, passive: true });
  const center = new T.Vector3(0, 0.45, -3);
  const angle = new T.Vector3(34, 34, 38);
  let touring = true;
  function interruptTour() {
    touring = false;
  }
  controls.addEventListener("start", interruptTour);
  function home() {
    controls.target.copy(center);
    camera.position.copy(center).add(angle);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
  }
  home();
  const sky = new T.HemisphereLight(0xffeed3, 0xd9ceb8, 1.8);
  const sun = new T.DirectionalLight(0xffdfaa, 2.15);
  sun.position.set(-20, 27, 14);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 30, bottom: -30, far: 95 });
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.024;
  const rim = new T.DirectionalLight(0xffeac5, 1.1);
  rim.position.set(7, 9, -12);
  const shadow = new T.Mesh(new T.PlaneGeometry(160, 160), new T.ShadowMaterial({ opacity: 0.17 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.35;
  shadow.receiveShadow = true;
  scene.add(sky, sun, rim, shadow);
  const town = buildTown();
  scene.add(town.root);
  const ray = new T.Raycaster(),
    pointer = new T.Vector2(),
    plane = new T.Plane(new T.Vector3(0, 1, 0), -1.8),
    hit = new T.Vector3(1e3, 0, 1e3);
  const treePosition = new T.Vector3();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0,
    previous = 0,
    time = 0,
    visible = true,
    dirty = true;
  const isNight = () => document.documentElement.dataset.theme === "inkember";
  let darkness = Number(isNight());
  const morning = new T.Color("#ffdfaa"),
    moon = new T.Color("#9bbdff"),
    daylight = new T.Color("#fff0da"),
    nightSky = new T.Color("#acbce2");
  // A wide establishing shot, a descent to street level, then a sweep
  // through adjacent blocks. Take hold of the map to leave the tour.
  const stops = [
    [0, 0, -3, 1],
    [3, 0, -3, 1],
    [12, -8, 0.4, 2.65],
    [22, 1.8, 5.8, 2.7],
    [32, 10, -7, 2.12],
    [41, 11, -12, 1.7],
    [52, 0, -3, 1],
    [58, 0, -3, 1],
  ];
  function track(t: number) {
    const beat = t % 58;
    const i = stops.findIndex((stop) => stop[0] > beat);
    const a = stops[i - 1],
      b = stops[i];
    const f = T.MathUtils.smoothstep(beat, a[0], b[0]);
    controls.target.set(T.MathUtils.lerp(a[1], b[1], f), center.y, T.MathUtils.lerp(a[2], b[2], f));
    camera.position.copy(controls.target).add(angle);
    camera.zoom = T.MathUtils.lerp(a[3], b[3], f);
    camera.updateProjectionMatrix();
  }
  function render(now: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    const dt = previous ? Math.min((now - previous) / 1000, 0.25) : 0;
    if (!motion.matches && now - previous < 32 && !dirty) {
      wake();
      return;
    }
    previous = now;
    if (!motion.matches) time += dt;
    const target = Number(isNight());
    darkness = motion.matches ? target : T.MathUtils.damp(darkness, target, 6, dt);
    sun.color.lerpColors(morning, moon, darkness);
    sun.intensity = 1.46 - darkness * 1.05;
    sky.color.lerpColors(daylight, nightSky, darkness);
    sky.intensity = 2.0 - darkness * 1.57;
    rim.color.setRGB(1 - 0.52 * darkness, 0.89 - 0.23 * darkness, 0.7 + 0.3 * darkness);
    rim.intensity = 1 - darkness * 0.17;
    town.development.value = motion.matches || !touring ? 4 : Math.min(time + 0.4, 4);
    town.wash.value = 1 - darkness;
    town.lit.emissiveIntensity = 0.04 + darkness * 1.58;
    if (touring && !motion.matches) track(time);
    for (const animate of town.choreographies) animate(time);
    for (const [i, tree] of town.trees.entries()) {
      tree.getWorldPosition(treePosition);
      const near = Math.max(0, 1 - treePosition.distanceTo(hit) / 2.85);
      tree.rotation.z = motion.matches ? 0 : Math.sin(time * 1.5 + i) * (0.014 + near * 0.1);
    }
    controls.update();
    town.sync();
    renderer.render(scene, camera);
    dirty = false;
    if (!motion.matches) wake();
  }
  function wake() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  function invalidate() {
    dirty = true;
    wake();
  }
  function resize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const span = Math.max(21.5, Math.min(25, (59 * h) / w));
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.right = (span * w) / h / 2;
    camera.left = -camera.right;
    camera.updateProjectionMatrix();
    invalidate();
  }
  const size = new ResizeObserver(resize);
  size.observe(canvas);
  resize();
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previous = 0;
    invalidate();
  });
  visibility.observe(canvas);
  const theme = new MutationObserver(invalidate);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  function hover(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      (2 * (e.clientX - rect.left)) / rect.width - 1,
      1 - (2 * (e.clientY - rect.top)) / rect.height,
    );
    ray.setFromCamera(pointer, camera);
    ray.ray.intersectPlane(plane, hit);
  }
  function leave() {
    hit.set(1e3, 0, 1e3);
  }
  function zoom(factor: number) {
    camera.zoom = T.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
    camera.updateProjectionMatrix();
    invalidate();
  }
  function key(e: KeyboardEvent) {
    if (e.key === "Home") home();
    else if (e.key === "+" || e.key === "=") zoom(1.2);
    else if (e.key === "-") zoom(1 / 1.2);
    else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      const offset = camera.position.clone().sub(controls.target);
      const sphere = new T.Spherical().setFromVector3(offset);
      if (e.key === "ArrowLeft") sphere.theta -= 0.12;
      if (e.key === "ArrowRight") sphere.theta += 0.12;
      if (e.key === "ArrowUp") sphere.phi -= 0.09;
      if (e.key === "ArrowDown") sphere.phi += 0.09;
      sphere.phi = T.MathUtils.clamp(sphere.phi, controls.minPolarAngle, controls.maxPolarAngle);
      camera.position.setFromSpherical(sphere).add(controls.target);
      controls.update();
    } else return;
    interruptTour();
    e.preventDefault();
    invalidate();
  }
  controls.addEventListener("change", invalidate);
  canvas.addEventListener("keydown", key);
  canvas.addEventListener("pointermove", hover);
  canvas.addEventListener("pointerleave", leave);
  motion.addEventListener("change", invalidate);
  document.addEventListener("visibilitychange", invalidate);
  return {
    dispose() {
      cancelAnimationFrame(frame);
      size.disconnect();
      visibility.disconnect();
      theme.disconnect();
      canvas.removeEventListener("keydown", key);
      canvas.removeEventListener("pointermove", hover);
      canvas.removeEventListener("pointerleave", leave);
      motion.removeEventListener("change", invalidate);
      document.removeEventListener("visibilitychange", invalidate);
      controls.removeEventListener("start", interruptTour);
      canvas.removeEventListener("wheel", pageWheel, true);
      controls.dispose();
      town.dispose();
      shadow.geometry.dispose();
      shadow.material.dispose();
      sun.shadow.dispose();
      renderer.dispose();
    },
  };
}
