// The two Replicate steps of the harness. Both were picked by an A/B run on real listings:
// the sheet + TRELLIS pair produced usable models on every test object.

export const A100_USD_PER_SECOND = 0.0014;

export const SHEET_MODEL = {
  path: '/models/google/nano-banana-pro/predictions',
  costUsd: 0.15, // per 2K output image
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

export function buildRequest(images: string[]) {
  return { version: BUILD_MODEL.version, input: { ...BUILD_MODEL.input, images } };
}

export function buildCostUsd(predictSeconds: number | undefined): number {
  return (predictSeconds ?? 0) * BUILD_MODEL.usdPerSecond;
}
