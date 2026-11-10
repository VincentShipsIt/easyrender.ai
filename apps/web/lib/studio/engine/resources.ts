import type * as THREE from 'three';

// Geometry and materials that live in a cache (loaded models, shared pass materials) and outlive
// any single view. Everything else in a scene belongs to its view and is freed with it.
const shared = new WeakSet<object>();

export function keep<T extends object>(resource: T): T {
  shared.add(resource);
  return resource;
}

type Drawable = THREE.Object3D & {
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material | THREE.Material[];
};

export function disposeTree(root: THREE.Object3D) {
  root.traverse((node) => {
    const drawable = node as Drawable;
    if (drawable.geometry && !shared.has(drawable.geometry)) drawable.geometry.dispose();
    for (const material of drawable.material ? [drawable.material].flat() : []) {
      if (!shared.has(material)) material.dispose();
    }
    const light = node as THREE.DirectionalLight;
    if (light.isLight && light.shadow) light.shadow.dispose();
  });
}
