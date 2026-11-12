// Reads and edits the materials of a binary glTF without decoding it. A generated model is one
// GLB; a user's material changes are a small list of factors kept beside it, and this file is the
// only place that turns the two into a new GLB. Only the JSON chunk is rewritten: the geometry and
// the texture bytes are copied as they are, so the original file is never touched and an edit can
// always be reset. No Node and no sharp in here, so the browser can import it too.

export type Rgb = [number, number, number];

// One entry per glTF material. `index` is the position in the file's `materials` array: it is the
// stable key of a part's material.
export type GlbMaterial = {
  index: number;
  // The name in the file, or null when the file has none (the editor then numbers it).
  name: string | null;
  baseColor: Rgb;
  roughness: number;
  metalness: number;
};

// What a user changed on one material. Missing fields stay as the file has them. `baseColor` is a
// tint that multiplies the baked colour texture, which is how glTF defines baseColorFactor.
export type MaterialEdit = {
  index: number;
  baseColor?: Rgb;
  roughness?: number;
  metalness?: number;
};

// Finishes a user can start from. They set shine, not colour, because the generated colour lives
// in the baked texture. Ids match the material profiles of the sheet prompt (materials.ts).
export const FINISHES = [
  { id: 'stone', roughness: 0.25, metalness: 0 },
  { id: 'wood', roughness: 0.65, metalness: 0 },
  { id: 'metal', roughness: 0.3, metalness: 1 },
] as const;

export type FinishId = (typeof FINISHES)[number]['id'];

export const MAX_MATERIALS = 64;

const MAGIC = 0x46546c67; // "glTF"
const JSON_CHUNK = 0x4e4f534a; // "JSON"
const HEADER = 12;
const CHUNK_HEADER = 8;

type Json = {
  materials?: {
    name?: string;
    pbrMetallicRoughness?: {
      baseColorFactor?: number[];
      metallicFactor?: number;
      roughnessFactor?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }[];
  [key: string]: unknown;
};

type Parsed = { json: Json; jsonEnd: number; view: DataView };

function parse(bytes: Uint8Array): Parsed | null {
  if (bytes.byteLength < HEADER + CHUNK_HEADER) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== MAGIC || view.getUint32(4, true) !== 2) return null;
  if (view.getUint32(8, true) !== bytes.byteLength) return null;
  const length = view.getUint32(HEADER, true);
  const jsonEnd = HEADER + CHUNK_HEADER + length;
  if (view.getUint32(HEADER + 4, true) !== JSON_CHUNK || jsonEnd > bytes.byteLength) return null;
  try {
    const text = new TextDecoder().decode(bytes.subarray(HEADER + CHUNK_HEADER, jsonEnd));
    return { json: JSON.parse(text) as Json, jsonEnd, view };
  } catch {
    return null;
  }
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const round = (value: number) => Math.round(clamp01(value) * 1000) / 1000;

// The materials of a GLB, with the glTF defaults filled in (white, fully rough and fully metallic
// when a file leaves the factors out). Empty when the file cannot be read.
export function readGlbMaterials(bytes: Uint8Array): GlbMaterial[] {
  const parsed = parse(bytes);
  if (!parsed) return [];
  return (parsed.json.materials ?? []).map((material, index) => {
    const pbr = material.pbrMetallicRoughness ?? {};
    const color = pbr.baseColorFactor ?? [1, 1, 1, 1];
    return {
      index,
      name: material.name?.trim() || null,
      baseColor: [round(color[0] ?? 1), round(color[1] ?? 1), round(color[2] ?? 1)],
      roughness: round(pbr.roughnessFactor ?? 1),
      metalness: round(pbr.metallicFactor ?? 1),
    };
  });
}

// Validates what a client sent. Unknown shapes are dropped, numbers are clamped to 0..1, an index
// outside the file is rejected as a whole, and the last edit of a material wins.
export function sanitizeMaterialEdits(
  input: unknown,
  materialCount: number,
): MaterialEdit[] | null {
  if (!Array.isArray(input) || input.length > MAX_MATERIALS) return null;
  const byIndex = new Map<number, MaterialEdit>();
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return null;
    const entry = raw as Record<string, unknown>;
    const index = entry.index;
    if (
      typeof index !== 'number' ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= materialCount
    )
      return null;
    const edit: MaterialEdit = { index };
    if (entry.roughness !== undefined) {
      if (typeof entry.roughness !== 'number' || !Number.isFinite(entry.roughness)) return null;
      edit.roughness = round(entry.roughness);
    }
    if (entry.metalness !== undefined) {
      if (typeof entry.metalness !== 'number' || !Number.isFinite(entry.metalness)) return null;
      edit.metalness = round(entry.metalness);
    }
    if (entry.baseColor !== undefined) {
      const color = entry.baseColor;
      if (
        !Array.isArray(color) ||
        color.length !== 3 ||
        !color.every((channel) => typeof channel === 'number' && Number.isFinite(channel))
      )
        return null;
      edit.baseColor = [round(color[0]), round(color[1]), round(color[2])];
    }
    // An edit that changes nothing is not stored.
    if (edit.roughness !== undefined || edit.metalness !== undefined || edit.baseColor)
      byIndex.set(index, edit);
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}

// A new GLB with the edits applied to its materials. Returns the same bytes when there is nothing
// to apply or the file cannot be read, so a caller can always serve the result.
export function applyMaterialEdits(bytes: Uint8Array, edits: MaterialEdit[]): Uint8Array {
  if (edits.length === 0) return bytes;
  const parsed = parse(bytes);
  if (!parsed) return bytes;
  const { json, jsonEnd } = parsed;
  const materials = json.materials ?? [];
  let changed = false;
  for (const edit of edits) {
    const material = materials[edit.index];
    if (!material) continue;
    const pbr = { ...(material.pbrMetallicRoughness ?? {}) };
    if (edit.baseColor) {
      const alpha = pbr.baseColorFactor?.[3] ?? 1;
      pbr.baseColorFactor = [...edit.baseColor, alpha];
    }
    if (edit.roughness !== undefined) pbr.roughnessFactor = edit.roughness;
    if (edit.metalness !== undefined) pbr.metallicFactor = edit.metalness;
    material.pbrMetallicRoughness = pbr;
    changed = true;
  }
  if (!changed) return bytes;

  // JSON chunks are padded with spaces to a 4-byte boundary.
  const body = new TextEncoder().encode(JSON.stringify(json));
  const padded = Math.ceil(body.byteLength / 4) * 4;
  const rest = bytes.subarray(jsonEnd);
  const out = new Uint8Array(HEADER + CHUNK_HEADER + padded + rest.byteLength);
  out.set(bytes.subarray(0, HEADER + CHUNK_HEADER));
  out.set(body, HEADER + CHUNK_HEADER);
  out.fill(0x20, HEADER + CHUNK_HEADER + body.byteLength, HEADER + CHUNK_HEADER + padded);
  out.set(rest, HEADER + CHUNK_HEADER + padded);
  const view = new DataView(out.buffer);
  view.setUint32(8, out.byteLength, true);
  view.setUint32(HEADER, padded, true);
  return out;
}
