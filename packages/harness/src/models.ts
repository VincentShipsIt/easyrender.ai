// The two Replicate steps of the harness. Both were picked by an A/B run on real listings:
// the sheet + TRELLIS pair produced usable models on every test object.

export const A100_USD_PER_SECOND = 0.0014;

export const SHEET_MODEL = {
  path: '/models/google/nano-banana-pro/predictions',
  costUsd: 0.15, // per 2K output image; keep in step with SHEET_COST_USD in pricing.ts
} as const;

export const BUILD_MODEL = {
  name: 'firtoz/trellis',
  version: 'e8f6c45206993f297372f5436b90350817bd9b4a0d52d2a76df50c1c8afa2b3c',
  usdPerSecond: A100_USD_PER_SECOND,
  input: {
    texture_size: 2048,
    mesh_simplify: 0.95,
    generate_model: true,
    generate_color: false,
    generate_normal: false,
    randomize_seed: false,
    seed: 42,
  },
} as const;

// The tunable part of each step. The private harness can override these; the cost and the model
// name stay in code so pricing never drifts from what is actually run.
export type SheetSettings = { path: string; input: Record<string, unknown> };
export type BuildSettings = { version: string; input: Record<string, unknown> };

export const DEFAULT_SHEET_SETTINGS: SheetSettings = {
  path: SHEET_MODEL.path,
  input: { aspect_ratio: '1:1', resolution: '2K', output_format: 'png' },
};

export const DEFAULT_BUILD_SETTINGS: BuildSettings = {
  version: BUILD_MODEL.version,
  input: { ...BUILD_MODEL.input },
};

export function buildRequest(images: string[], settings: BuildSettings = DEFAULT_BUILD_SETTINGS) {
  return { version: settings.version, input: { ...settings.input, images } };
}

export function buildCostUsd(predictSeconds: number | undefined): number {
  return (predictSeconds ?? 0) * BUILD_MODEL.usdPerSecond;
}
