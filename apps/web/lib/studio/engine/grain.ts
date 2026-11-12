// Micro-relief for meshes that arrive with a base colour texture only.
// A photo-to-3D mesh keeps the colour of a fabric or a glaze but not its surface, so it lights
// like plastic. These are small tileable normal maps, generated once, that give each material
// class the fine structure that catches the light: the nubs of a weave, the pores of fired clay,
// the tooth of sanded wood.

import * as THREE from 'three';
import { keep } from './resources';

export type GrainKind = 'weave' | 'pores' | 'tooth';

const SIZE = 256;

// Deterministic, so the surface is the same on every visit.
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth noise on a lattice of `cells` × `cells` that wraps at the edges.
function lattice(cells: number, seed: number) {
  const next = random(seed);
  const values = Float32Array.from({ length: cells * cells }, () => next());
  const at = (x: number, y: number) =>
    values[(((y % cells) + cells) % cells) * cells + (((x % cells) + cells) % cells)];
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = u * cells;
    const y = v * cells;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = fade(x - x0);
    const fy = fade(y - y0);
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
    const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
    return top + (bottom - top) * fy;
  };
}

// Distance to the nearest of a set of jittered points, one per cell, wrapping at the edges.
function cellular(cells: number, seed: number) {
  const next = random(seed);
  const points = Float32Array.from({ length: cells * cells * 2 }, () => next());
  return (u: number, v: number) => {
    const x = u * cells;
    const y = v * cells;
    const cx = Math.floor(x);
    const cy = Math.floor(y);
    let best = 9;
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const gx = cx + i;
        const gy = cy + j;
        const index =
          ((((gy % cells) + cells) % cells) * cells + (((gx % cells) + cells) % cells)) * 2;
        const dx = gx + points[index] - x;
        const dy = gy + points[index + 1] - y;
        best = Math.min(best, dx * dx + dy * dy);
      }
    }
    return Math.sqrt(best);
  };
}

function heightField(kind: GrainKind) {
  if (kind === 'weave') {
    // Rounded nubs packed tight, with a little fuzz on top.
    const nubs = cellular(26, 11);
    const fuzz = lattice(96, 12);
    return (u: number, v: number) => {
      const dome = Math.max(0, 1 - nubs(u, v) * 1.25);
      return dome * (2 - dome) + fuzz(u, v) * 0.22;
    };
  }
  if (kind === 'pores') {
    // A mostly flat surface with scattered pits and a soft undulation.
    const pits = cellular(34, 21);
    const swell = lattice(10, 22);
    const dust = lattice(128, 23);
    return (u: number, v: number) => {
      const pit = Math.min(1, pits(u, v) * 2.6);
      return pit * pit * 0.7 + swell(u, v) * 0.5 + dust(u, v) * 0.12;
    };
  }
  // Fine isotropic tooth.
  const coarse = lattice(48, 31);
  const fine = lattice(128, 32);
  return (u: number, v: number) => coarse(u, v) * 0.6 + fine(u, v) * 0.4;
}

const cache = new Map<GrainKind, THREE.Texture>();

export function grainNormalMap(kind: GrainKind) {
  let texture = cache.get(kind);
  if (texture) return texture;

  const height = heightField(kind);
  const field = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) field[y * SIZE + x] = height(x / SIZE, y / SIZE);
  }
  const sample = (x: number, y: number) => field[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];

  const pixels = new Uint8Array(SIZE * SIZE * 4);
  const slope = 3.2;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = (sample(x - 1, y) - sample(x + 1, y)) * slope;
      const dy = (sample(x, y - 1) - sample(x, y + 1)) * slope;
      const length = Math.hypot(dx, dy, 1);
      const offset = (y * SIZE + x) * 4;
      pixels[offset] = Math.round((dx / length) * 127.5 + 127.5);
      pixels[offset + 1] = Math.round((dy / length) * 127.5 + 127.5);
      pixels[offset + 2] = Math.round((1 / length) * 127.5 + 127.5);
      pixels[offset + 3] = 255;
    }
  }

  texture = new THREE.DataTexture(pixels, SIZE, SIZE, THREE.RGBAFormat);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  cache.set(kind, keep(texture));
  return texture;
}
