// Hub shelf: one card per category, each with a real shot of its elements.

import * as THREE from 'three';
import { itemOf } from '../catalog';
import { part, parts } from '../dom';
import { getStage, View } from '../engine/stage';
import { addFloor, addStudioLights, frame, makeBeauty } from '../engine/studio';
import type { Scope } from '../scope';
import { type Placement, SHELVES } from '../shelves';

// Lays a set out at real scale and normalises it to radius 1 for framing.
async function arrange(set: Placement[]) {
  const group = new THREE.Group();
  const models = await Promise.all(set.map(([id]) => makeBeauty(id, { lod: 1, shadows: true })));
  const box = new THREE.Box3();
  models.forEach((model, i) => {
    const [id, x, z, yaw] = set[i];
    const [w, h, d] = itemOf(id).dims;
    const r = Math.max(w, d) / 2;
    model.position.set(x, 0, z);
    model.rotation.y = yaw;
    group.add(model);
    box.union(
      new THREE.Box3(new THREE.Vector3(x - r, 0, z - r), new THREE.Vector3(x + r, h, z + r)),
    );
  });
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  group.position.set(-centre.x, 0, -centre.z);
  const radius = 0.5 * Math.hypot(size.x, size.y, size.z * 0.5);
  const object = new THREE.Group();
  object.add(group);
  object.scale.setScalar(1 / radius);
  return { object, cy: size.y / 2 / radius };
}

export type ShelfContext = {
  scope: Scope;
  labels: { count: (current: number, total: number) => string };
};

export async function initShelf(root: HTMLElement, { scope, labels }: ShelfContext) {
  const track = part(root, 'track');
  const count = part(root, 'count');
  const prev = part<HTMLButtonElement>(root, 'prev');
  const next = part<HTMLButtonElement>(root, 'next');
  const cards = parts(root, 'card');

  // Carousel controls.
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
  const update = () => {
    const index = Math.min(cards.length, Math.round(track.scrollLeft / step()) + 1);
    count.textContent = labels.count(index, cards.length);
    prev.disabled = track.scrollLeft < 8;
    next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 8;
  };
  scope.on(prev, 'click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  scope.on(next, 'click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  scope.on(track, 'scroll', () => requestAnimationFrame(update), { passive: true });
  scope.on(window, 'resize', update);
  update();

  // Shots: one off-screen view, reused for every card.
  const stage = getStage();
  const host = document.createElement('div');
  host.style.cssText =
    'position:fixed;left:-9999px;top:0;width:560px;height:628px;pointer-events:none';
  document.body.append(host);
  const view = new View(stage, host, { fov: 24, dpr: 2 });
  scope.add(() => {
    view.dispose();
    host.remove();
  });
  addStudioLights(view.scene, { shadows: true, reach: 1.8 });
  addFloor(view.scene, { receiveShadow: true, pool: 0.1, contact: 0 });
  const pivot = new THREE.Group();
  view.scene.add(pivot);

  for (let i = 0; i < SHELVES.length && i < cards.length; i++) {
    try {
      const { object, cy } = await arrange(SHELVES[i].set);
      if (!scope.alive) return;
      pivot.clear();
      pivot.add(object);
      frame(view, { cy, margin: 1.2, elev: SHELVES[i].elev ?? 0.2, shiftY: -0.03 });
      const shot = part<HTMLImageElement>(cards[i], 'shot');
      shot.src = stage.snapshot(view);
      shot.hidden = false;
      await scope.wait(30); // let the page breathe between shots
      if (!scope.alive) return;
    } catch (error) {
      console.warn('studio shelf: shot failed', SHELVES[i].category, error);
    }
  }
}
