import { LIMITS, type Limits } from './guardrails';
import { MATERIALS, type MaterialProfile } from './materials';
import {
  type BuildSettings,
  DEFAULT_BUILD_SETTINGS,
  DEFAULT_SHEET_SETTINGS,
  type SheetSettings,
} from './models';
import { SHEET_PROMPT } from './sheet';
import { type RenderSkill, SKILLS } from './skills';

// Where the recipe comes from. The skills are an open repo anyone can read. The harness is a
// private repo: the tuned sheet prompt, model settings and guardrail thresholds. Both are read at
// runtime and cached; if either cannot be reached or does not validate, the defaults compiled into
// this package are used, so a GitHub outage or a missing token never stops a render.

const SKILLS_BASE = 'https://raw.githubusercontent.com/easyrenderai/skills/main';
const HARNESS_URL = 'https://api.github.com/repos/easyrenderai/harness/contents/harness.json';
const TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 3000;

export type Harness = {
  skills: RenderSkill[];
  sheetPrompt: string;
  materials: MaterialProfile[];
  sheet: SheetSettings;
  build: BuildSettings;
  limits: Limits;
  // Where each part came from, for logs.
  source: { skills: 'remote' | 'default'; harness: 'remote' | 'default' };
};

export const DEFAULT_HARNESS: Harness = {
  skills: SKILLS,
  sheetPrompt: SHEET_PROMPT,
  materials: MATERIALS,
  sheet: DEFAULT_SHEET_SETTINGS,
  build: DEFAULT_BUILD_SETTINGS,
  limits: LIMITS,
  source: { skills: 'default', harness: 'default' },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown, min = 1, max = 4000): value is string =>
  typeof value === 'string' && value.length >= min && value.length <= max;

export function parseSkills(
  manifest: unknown,
  files: Record<string, string>,
): RenderSkill[] | null {
  if (!Array.isArray(manifest)) return null;
  const skills: RenderSkill[] = [];
  for (const entry of manifest) {
    if (!isRecord(entry)) return null;
    const { id, label, keywords, file } = entry;
    const body = typeof file === 'string' ? files[file] : undefined;
    if (!isString(id, 1, 40) || !isString(label, 1, 80) || !isString(body, 20)) return null;
    if (!Array.isArray(keywords) || !keywords.every((word) => isString(word, 1, 40))) return null;
    // A skill file is markdown with front matter; the guidance is what follows it.
    const guidance = body.replace(/^---[\s\S]*?---\s*/, '').trim();
    if (guidance.length < 20) return null;
    skills.push({ id, label, keywords: keywords as string[], guidance });
  }
  return skills.length > 0 ? skills : null;
}

// The material profiles, all or nothing like the skills: one bad entry keeps the bundled ones.
export function parseMaterials(raw: unknown): MaterialProfile[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const materials: MaterialProfile[] = [];
  for (const entry of raw) {
    if (!isRecord(entry)) return null;
    const { id, label, keywords, guidance } = entry;
    if (!isString(id, 1, 40) || !isString(label, 1, 80) || !isString(guidance, 20, 900))
      return null;
    if (!Array.isArray(keywords) || keywords.length === 0) return null;
    if (!keywords.every((word) => isString(word, 1, 40) && /^[\p{L}\p{N} -]+$/u.test(word))) {
      return null;
    }
    materials.push({ id, label, keywords: keywords as string[], guidance });
  }
  return materials;
}

type HarnessFile = Partial<Pick<Harness, 'sheetPrompt'>> & {
  materials?: unknown;
  build?: Partial<BuildSettings>;
  limits?: Partial<Limits>;
};

// Takes only the fields it understands, each checked, and keeps the default for the rest.
export function parseHarness(raw: unknown): Omit<Harness, 'skills' | 'source'> | null {
  if (!isRecord(raw)) return null;
  const file = raw as HarnessFile;
  const sheetPrompt = isString(file.sheetPrompt, 200) ? file.sheetPrompt : SHEET_PROMPT;
  if (!/3x3/.test(sheetPrompt)) return null;
  // The sheet model and its resolution set what a sheet costs, so they stay in code: the harness
  // repo cannot point the pipeline at a model the credit prices were not worked out for.
  const sheet: SheetSettings = DEFAULT_SHEET_SETTINGS;
  const build: BuildSettings = {
    version:
      isString(file.build?.version, 64, 64) && /^[0-9a-f]{64}$/.test(file.build.version)
        ? file.build.version
        : DEFAULT_BUILD_SETTINGS.version,
    input: isRecord(file.build?.input) ? file.build.input : DEFAULT_BUILD_SETTINGS.input,
  };
  const limits: Limits = { ...LIMITS };
  for (const key of Object.keys(LIMITS) as (keyof Limits)[]) {
    const value = file.limits?.[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) limits[key] = value;
  }
  return {
    sheetPrompt,
    materials: parseMaterials(file.materials) ?? MATERIALS,
    sheet,
    build,
    limits,
  };
}

async function getText(
  url: string,
  fetchImpl: typeof fetch,
  headers: Record<string, string> = {},
): Promise<string> {
  const response = await fetchImpl(url, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.text();
}

async function fetchSkills(fetchImpl: typeof fetch): Promise<RenderSkill[] | null> {
  const manifest = JSON.parse(await getText(`${SKILLS_BASE}/skills.json`, fetchImpl)) as unknown;
  if (!Array.isArray(manifest)) return null;
  const files: Record<string, string> = {};
  await Promise.all(
    manifest.map(async (entry) => {
      const file = isRecord(entry) ? entry.file : undefined;
      if (typeof file === 'string' && /^[\w./-]+$/.test(file) && !file.includes('..')) {
        files[file] = await getText(`${SKILLS_BASE}/${file}`, fetchImpl);
      }
    }),
  );
  return parseSkills(manifest, files);
}

async function fetchHarness(token: string, fetchImpl: typeof fetch) {
  const text = await getText(HARNESS_URL, fetchImpl, {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.raw+json',
    'X-GitHub-Api-Version': '2022-11-28',
  });
  return parseHarness(JSON.parse(text));
}

let cache: { at: number; value: Harness } | null = null;

export function clearHarnessCache() {
  cache = null;
}

// The harness for the next render. Never throws: each part falls back to its default.
export async function loadHarness(
  options: { token?: string; fetchImpl?: typeof fetch; now?: number } = {},
): Promise<Harness> {
  const now = options.now ?? Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.value;
  const fetchImpl = options.fetchImpl ?? fetch;

  const [skills, harness] = await Promise.all([
    fetchSkills(fetchImpl).catch((error) => {
      console.warn('harness: skills repo unavailable, using bundled skills:', String(error));
      return null;
    }),
    options.token
      ? fetchHarness(options.token, fetchImpl).catch((error) => {
          console.warn('harness: private harness unavailable, using defaults:', String(error));
          return null;
        })
      : Promise.resolve(null),
  ]);

  const value: Harness = {
    ...DEFAULT_HARNESS,
    ...(harness ?? {}),
    skills: skills ?? DEFAULT_HARNESS.skills,
    source: { skills: skills ? 'remote' : 'default', harness: harness ? 'remote' : 'default' },
  };
  // One line per refresh (every five minutes at most) so the deploy logs show what is live.
  console.info(`harness loaded: skills=${value.source.skills} harness=${value.source.harness}`);
  cache = { at: now, value };
  return value;
}
