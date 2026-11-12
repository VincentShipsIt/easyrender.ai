import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  applyMaterialEdits,
  FINISHES,
  MAX_MATERIALS,
  readGlbMaterials,
  sanitizeMaterialEdits,
} from './glb';
import { checkGlb } from './guardrails';
import { MATERIALS } from './materials';

// A real model from the showcase: what the pipeline produces today.
const showcase = (name: string) =>
  new Uint8Array(
    readFileSync(new URL(`../../../apps/web/public/showcase/${name}.glb`, import.meta.url)),
  );

// A small two-material GLB with a binary chunk, built by hand.
function makeGlb(materials: object[], bin = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])) {
  const json = new TextEncoder().encode(JSON.stringify({ asset: { version: '2.0' }, materials }));
  const padded = Math.ceil(json.byteLength / 4) * 4;
  const out = new Uint8Array(12 + 8 + padded + 8 + bin.byteLength);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, out.byteLength, true);
  view.setUint32(12, padded, true);
  view.setUint32(16, 0x4e4f534a, true);
  out.set(json, 20);
  out.fill(0x20, 20 + json.byteLength, 20 + padded);
  view.setUint32(20 + padded, bin.byteLength, true);
  view.setUint32(24 + padded, 0x004e4942, true);
  out.set(bin, 28 + padded);
  return out;
}

describe('reading the materials of a GLB', () => {
  it('lists the one material of a generated model with the glTF defaults', () => {
    expect(readGlbMaterials(showcase('armchair'))).toEqual([
      { index: 0, name: null, baseColor: [1, 1, 1], roughness: 1, metalness: 1 },
    ]);
  });

  it('reads names and factors, and returns nothing for a file that is not a GLB', () => {
    const glb = makeGlb([
      {
        name: 'Oak',
        pbrMetallicRoughness: {
          baseColorFactor: [0.5, 0.25, 0, 1],
          roughnessFactor: 0.7,
          metallicFactor: 0,
        },
      },
      { name: 'Steel' },
    ]);
    expect(readGlbMaterials(glb)).toEqual([
      { index: 0, name: 'Oak', baseColor: [0.5, 0.25, 0], roughness: 0.7, metalness: 0 },
      { index: 1, name: 'Steel', baseColor: [1, 1, 1], roughness: 1, metalness: 1 },
    ]);
    expect(readGlbMaterials(new Uint8Array(64))).toEqual([]);
  });
});

describe('applying material edits', () => {
  it('changes only the edited material and keeps the file valid', () => {
    const original = makeGlb([{ name: 'Oak' }, { name: 'Steel' }]);
    const edited = applyMaterialEdits(original, [
      { index: 1, roughness: 0.3, metalness: 0, baseColor: [0.2, 0.4, 0.6] },
    ]);
    expect(readGlbMaterials(edited)).toEqual([
      { index: 0, name: 'Oak', baseColor: [1, 1, 1], roughness: 1, metalness: 1 },
      { index: 1, name: 'Steel', baseColor: [0.2, 0.4, 0.6], roughness: 0.3, metalness: 0 },
    ]);
    expect(new DataView(edited.buffer).getUint32(8, true)).toBe(edited.byteLength);
    expect(edited.byteLength % 4).toBe(0);
  });

  it('copies the geometry and texture bytes unchanged', () => {
    const bin = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    const edited = applyMaterialEdits(makeGlb([{ name: 'A' }], bin), [
      { index: 0, roughness: 0.5 },
    ]);
    expect([...edited.subarray(edited.byteLength - bin.byteLength)]).toEqual([...bin]);
  });

  it('edits a real generated model and the result still passes the model check', () => {
    const original = showcase('armchair');
    const edited = applyMaterialEdits(original, [{ index: 0, roughness: 0.25, metalness: 0 }]);
    expect(checkGlb(edited).ok).toBe(true);
    expect(readGlbMaterials(edited)[0]).toMatchObject({ roughness: 0.25, metalness: 0 });
    // The original bytes are untouched, so an edit can always be reset.
    expect(readGlbMaterials(original)[0]).toMatchObject({ roughness: 1, metalness: 1 });
    expect(edited.byteLength - original.byteLength).toBeLessThan(120);
  });

  it('keeps the alpha of the colour and the texture reference when tinting', () => {
    const glb = makeGlb([
      { pbrMetallicRoughness: { baseColorTexture: { index: 0 }, baseColorFactor: [1, 1, 1, 0.5] } },
    ]);
    const edited = applyMaterialEdits(glb, [{ index: 0, baseColor: [0, 0, 1] }]);
    const json = JSON.parse(
      new TextDecoder().decode(
        edited.subarray(20, 20 + new DataView(edited.buffer).getUint32(12, true)),
      ),
    );
    expect(json.materials[0].pbrMetallicRoughness).toEqual({
      baseColorTexture: { index: 0 },
      baseColorFactor: [0, 0, 1, 0.5],
    });
  });

  it('serves the same bytes when there is nothing to apply or the file is unreadable', () => {
    const glb = makeGlb([{ name: 'A' }]);
    expect(applyMaterialEdits(glb, [])).toBe(glb);
    const junk = new Uint8Array(64);
    expect(applyMaterialEdits(junk, [{ index: 0, roughness: 0.1 }])).toBe(junk);
    expect(applyMaterialEdits(glb, [{ index: 5, roughness: 0.1 }])).toBe(glb);
  });
});

describe('validating edits from a client', () => {
  it('clamps and rounds, keeps the last edit of a material and ignores empty ones', () => {
    expect(
      sanitizeMaterialEdits(
        [
          { index: 1, roughness: 2, metalness: -1 },
          { index: 0, roughness: 0.123456 },
          { index: 1, baseColor: [0.5, 0.5, 2] },
          { index: 0 },
        ],
        2,
      ),
    ).toEqual([
      { index: 0, roughness: 0.123 },
      { index: 1, baseColor: [0.5, 0.5, 1] },
    ]);
  });

  it('rejects an index outside the file, a wrong type or too many edits', () => {
    expect(sanitizeMaterialEdits([{ index: 2, roughness: 0.5 }], 2)).toBeNull();
    expect(sanitizeMaterialEdits([{ index: 0, roughness: '0.5' }], 2)).toBeNull();
    expect(sanitizeMaterialEdits([{ index: 0, baseColor: [1, 1] }], 2)).toBeNull();
    expect(sanitizeMaterialEdits([{ index: 0.5, roughness: 1 }], 2)).toBeNull();
    expect(sanitizeMaterialEdits('nope', 2)).toBeNull();
    expect(
      sanitizeMaterialEdits(Array(MAX_MATERIALS + 1).fill({ index: 0, roughness: 1 }), 2),
    ).toBeNull();
    expect(sanitizeMaterialEdits([], 2)).toEqual([]);
  });
});

describe('finishes', () => {
  it('use the ids of the material profiles and a binary metalness', () => {
    const profiles = new Set(MATERIALS.map((material) => material.id));
    for (const finish of FINISHES) {
      expect(profiles.has(finish.id)).toBe(true);
      expect([0, 1]).toContain(finish.metalness);
    }
  });
});
