import * as THREE from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { type CatalogItem, itemOf, type MaterialKey, modelUrl } from '../catalog';
import { type GrainKind, grainNormalMap } from './grain';
import { keep } from './resources';

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const cache = new Map<string, Promise<THREE.Group>>();

// What a material class looks like beyond its colour. A photo-to-3D mesh carries a base colour
// texture and, at best, roughness and normals; the rest of the surface response comes from here.
type Finish = {
  // Used only when the mesh has no roughness/metalness texture of its own.
  roughness: number;
  metalness: number;
  // Soft retro-reflection at grazing angles: what makes cloth look like cloth.
  sheen?: number;
  sheenRoughness?: number;
  // A thin glossy layer over the base: glaze, lacquer, polished leather.
  clearcoat?: number;
  clearcoatRoughness?: number;
  // Micro-relief for meshes without a normal map: [kind, tiles across the texture, strength].
  grain?: [GrainKind, number, number];
  // Lay the grain over the mesh's own normal map too. Generated normal maps hold the folds and
  // seams of a cushion but not its weave.
  grainOverNormals?: boolean;
  // How strongly the studio is reflected.
  reflections?: number;
};

const FINISH: Record<MaterialKey, Finish> = {
  upholstery: {
    roughness: 0.92,
    metalness: 0,
    sheen: 0.4,
    sheenRoughness: 0.55,
    grain: ['weave', 20, 0.6],
    grainOverNormals: true,
  },
  wood: { roughness: 0.58, metalness: 0, grain: ['tooth', 12, 0.22], reflections: 1.1 },
  ceramic: { roughness: 0.5, metalness: 0, grain: ['pores', 9, 0.12], reflections: 1.15 },
  concrete: { roughness: 0.9, metalness: 0, grain: ['pores', 8, 0.5] },
  leather: { roughness: 0.6, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.45 },
  polymer: { roughness: 0.5, metalness: 0 },
  metal: { roughness: 0.3, metalness: 1, reflections: 1.35 },
  steel: { roughness: 0.42, metalness: 1, reflections: 1.25 },
};

type Shader = { fragmentShader: string; uniforms: Record<string, { value: unknown }> };

// A second, tiling normal map perturbing the normal the mesh's own map already produced.
function grainOverNormals(texture: THREE.Texture, tiles: number, strength: number) {
  return (shader: Shader) => {
    shader.uniforms.grainMap = { value: texture };
    shader.uniforms.grainTiles = { value: tiles };
    shader.uniforms.grainStrength = { value: strength };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <normalmap_pars_fragment>',
        `#include <normalmap_pars_fragment>
        uniform sampler2D grainMap;
        uniform float grainTiles;
        uniform float grainStrength;`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        #ifdef USE_NORMALMAP_TANGENTSPACE
          vec3 grainN = texture2D( grainMap, vNormalMapUv * grainTiles ).xyz * 2.0 - 1.0;
          grainN.xy *= grainStrength * ( 1.0 - metalnessFactor );
          normal = normalize( normal + tbn * vec3( grainN.xy, 0.0 ) );
        #endif`,
      );
  };
}

const MAPS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'] as const;

const isMesh = (node: THREE.Object3D): node is THREE.Mesh => (node as THREE.Mesh).isMesh === true;

export const standard = (mesh: THREE.Mesh) => mesh.material as THREE.MeshStandardMaterial;

// The loader's material, upgraded to a physical one with the finish of its class.
function finished(source: THREE.MeshStandardMaterial, finish: Finish) {
  const material = new THREE.MeshPhysicalMaterial();
  THREE.MeshStandardMaterial.prototype.copy.call(material, source);
  material.defines = { STANDARD: '', PHYSICAL: '' };
  material.name = source.name;

  if (!material.roughnessMap && !material.metalnessMap) {
    material.roughness = finish.roughness;
    material.metalness = finish.metalness;
  }
  if (finish.sheen) {
    material.sheen = finish.sheen;
    material.sheenRoughness = finish.sheenRoughness ?? 0.5;
    // Tinted by the cloth itself, lifted towards white.
    material.sheenColor.set(0xffffff);
  }
  if (finish.clearcoat) {
    material.clearcoat = finish.clearcoat;
    material.clearcoatRoughness = finish.clearcoatRoughness ?? 0.3;
  }
  if (finish.grain && material.normalMap && finish.grainOverNormals) {
    const [kind, tiles, strength] = finish.grain;
    // Generated atlases pack fewer, larger islands than the base-colour-only meshes, so the
    // same weave needs more repeats to come out at the same physical size.
    material.onBeforeCompile = grainOverNormals(grainNormalMap(kind), tiles * 1.7, strength * 0.85);
    material.customProgramCacheKey = () => `grain-over-normals:${kind}`;
  } else if (finish.grain && !material.normalMap) {
    const [kind, tiles, strength] = finish.grain;
    // The grain tiles on its own; every map keeps an independent UV transform.
    const grain = grainNormalMap(kind).clone();
    grain.repeat.set(tiles, tiles);
    grain.needsUpdate = true;
    material.normalMap = grain;
    material.normalScale.set(strength, strength);
  }
  material.envMapIntensity = finish.reflections ?? 1;
  for (const slot of MAPS) {
    const texture = material[slot];
    if (texture) texture.anisotropy = 8;
  }
  source.dispose();
  return material;
}

function prepare(root: THREE.Group, item: CatalogItem) {
  const finish = FINISH[item.material];
  const upgraded = new Map<THREE.Material, THREE.MeshPhysicalMaterial>();
  root.traverse((node) => {
    if (!isMesh(node)) return;
    const source = standard(node);
    let material = upgraded.get(source);
    if (!material) {
      material = finished(source, finish);
      upgraded.set(source, material);
    }
    node.material = material;
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
  options: { lod?: 0 | 1 | 2; hd?: boolean; ownMaterials?: boolean } = {},
) {
  const item = itemOf(id);
  const file = options.hd && item.hd ? item.hd.file : item.lods[options.lod ?? 0].file;
  const source = await load(file, item);
  const copy = source.clone(true);
  if (options.ownMaterials) {
    copy.traverse((node) => {
      if (!isMesh(node)) return;
      const shared = standard(node);
      const own = shared.clone();
      // `clone` leaves the shader hooks behind.
      own.onBeforeCompile = shared.onBeforeCompile;
      own.customProgramCacheKey = shared.customProgramCacheKey;
      node.material = own;
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
