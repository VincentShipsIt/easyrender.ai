// Live physics (Rapier): elements fall with their own mass, friction and collider.

import type RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { type CatalogItem, type ColliderKey, itemOf } from '../catalog';
import { part } from '../dom';
import { getHullPoints } from '../engine/assets';
import { disposeTree } from '../engine/resources';
import { getStage, prefersReducedMotion, View } from '../engine/stage';
import { grid, makeBeauty, makeCollider } from '../engine/studio';
import type { Format } from '../format';
import type { Scope } from '../scope';

type Rapier = typeof RAPIER;

// The WASM build is about 2 MB, so it only loads when a physics demo scrolls near.
let rapier: Promise<Rapier> | null = null;
function loadRapier() {
  rapier ??= import('@dimforge/rapier3d-compat').then(async (module) => {
    await module.default.init();
    return module.default;
  });
  return rapier;
}

// Deterministic, so the pile lands the same way on every loop.
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Vec3 = [number, number, number];

type Body = {
  item: CatalogItem;
  body: RAPIER.RigidBody;
  group: THREE.Group;
  wire: THREE.LineBasicMaterial;
};

class Simulation {
  readonly world: RAPIER.World;
  readonly bodies: Body[] = [];
  #walls: RAPIER.Collider[] = [];
  #acc = 0;

  constructor(
    private readonly R: Rapier,
    private readonly scene: THREE.Scene,
  ) {
    this.world = new R.World({ x: 0, y: -9.81, z: 0 });
    this.world.timestep = 1 / 60;
    this.world.createCollider(
      R.ColliderDesc.cuboid(30, 0.5, 30)
        .setTranslation(0, -0.5, 0)
        .setFriction(0.85)
        .setRestitution(0.12),
    );
  }

  // Invisible walls that keep what falls in frame. Calling it again moves them.
  fence(hx: number, hz: number, height = 4) {
    for (const wall of this.#walls) this.world.removeCollider(wall, false);
    const t = 0.5;
    const wall = (x: number, z: number, sx: number, sz: number) =>
      this.world.createCollider(
        this.R.ColliderDesc.cuboid(sx, height, sz)
          .setTranslation(x, height, z)
          .setFriction(0.2)
          .setRestitution(0.2),
      );
    this.#walls = [
      wall(hx + t, 0, t, hz + 2 * t),
      wall(-hx - t, 0, t, hz + 2 * t),
      wall(0, hz + t, hx + 2 * t, t),
      wall(0, -hz - t, hx + 2 * t, t),
    ];
  }

  async add(id: string, start: { pos: Vec3; euler: Vec3; spin: Vec3 }) {
    const R = this.R;
    const item = itemOf(id);
    const [w, h, d] = item.dims;
    const [model, collider, hull] = await Promise.all([
      makeBeauty(id, { shadows: true }),
      makeCollider(id, { centred: true, opacity: 0.4 }),
      item.collider === 'hull' ? getHullPoints(id) : null,
    ]);

    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...start.euler));
    const body = this.world.createRigidBody(
      R.RigidBodyDesc.dynamic()
        .setTranslation(...start.pos)
        .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
        .setAngvel({ x: start.spin[0], y: start.spin[1], z: start.spin[2] })
        .setLinearDamping(0.04)
        .setAngularDamping(0.35),
    );
    let shape: RAPIER.ColliderDesc | null = null;
    if (item.collider === 'cylinder') shape = R.ColliderDesc.cylinder(h / 2, Math.max(w, d) / 2);
    else if (hull) {
      // The rigid body sits at the centre of the bounding box; the model's origin is its base.
      const points = new Float32Array(hull.length * 3);
      hull.forEach(([x, y, z], i) => {
        points.set([x, y - h / 2, z], i * 3);
      });
      shape = R.ColliderDesc.convexHull(points);
    }
    shape ??= R.ColliderDesc.cuboid(w / 2, h / 2, d / 2);
    this.world.createCollider(
      shape.setMass(item.mass).setFriction(item.friction).setRestitution(item.restitution),
      body,
    );

    const group = new THREE.Group();
    model.position.y = -h / 2;
    group.add(model, collider.object);
    group.position.set(...start.pos);
    group.quaternion.copy(q);
    this.scene.add(group);
    const entry: Body = { item, body, group, wire: collider.edges.material };
    this.bodies.push(entry);
    return entry;
  }

  step(dt: number) {
    this.#acc += dt;
    let steps = 0;
    while (this.#acc >= 1 / 60 && steps < 3) {
      this.world.step();
      this.#acc -= 1 / 60;
      steps++;
    }
    if (steps === 3) this.#acc = 0;
    this.sync();
  }

  sync() {
    for (const { body, group } of this.bodies) {
      const p = body.translation();
      const r = body.rotation();
      group.position.set(p.x, p.y, p.z);
      group.quaternion.set(r.x, r.y, r.z, r.w);
    }
  }

  clear() {
    for (const { body, group } of this.bodies) {
      this.world.removeRigidBody(body);
      group.removeFromParent();
      disposeTree(group);
    }
    this.bodies.length = 0;
  }

  dispose() {
    this.clear();
    this.world.free();
  }
}

