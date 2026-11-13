// Parts spike: which Replicate models give a 3D model with PBR textures and with separate parts?
// It runs a few candidate image-to-3D models on showcase photos and records, from the GLB each one
// returns, what code can read: meshes, materials, texture maps, part names, size, time and cost.
// Whether the parts are sensible and the surface looks right is judged by a person opening the
// saved GLBs; this script reports no quality score.
//
// Usage: REPLICATE_API_TOKEN=... bun packages/harness/scripts/parts-spike.ts --spend
//          [--candidates=baseline,hunyuan21,partcrafter,trellis2] [--photos=armchair,coffee-table]
//          [--cap=5] [--out=parts-spike-out]
//
// It spends money, so it refuses to run without --spend, and it stops starting runs once the
// estimated spend plus the next run's worst case would pass the cap (USD). Every candidate takes
// the one source photo, so the comparison is like for like.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  BUILD_MODEL,
  buildCostUsd,
  buildRequest,
  createReplicate,
  DEFAULT_BUILD_SETTINGS,
  download,
  isSettled,
  type Prediction,
} from '../src/index.ts';

type Candidate = {
  id: string;
  // A Replicate model "owner/name" (runs its latest version), or null for the pinned production build.
  model: string | null;
  usdPerSecond: number;
  // Worst case of one run, used for the spend cap before the real cost is known.
  worstCaseUsd: number;
  // Inputs to set when the model's schema has them. Anything not in the schema is dropped and logged.
  extra: Record<string, unknown>;
};

const CANDIDATES: Candidate[] = [
  // Today's pipeline model, given the same single photo, as the reference.
  {
    id: 'baseline',
    model: null,
    usdPerSecond: BUILD_MODEL.usdPerSecond,
    worstCaseUsd: 0.2,
    extra: {},
  },
  // Hunyuan3D 2.1 with its PBR texture option. Licence excludes the EU and UK: checked for quality only.
  {
    id: 'hunyuan21',
    model: 'ndreca/hunyuan3d-2.1',
    usdPerSecond: 0.000975,
    worstCaseUsd: 0.5,
    extra: { generate_texture: true },
  },
  // PartCrafter: a part-aware generator, geometry only as far as its README says.
  {
    id: 'partcrafter',
    model: 'fire/part-crafter',
    usdPerSecond: 0.0014,
    worstCaseUsd: 0.6,
    extra: {},
  },
  // TRELLIS.2 with PBR materials; about $0.73 per run is listed, so it goes last.
  {
    id: 'trellis2',
    model: 'fishwowater/trellis2',
    usdPerSecond: 0.0014,
    worstCaseUsd: 1.2,
    extra: {},
  },
];

const PHOTOS = ['armchair', 'coffee-table', 'bedside-table', 'swivel-chair', 'vase', 'clay-vase'];

const arg = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const list = (value: string | undefined) => value?.split(',').filter(Boolean);

if (!process.argv.includes('--spend')) {
  console.error('This spends money on Replicate. Run again with --spend.');
  process.exit(1);
}
const token = process.env.REPLICATE_API_TOKEN ?? '';
const out = arg('out') ?? 'parts-spike-out';
const cap = Number(arg('cap') ?? '5');
const wantedCandidates = list(arg('candidates'));
const wantedPhotos = list(arg('photos')) ?? ['armchair', 'coffee-table'];
const candidates = CANDIDATES.filter((c) => !wantedCandidates || wantedCandidates.includes(c.id));
const photos = PHOTOS.filter((p) => wantedPhotos.includes(p));
if (candidates.length === 0 || photos.length === 0) throw new Error('Nothing selected to run.');
if (!Number.isFinite(cap) || cap <= 0) throw new Error('--cap must be a positive number of USD.');

const client = createReplicate(token);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type SchemaProperty = { type?: string; default?: unknown; format?: string; description?: string };
type ModelInfo = {
  version: string | null;
  licence: string | null;
  inputs: Record<string, SchemaProperty>;
  hardware: string | null;
};

