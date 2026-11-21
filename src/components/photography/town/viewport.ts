import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildSquare } from "./squares";

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
  controls.enablePan = true;
  controls.cursor.set(0, 1.3, 0);
  controls.maxTargetRadius = 4.5;
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minPolarAngle = 0.4;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minZoom = 0.8;
  controls.maxZoom = 2.25;
  // Let scroll wheels keep navigating the photography page. Zoom buttons
  // also work for single-touch and keyboard users.
  controls.enableZoom = false;
  function home() {
    camera.position.set(12, 11.5, 20);
    controls.target.set(0, 1.3, 0);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
  }
  home();
  const sky = new T.HemisphereLight(0xffeed3, 0xa3948b, 1.8);
  const sun = new T.DirectionalLight(0xffdfaa, 2.15);
  sun.position.set(-9, 16, 10);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, far: 65 });
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.024;
  const rim = new T.DirectionalLight(0xffeac5, 1.1);
  rim.position.set(7, 9, -12);
  const shadow = new T.Mesh(new T.PlaneGeometry(160, 160), new T.ShadowMaterial({ opacity: 0.17 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.35;
  shadow.receiveShadow = true;
  const shopLight = new T.PointLight(0xffa352, 0, 7, 1.4);
  shopLight.position.set(-3.2, 1.35, 1.3);
  const lantern = new T.PointLight(0xffbf6b, 0, 5, 1.5);
  lantern.position.set(6.53, 1.72, 1.94);
  scene.add(sky, sun, rim, shadow, shopLight, lantern);
  let square = buildSquare(0);
  scene.add(square.root);
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
  let transition = 1;
  function render(now: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min((now - previous) / 1000, 0.05);
    if (!motion.matches && now - previous < 32 && !dirty) {
      wake();
      return;
    }
    previous = now;
    if (!motion.matches) time += dt;
    const target = Number(isNight());
    darkness = motion.matches ? target : T.MathUtils.damp(darkness, target, 6, dt);
    sun.color.lerpColors(morning, moon, darkness);
    sun.intensity = 2.15 - darkness * 1.45;
    sky.color.lerpColors(daylight, nightSky, darkness);
    sky.intensity = 1.85 - darkness * 0.99;
    rim.color.setRGB(1 - 0.52 * darkness, 0.89 - 0.23 * darkness, 0.7 + 0.3 * darkness);
    rim.intensity = 1 - darkness * 0.17;
    shopLight.intensity = darkness * 5;
    lantern.intensity = darkness * 3;
    square.lit.emissiveIntensity = 0.09 + darkness * 1.75;
    transition = motion.matches ? 1 : Math.min(1, transition + dt * 2.4);
    square.root.position.y = -((1 - transition) ** 2) * 0.65;
    square.root.rotation.y = (1 - transition) ** 2 * 0.12;
    for (const animate of square.choreographies) animate(time);
    for (const [i, tree] of square.trees.entries()) {
      tree.getWorldPosition(treePosition);
      const near = Math.max(0, 1 - treePosition.distanceTo(hit) / 2.85);
      tree.rotation.z = motion.matches ? 0 : Math.sin(time * 1.5 + i) * (0.014 + near * 0.1);
    }
    controls.update();
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
    const span = Math.max(12.45, (20 * h) / w);
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
    camera.zoom = T.MathUtils.clamp(camera.zoom * factor, 0.8, 2.25);
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
    zoom,
    select(i: number) {
      scene.remove(square.root);
      square.dispose();
      square = buildSquare(i);
      scene.add(square.root);
      home();
      transition = 0;
      invalidate();
    },
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
      controls.dispose();
      square.dispose();
      shadow.geometry.dispose();
      shadow.material.dispose();
      sun.shadow.dispose();
      renderer.dispose();
    },
  };
}