function floorAndLights(view: View, { reach = 3, gridSize = 10, gridDivisions = 20 } = {}) {
  view.scene.environmentIntensity = 0.34;
  const key = new THREE.DirectionalLight(0xfff1e0, 2.1);
  key.position.set(2.6, 4.6, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {
    left: -reach,
    right: reach,
    top: reach,
    bottom: -reach,
    near: 0.5,
    far: 14,
  });
  key.shadow.radius = 5;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight(0xc9dcff, 1.5);
  rim.position.set(-3, 2.2, -3);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShadowMaterial({ opacity: 0.55 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  const lines = grid(gridSize, gridDivisions, 0.09);
  lines.position.y = 0.001;
  view.scene.add(key, rim, ground, lines);
  return { key, lines };
}

export type PhysicsContext = {
  scope: Scope;
  fmt: Format;
  names: Record<string, string>;
  colliders: Record<ColliderKey, string>;
};

// ─────────── "Games" panel ───────────
const DROPS = [
  { id: 'crate', x: -0.05, z: 0.05 },
  { id: 'barrel', x: 0.45, z: -0.25 },
  { id: 'crate', x: 0.12, z: 0.18 },
  { id: 'barrel', x: -0.4, z: -0.2 },
  { id: 'clay-vase', x: 0.15, z: 0.1 },
];

export async function initGame(
  panel: HTMLElement,
  { scope, fmt, names, colliders }: PhysicsContext,
) {
  const ui = {
    name: part(panel, 'name'),
    mass: part(panel, 'mass'),
    collider: part(panel, 'collider'),
    friction: part(panel, 'friction'),
  };

  const view = new View(getStage(), part(panel, 'view'), { fov: 33 });
  scope.add(() => view.dispose());
  floorAndLights(view, { reach: 3.6 });
  view.camera.position.set(4.0, 2.9, 5.3);
  view.camera.lookAt(0, 0.62, 0);
  view.camera.near = 0.2;
  view.camera.far = 40;
  // Leave room for the inspector at the top.
  view.onResize = () => {
    view.camera.setViewOffset(view.pw, view.ph, 0, -view.ph * 0.09, view.pw, view.ph);
    view.camera.updateProjectionMatrix();
  };
  view.onResize(view);

  const R = await loadRapier();
  if (!scope.alive) return;
  const sim = new Simulation(R, view.scene);
  scope.add(() => sim.dispose());
  sim.fence(1.45, 1.15);
  // Warm the cache so drops never wait on the network.
  await Promise.all([...new Set(DROPS.map((drop) => drop.id))].map((id) => makeBeauty(id)));
  if (!scope.alive) return;

  let t = 0;
  let next = 0;
  let random = seeded(11);
  let adding = false;
  let fading = false;

  const inspect = (selected: Body) => {
    ui.name.textContent = names[selected.item.id] ?? selected.item.id;
    ui.mass.textContent = fmt.kg(selected.item.mass);
    ui.collider.textContent = colliders[selected.item.collider];
    ui.friction.textContent = fmt.fixed(selected.item.friction);
    for (const body of sim.bodies) body.wire.opacity = body === selected ? 0.95 : 0.22;
  };

  async function drop() {
    adding = true;
    const { id, x, z } = DROPS[next++];
    // Barrels land almost upright; tipped over they roll out of frame.
    const tilt = id === 'barrel' ? 0.22 : 1.2;
    const jitter = () => (random() - 0.5) * 0.1;
    const body = await sim.add(id, {
      pos: [x + jitter(), 2.5 + random() * 0.5, z + jitter()],
      euler: [(random() - 0.5) * tilt, random() * 6.28, (random() - 0.5) * tilt],
      spin: [(random() - 0.5) * 2.4 * tilt, (random() - 0.5) * 3, (random() - 0.5) * 2.4 * tilt],
    });
    if (scope.alive) inspect(body);
    adding = false;
  }

  if (prefersReducedMotion()) {
    for (let i = 0; i < DROPS.length; i++) {
      await drop();
      if (!scope.alive) return;
      for (let k = 0; k < 150; k++) sim.world.step();
    }
    sim.sync();
    view.paused = true;
    view.start();
    return;
  }

  view.tick = (dt) => {
    t += dt;
    if (next < DROPS.length && !adding && t > 0.4 + next * 1.15) drop().catch(() => {});
    sim.step(dt);
    if (t > DROPS.length * 1.15 + 5.2 && !fading) {
      fading = true;
      view.canvas.style.transition = 'opacity .5s';
      view.canvas.style.opacity = '0';
      scope.timeout(() => {
        sim.clear();
        t = 0;
        next = 0;
        random = seeded(11);
        view.canvas.style.opacity = '1';
        fading = false;
      }, 520);
    }
  };
  view.start();
}

// ─────────── "Mass and contact" tile ───────────
const SOLO = ['clay-vase', 'crate', 'sneaker', 'barrel', 'coffee-table'];

export async function initPhysicsTile(
  tile: HTMLElement,
  { scope, fmt }: Pick<PhysicsContext, 'scope' | 'fmt'>,
) {
  const ui = {
    mass: part(tile, 'mass'),
    friction: part(tile, 'friction'),
    restitution: part(tile, 'restitution'),
  };
  const view = new View(getStage(), part(tile, 'view'), { fov: 28, dpr: 1.75 });
  scope.add(() => view.dispose());
  const { key, lines } = floorAndLights(view, { reach: 1.6, gridSize: 6, gridDivisions: 24 });

  const R = await loadRapier();
  if (!scope.alive) return;
  const sim = new Simulation(R, view.scene);
  scope.add(() => sim.dispose());

  let index = 0;
  let t = 0;
  let busy = false;
  const random = seeded(5);

  const radius = (item: CatalogItem) => 0.5 * Math.hypot(...item.dims);
  // Where the camera looks on the floor. It trails the object, so a tumble stays in frame.
  const focus = new THREE.Vector2();

  function look(r: number) {
    const dist = r * 7;
    view.camera.position.set(focus.x + dist * 0.62, r * 1.2 + dist * 0.3, focus.y + dist * 0.78);
    view.camera.lookAt(focus.x, r * 1.1, focus.y);
  }

  function follow({ item, group }: Body, ease: number) {
    focus.x += (group.position.x * 0.6 - focus.x) * ease;
    focus.y += (group.position.z * 0.6 - focus.y) * ease;
    look(radius(item));
  }

  // Camera, light and grid follow the size of the object: a sneaker and a barrel share the tile.
  function aim(item: CatalogItem) {
    const r = radius(item);
    const dist = r * 7;
    look(r);
    view.camera.near = r * 0.3;
    view.camera.far = dist * 6;
    // The control covers the lower third: lift the picture.
    view.camera.setViewOffset(view.pw, view.ph, 0, view.ph * 0.17, view.pw, view.ph);
    view.camera.updateProjectionMatrix();
    key.position.set(r * 2.6, r * 5, r * 2.2);
    Object.assign(key.shadow.camera, {
      left: -r * 3.4,
      right: r * 3.4,
      top: r * 3.4,
      bottom: -r * 3.4,
      near: r * 0.5,
      far: r * 14,
    });
    key.shadow.camera.updateProjectionMatrix();
    lines.scale.setScalar(r * 1.1);
  }
  view.onResize = () => {
    if (sim.bodies[0]) aim(sim.bodies[0].item);
  };

  async function spawn() {
    busy = true;
    sim.clear();
    const item = itemOf(SOLO[index]);
    const r = radius(item);
    focus.set(0, 0);
    aim(item);
    sim.fence(r * 1.4, r * 1.4);
    const body = await sim.add(item.id, {
      pos: [0, r * 3.1, 0],
      euler: [(random() - 0.5) * 1.4, random() * 6.28, (random() - 0.5) * 1.4],
      spin: [(random() - 0.5) * 5, (random() - 0.5) * 2, (random() - 0.5) * 5],
    });
    if (!scope.alive) return;
    body.wire.opacity = 0.75;
    ui.mass.textContent = fmt.kg(item.mass);
    ui.friction.textContent = fmt.fixed(item.friction);
    ui.restitution.textContent = fmt.fixed(item.restitution);
    t = 0;
    busy = false;
    view.canvas.style.opacity = '1';
  }

  await spawn();
  if (!scope.alive) return;
  if (prefersReducedMotion()) {
    for (let k = 0; k < 240; k++) sim.world.step();
    sim.sync();
    follow(sim.bodies[0], 1);
    view.paused = true;
    view.start();
    return;
  }

  view.tick = (dt) => {
    if (busy) return;
    t += dt;
    sim.step(dt);
    if (sim.bodies[0]) follow(sim.bodies[0], 1 - Math.exp(-dt * 2.5));
    if (t > 4.4) {
      busy = true;
      view.canvas.style.transition = 'opacity .4s';
      view.canvas.style.opacity = '0';
      index = (index + 1) % SOLO.length;
      scope.timeout(() => {
        spawn().catch(() => {});
      }, 420);
    }
  };
  view.start();
}