// What a model takes and which version "latest" is, read from Replicate before spending anything.
async function modelInfo(model: string): Promise<ModelInfo | null> {
  const response = await fetch(`https://api.replicate.com/v1/models/${model}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as {
    license_url?: string | null;
    latest_version?: {
      id?: string;
      openapi_schema?: {
        components?: { schemas?: { Input?: { properties?: Record<string, SchemaProperty> } } };
      };
    };
  };
  return {
    version: body.latest_version?.id ?? null,
    licence: body.license_url ?? null,
    inputs: body.latest_version?.openapi_schema?.components?.schemas?.Input?.properties ?? {},
    hardware: null,
  };
}

async function settle(first: Prediction, limitMs: number): Promise<Prediction> {
  let prediction = first;
  const deadline = Date.now() + limitMs;
  while (!isSettled(prediction.status)) {
    if (Date.now() > deadline) throw new Error(`prediction ${prediction.id} timed out`);
    await sleep(4000);
    prediction = await client.get(prediction.id);
  }
  return prediction;
}

// Every .glb URL anywhere in a prediction's output, in order, with the key it was found under.
function glbUrls(output: unknown, key = 'output'): { key: string; url: string }[] {
  if (typeof output === 'string') return /\.glb(\?|$)/i.test(output) ? [{ key, url: output }] : [];
  if (Array.isArray(output)) return output.flatMap((item, i) => glbUrls(item, `${key}[${i}]`));
  if (output && typeof output === 'object') {
    return Object.entries(output).flatMap(([k, value]) => glbUrls(value, `${key}.${k}`));
  }
  return [];
}

type GltfJson = {
  nodes?: { name?: string; mesh?: number }[];
  meshes?: {
    name?: string;
    primitives: { attributes?: Record<string, number>; material?: number }[];
  }[];
  materials?: {
    name?: string;
    pbrMetallicRoughness?: {
      baseColorTexture?: unknown;
      metallicRoughnessTexture?: unknown;
      metallicFactor?: number;
      roughnessFactor?: number;
    };
    normalTexture?: unknown;
    occlusionTexture?: unknown;
    emissiveTexture?: unknown;
  }[];
  images?: unknown[];
  accessors?: { count: number }[];
};

function readJson(bytes: Uint8Array): GltfJson | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67) return null;
  const length = view.getUint32(12, true);
  try {
    return JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + length))) as GltfJson;
  } catch {
    return null;
  }
}

// What code can read from a GLB: parts, materials, which texture maps exist, how many vertices.
function analyse(bytes: Uint8Array) {
  const json = readJson(bytes);
  if (!json) return { readable: false as const, bytes: bytes.byteLength };
  const meshes = json.meshes ?? [];
  const primitives = meshes.flatMap((mesh) => mesh.primitives);
  const materials = json.materials ?? [];
  const has = (pick: (m: NonNullable<GltfJson['materials']>[number]) => unknown) =>
    materials.filter((m) => pick(m) !== undefined).length;
  const vertices = primitives.reduce(
    (sum, p) => sum + (json.accessors?.[p.attributes?.POSITION ?? -1]?.count ?? 0),
    0,
  );
  return {
    readable: true as const,
    bytes: bytes.byteLength,
    meshes: meshes.length,
    primitives: primitives.length,
    distinctMaterialsUsed: new Set(primitives.map((p) => p.material).filter((m) => m !== undefined))
      .size,
    materials: materials.length,
    images: json.images?.length ?? 0,
    vertices,
    maps: {
      baseColor: has((m) => m.pbrMetallicRoughness?.baseColorTexture),
      metallicRoughness: has((m) => m.pbrMetallicRoughness?.metallicRoughnessTexture),
      normal: has((m) => m.normalTexture),
      occlusion: has((m) => m.occlusionTexture),
      emissive: has((m) => m.emissiveTexture),
    },
    unsetFactors: materials.filter(
      (m) =>
        m.pbrMetallicRoughness?.metallicFactor === undefined &&
        m.pbrMetallicRoughness?.roughnessFactor === undefined,
    ).length,
    partNames: [
      ...new Set([
        ...(json.nodes ?? []).map((n) => n.name).filter((n): n is string => Boolean(n)),
        ...meshes.map((m) => m.name).filter((n): n is string => Boolean(n)),
      ]),
    ].slice(0, 40),
  };
}

type Row = {
  photo: string;
  candidate: string;
  model: string;
  version: string | null;
  ok: boolean;
  note: string;
  seconds?: number;
  costUsd: number;
  glbs: { file: string; foundAt: string; analysis: ReturnType<typeof analyse> }[];
  inputSent: string[];
  inputDropped: string[];
};

let spent = 0;
const rows: Row[] = [];
const infos = new Map<string, ModelInfo | null>();

// A bad token fails here, before any prediction is paid for.
const account = await fetch('https://api.replicate.com/v1/account', {
  headers: { Authorization: `Bearer ${token}` },
});
if (!account.ok) {
  console.error(`Replicate refused the token (${account.status}). Nothing was run or spent.`);
  process.exit(1);
}
const accountBody = (await account.json()) as { username?: string; type?: string };
console.log(`Replicate account: ${accountBody.username ?? '?'} (${accountBody.type ?? '?'})`);

mkdirSync(out, { recursive: true });
for (const c of candidates) {
  if (c.model) infos.set(c.id, await modelInfo(c.model));
}
writeFileSync(`${out}/schemas.json`, `${JSON.stringify(Object.fromEntries(infos), null, 2)}\n`);

// Picks the input that takes the photo: a known name, then anything image-like in the schema.
function imageKey(inputs: Record<string, SchemaProperty>): string | null {
  const names = Object.keys(inputs);
  const known = ['image', 'input_image', 'image_url', 'input_images', 'images', 'image_path'];
  return known.find((n) => names.includes(n)) ?? names.find((n) => /image/i.test(n)) ?? null;
}

async function runOne(photo: string, candidate: Candidate): Promise<Row> {
  const info = infos.get(candidate.id) ?? null;
  const row: Row = {
    photo,
    candidate: candidate.id,
    model: candidate.model ?? BUILD_MODEL.name,
    version: candidate.model ? (info?.version ?? null) : BUILD_MODEL.version,
    ok: false,
    note: '',
    costUsd: 0,
    glbs: [],
    inputSent: [],
    inputDropped: [],
  };
  try {
    const source = new Uint8Array(readFileSync(`apps/web/public/showcase/${photo}.jpg`));
    const url = await client.upload(source, `${photo}.jpg`, 'image/jpeg');
    let started: Prediction;
    if (!candidate.model) {
      started = await client.start('/predictions', buildRequest([url], DEFAULT_BUILD_SETTINGS));
      row.inputSent = ['images'];
    } else {
      if (!info) throw new Error('model schema could not be read');
      const key = imageKey(info.inputs);
      if (!key) throw new Error('no image input in the schema');
      const input: Record<string, unknown> = {
        [key]: info.inputs[key]?.type === 'array' ? [url] : url,
      };
      row.inputSent.push(key);
      for (const [name, value] of Object.entries(candidate.extra)) {
        if (name in info.inputs) {
          input[name] = value;
          row.inputSent.push(name);
        } else row.inputDropped.push(name);
      }
      started = await client.start(`/models/${candidate.model}/predictions`, { input });
    }
    const done = await settle(started, 20 * 60_000);
    row.seconds = done.metrics?.predict_time;
    row.costUsd = candidate.model
      ? (row.seconds ?? 0) * candidate.usdPerSecond
      : buildCostUsd(row.seconds);
    spent += row.costUsd;
    if (done.status !== 'succeeded') throw new Error(done.error ?? `prediction ${done.status}`);
    const found = glbUrls(done.output);
    writeFileSync(`${out}/${photo}-${candidate.id}-output.json`, JSON.stringify(done.output));
    if (found.length === 0) throw new Error('the output has no .glb URL');
    for (const [index, item] of found.entries()) {
      const bytes = await download(item.url);
      const file = `${photo}-${candidate.id}-${index}.glb`;
      writeFileSync(`${out}/${file}`, bytes);
      row.glbs.push({ file, foundAt: item.key, analysis: analyse(bytes) });
    }
    row.ok = true;
    row.note = `${found.length} GLB`;
  } catch (error) {
    row.note = error instanceof Error ? error.message : String(error);
  }
  return row;
}

for (const photo of photos) {
  for (const candidate of candidates) {
    if (spent + candidate.worstCaseUsd > cap) {
      const row: Row = {
        photo,
        candidate: candidate.id,
        model: candidate.model ?? BUILD_MODEL.name,
        version: null,
        ok: false,
        note: `skipped: spent $${spent.toFixed(2)} plus a worst case of $${candidate.worstCaseUsd} would pass the $${cap} cap`,
        costUsd: 0,
        glbs: [],
        inputSent: [],
        inputDropped: [],
      };
      rows.push(row);
      console.log(`${photo} / ${candidate.id}: ${row.note}`);
      continue;
    }
    const row = await runOne(photo, candidate);
    rows.push(row);
    console.log(
      `${photo} / ${candidate.id}: ${row.ok ? 'ok' : 'FAIL'} ${row.note} ($${row.costUsd.toFixed(3)}, ${row.seconds ?? '-'}s, total $${spent.toFixed(3)})`,
    );
  }
}

writeFileSync(`${out}/results.json`, `${JSON.stringify(rows, null, 2)}\n`);

const summary = [
  '# Parts spike',
  '',
  `Account ${accountBody.username ?? '?'}. Estimated spend $${spent.toFixed(3)} of a $${cap} cap. Every run takes the one source photo.`,
  '',
  '| photo | candidate | result | seconds | cost $ | GLBs | meshes | materials | maps (colour/MR/normal) | part names |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => {
    const a = r.glbs.map((g) => g.analysis).filter((x) => x.readable);
    const sum = (pick: (x: (typeof a)[number]) => number) => a.reduce((s, x) => s + pick(x), 0);
    const names = [...new Set(a.flatMap((x) => x.partNames))].slice(0, 8).join(', ');
    return `| ${r.photo} | ${r.candidate} | ${r.ok ? 'ok' : `FAIL ${r.note.replace(/\|/g, '/').slice(0, 120)}`} | ${r.seconds?.toFixed(0) ?? '-'} | ${r.costUsd.toFixed(3)} | ${r.glbs.length} | ${sum((x) => x.meshes)} | ${sum((x) => x.materials)} | ${a.map((x) => `${x.maps.baseColor}/${x.maps.metallicRoughness}/${x.maps.normal}`).join(' ')} | ${names || '-'} |`;
  }),
  '',
  'Models and versions run:',
  '',
  ...[...new Set(rows.map((r) => `${r.model} ${r.version ?? ''}`.trim()))].map((m) => `- ${m}`),
  '',
];
writeFileSync(`${out}/summary.md`, `${summary.join('\n')}\n`);
console.log(summary.join('\n'));
