// The light every element is reflected in: a dark photo studio with softboxes.
// Image-based lighting is most of what makes a PBR surface read as real, and a product shot is
// lit by a few large, soft sources against black. Large sources give fabric its soft falloff and
// give metal and glaze the long highlights that describe their shape.

import * as THREE from 'three';

// A rectangular emitter facing the subject from `direction`. Colour values above 1 are radiance.
function softbox(
  direction: [number, number, number],
  width: number,
  height: number,
  radiance: number,
  tint: THREE.ColorRepresentation = 0xffffff,
) {
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(tint).multiplyScalar(radiance),
    side: THREE.DoubleSide,
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  panel.position.set(...direction).setLength(10);
  panel.lookAt(0, 0, 0);
  return panel;
}

export function createStudioEnvironment() {
  const scene = new THREE.Scene();

  // The room: near black, a touch lighter overhead so nothing reflects pure void.
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(30, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x16161a, side: THREE.BackSide }),
  );
  scene.add(room);

  // The floor the element stands on bounces a little light back up.
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(26, 48),
    new THREE.MeshBasicMaterial({ color: 0x2a2927 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -6;
  scene.add(floor);

  scene.add(
    // Key: a large warm softbox, high on the camera's right.
    softbox([2.4, 3.2, 2.8], 9, 7, 9, 0xfff4e6),
    // Overhead: wide and soft, fills the tops.
    softbox([0, 5, 0.6], 12, 9, 3.2),
    // Rim: a tall strip behind and to the left, separates the silhouette from the background.
    softbox([-3.2, 1.6, -3], 3, 11, 10, 0xeef3ff),
    // A second, narrower strip on the far right for the opposite edge.
    softbox([3.6, 1.2, -2.2], 1.6, 9, 5),
    // Fill: low and dim on the camera's left, lifts the shadow side.
    softbox([-3, 0.9, 3], 8, 6, 0.9),
  );
  return scene;
}

export function disposeStudioEnvironment(scene: THREE.Scene) {
  scene.traverse((node) => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
}
