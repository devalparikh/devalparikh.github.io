import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildTown, pitch } from "./squares";

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
  controls.maxTargetRadius = 51;
  controls.enableDamping = false;
  controls.minPolarAngle = 0.4;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minZoom = 0.58;
  controls.maxZoom = 18;
  controls.screenSpacePanning = false;
  // Keep ordinary wheel scrolling on the page. OrbitControls still receives
  // pinch gestures, modified-wheel zoom and all wheel input in fullscreen.
  function pageWheel(e: WheelEvent) {
    if (!e.ctrlKey && !e.metaKey && !canvas.closest('[data-expanded="true"]')) e.stopImmediatePropagation();
  }
  canvas.addEventListener("wheel", pageWheel, { capture: true, passive: true });
  const angle = new T.Vector3(38, 34, 40);
  const closeUps = [
    [-pitch, 0.25],
    [pitch, -pitch],
    [pitch - 0.6, -2 * pitch - 1.8, 2.19],
    [0, pitch - 0.4],
    [-pitch, -pitch],
    [0, -pitch],
    [0, 0],
    [-pitch * 2, 0],
    [-pitch, pitch * 2],
    [-pitch * 2, pitch * 2],
    [0, -pitch * 2],
    [pitch * 2, -pitch * 2],
  ];
  const [x, z, focusHeight = 1.12] = closeUps[Math.floor(Math.random() * closeUps.length)];
  const center = new T.Vector3(x, focusHeight, z);
  let touring = true,
    expanded = false;
  const saved = { position: camera.position.clone(), target: center.clone(), zoom: 1, touring: true };
  function interruptTour() {
    touring = false;
  }
  controls.addEventListener("start", interruptTour);
  function home() {
    controls.target.copy(expanded ? overview : center);
    camera.position.copy(controls.target).add(angle);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
  }
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
  // Fit the occupied lots in camera space. The stepped shoreline makes the
  // projected centre different from the centre of the bounding rectangle.
  const right = new T.Vector3(angle.z, 0, -angle.x).normalize();
  const up = angle.clone().normalize().cross(right);
  const bounds = new T.Box2();
  for (const [x, z] of town.footprints) {
    for (const dx of [-6, 6])
      for (const dz of [-6, 6])
        for (const y of [0, 6]) {
          const point = new T.Vector3(x + dx, y, z + dz);
          bounds.expandByPoint(new T.Vector2(point.dot(right), point.dot(up)));
        }
  }
  const midpoint = bounds.getCenter(new T.Vector2());
  const overview = right.clone().multiplyScalar(midpoint.x).addScaledVector(up, midpoint.y);
  const extent = bounds.getSize(new T.Vector2());
  home();
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
  // A small lateral drift keeps the same street in frame throughout the shot.
  function track(t: number) {
    controls.target.copy(center);
    controls.target.x += 0.95 * Math.sin(t * 0.065);
    controls.target.z -= 0.55 * Math.sin(t * 0.048);
    camera.position.copy(controls.target).add(angle);
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
    const aspect = w / h;
    const span = expanded ? Math.max(extent.y, extent.x / aspect) * 1.07 : Math.max(10.2, 9.1 / aspect);
    controls.maxZoom = expanded ? Math.max(8, span / 3) : 4;
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
    setExpanded(full: boolean) {
      if (expanded === full) return;
      expanded = full;
      if (full) {
        saved.position.copy(camera.position);
        saved.target.copy(controls.target);
        saved.zoom = camera.zoom;
        saved.touring = touring;
        touring = false;
        home();
      } else {
        camera.position.copy(saved.position);
        controls.target.copy(saved.target);
        camera.zoom = saved.zoom;
        touring = saved.touring;
        controls.update();
      }
      resize();
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
