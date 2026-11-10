import * as THREE from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { type CatalogItem, itemOf, type MaterialKey, modelUrl } from '../catalog';
import { keep } from './resources';

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const cache = new Map<string, Promise<THREE.Group>>();

// Roughness by material class, for meshes that arrive with a base colour texture only.
const SURFACE: Partial<Record<MaterialKey, { roughness: number; metalness: number }>> = {
  upholstery: { roughness: 0.94, metalness: 0 },
  wood: { roughness: 0.62, metalness: 0 },
  ceramic: { roughness: 0.55, metalness: 0 },
  concrete: { roughness: 0.9, metalness: 0 },
  leather: { roughness: 0.6, metalness: 0 },
  polymer: { roughness: 0.5, metalness: 0 },
};

const isMesh = (node: THREE.Object3D): node is THREE.Mesh => (node as THREE.Mesh).isMesh === true;

export const standard = (mesh: THREE.Mesh) => mesh.material as THREE.MeshStandardMaterial;

function prepare(root: THREE.Group, item: CatalogItem) {
  root.traverse((node) => {
    if (!isMesh(node)) return;
    const material = standard(node);
    if (material.map) material.map.anisotropy = 8;
    if (!material.roughnessMap && !material.metalnessMap) {
      const surface = SURFACE[item.material] ?? { roughness: 0.62, metalness: 0 };
      material.roughness = surface.roughness;
      material.metalness = surface.metalness;
    }
    keep(node.geometry);
    keep(material);
  });
  return root;
}

function load(file: string, item?: CatalogItem) {
  let pending = cache.get(file);
  if (!pending) {
    pending = loader
      .loadAsync(modelUrl(file))
      .then((gltf) => (item ? prepare(gltf.scene, item) : gltf.scene));
    cache.set(file, pending);
  }
  return pending;
}

// A copy of the model that shares geometry (and, unless asked otherwise, materials) with the cache.
export async function getModel(
  id: string,
  options: { lod?: 0 | 1 | 2; ownMaterials?: boolean } = {},
) {
  const item = itemOf(id);
  const source = await load(item.lods[options.lod ?? 0].file, item);
  const copy = source.clone(true);
  if (options.ownMaterials) {
    copy.traverse((node) => {
      if (isMesh(node)) node.material = standard(node).clone();
    });
  }
  return copy;
}

// Positions only, with a clean triangulation: what the wireframe views draw.
export async function getWireGeometry(id: string) {
  const source = await load(`${id}.wire.glb`);
  return keep(firstMesh(source).geometry);
}

const hulls = new Map<string, Promise<number[][]>>();

export function getHullPoints(id: string) {
  let pending = hulls.get(id);
  if (!pending) {
    pending = fetch(modelUrl(`${id}.hull.json`)).then((response) => response.json());
    hulls.set(id, pending);
  }
  return pending;
}

export function firstMesh(root: THREE.Object3D): THREE.Mesh {
  let found: THREE.Mesh | null = null;
  root.traverse((node) => {
    if (!found && isMesh(node)) found = node;
  });
  if (!found) throw new Error('Model has no mesh');
  return found;
}

// The first mesh's geometry with its local matrix. Compressed meshes store quantised positions
// and the node scales them back to metres, so anything derived from the geometry needs it too.
export function meshData(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const mesh = firstMesh(root);
  const matrix = new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(mesh.matrixWorld);
  return { mesh, geometry: mesh.geometry, matrix };
}

export function preload(ids: string[], lod: 0 | 1 | 2 = 0) {
  return Promise.all(
    ids.map((id) => {
      const item = itemOf(id);
      return load(item.lods[lod].file, item).catch(() => null);
    }),
  );
}
