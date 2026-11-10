// E-commerce: product page → "View in your space" → the real model placed over a room photo.

import * as THREE from 'three';
import { part, placeCursor } from '../dom';
import { getStage, prefersReducedMotion, View } from '../engine/stage';
import { ease, makeBeauty, seg } from '../engine/studio';
import type { Scope } from '../scope';

const ID = 'swivel-chair';
const BACKDROP = '/studio/room-ar.jpg';
const T = { aim: 0.9, tap: 2.0, scan: 2.35, place: 4.1, settle: 5.0, hold: 11.2, total: 12.2 };

type Phase = 'shop' | 'aim' | 'tap' | 'scan' | 'place' | 'hold';

export type ArContext = { scope: Scope; labels: { searching: string; placed: string } };

export async function initAr(panel: HTMLElement, { scope, labels }: ArContext) {
  const ui = {
    button: part(panel, 'button'),
    reticle: part(panel, 'reticle'),
    pill: part(panel, 'pill'),
    cursor: part(panel, 'cursor'),
  };
  part<HTMLImageElement>(panel, 'backdrop').src = BACKDROP;

  // A phone camera at chest height looking down at the floor, to match the background photo.
  const view = new View(getStage(), part(panel, 'view'), { fov: 62, envIntensity: 0.45 });
  scope.add(() => view.dispose());
  view.camera.position.set(0, 1.35, 1.95);
  view.camera.lookAt(0, 0.74, 0);
  view.camera.near = 0.1;
  view.camera.far = 20;
  view.camera.updateProjectionMatrix();

  // Window light from the left, shadows falling to the right.
  const sun = new THREE.DirectionalLight(0xfff3e2, 1.75);
  sun.position.set(-2.6, 3.1, 0.9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -1.4,
    right: 1.4,
    top: 1.4,
    bottom: -1.4,
    near: 0.5,
    far: 9,
  });
  sun.shadow.radius = 9;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  view.scene.add(sun, new THREE.HemisphereLight(0xffffff, 0xcbb8a0, 0.4));

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.ShadowMaterial({ opacity: 0.34 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  view.scene.add(ground);

  const chair = await makeBeauty(ID, { shadows: true });
  if (!scope.alive) return;
  const pivot = new THREE.Group();
  pivot.add(chair);
  view.scene.add(pivot);

  let t = 0;
  let phase: Phase | '' = '';
  const still = prefersReducedMotion();

  function enter(next: Phase) {
    if (next === phase) return;
    phase = next;
    if (next === 'shop') {
      panel.classList.remove('is-cam');
      ui.reticle.classList.remove('is-on');
      ui.cursor.classList.remove('is-on');
      ui.pill.textContent = labels.searching;
    } else if (next === 'aim') {
      ui.cursor.classList.add('is-on');
      placeCursor(ui.cursor, panel, ui.button, 0.62, 0.6);
    } else if (next === 'tap') {
      ui.button.classList.add('is-down');
      scope.timeout(() => ui.button.classList.remove('is-down'), 180);
    } else if (next === 'scan') {
      panel.classList.add('is-cam');
      ui.reticle.classList.add('is-on');
      ui.cursor.classList.remove('is-on');
    } else if (next === 'place') {
      ui.pill.textContent = labels.placed;
    } else if (next === 'hold') {
      ui.reticle.classList.remove('is-on');
    }
  }

  view.tick = (dt) => {
    if (still) {
      pivot.scale.setScalar(1);
      pivot.rotation.y = -0.45;
      return;
    }
    t += dt;
    if (t >= T.total) t = 0;
    if (t < T.aim) enter('shop');
    else if (t < T.tap) enter('aim');
    else if (t < T.scan) enter('tap');
    else if (t < T.place) enter('scan');
    else if (t < T.settle) enter('place');
    else if (t < T.hold) enter('hold');
    else enter('shop');

    const k = seg(t, T.place, T.settle);
    pivot.scale.setScalar(k <= 0 ? 0.0001 : ease.outBack(k));
    pivot.position.y = (1 - ease.out(k)) * 0.12;
    // The shopper turns it with a finger.
    const r = ease.inOutSine(seg(t, T.settle + 0.3, T.hold - 0.6));
    pivot.rotation.y = -0.55 + Math.sin(r * Math.PI * 2) * 0.55 + r * 0.5;
    ui.reticle.style.setProperty('--s', (1 + Math.sin(t * 5) * 0.05 - k * 0.28).toFixed(3));
  };

  if (still) {
    panel.classList.add('is-cam');
    ui.pill.textContent = labels.placed;
    view.paused = true;
  }
  view.start();
  scope.add(() => {
    panel.classList.remove('is-cam');
    ui.reticle.classList.remove('is-on');
    ui.cursor.classList.remove('is-on');
  });
}
