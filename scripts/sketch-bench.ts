/**
 * Sketch-to-3D latency spike for the live sketch canvas (issue #98).
 *
 * Times the two steps a live canvas needs on fal.ai, per sketch:
 *   1. sketch -> image   (fal-ai/fast-lcm-diffusion/image-to-image)
 *   2. image  -> 3D mesh (fal-ai/trellis and fal-ai/triposr)
 * Each call runs twice: the first run includes any cold start, the second is the warm number that
 * matters for a live canvas. It spends real fal credit (about $0.30 for the default set).
 *
 * Needs FAL_KEY. Run it with `bun scripts/sketch-bench.ts --spend`.
 * Output is a Markdown table on stdout plus images and mesh URLs, written to `sketch-bench-out/`.
 *
 * The input shapes below follow fal's public model pages; a model that rejects them fails loudly
 * with the response body instead of being skipped.
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const FAL_KEY = process.env.FAL_KEY;
const SKETCH_DIR = join(import.meta.dir, 'sketch-bench');
const OUT_DIR = 'sketch-bench-out';
const PROMPT =
  'studio product photo of this piece of furniture, oak and linen, soft daylight, plain white background';

type TimedCall = { coldMs: number; warmMs: number; output: unknown };

function toDataUri(png: Uint8Array): string {
  return `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
}

async function callFal(model: string, input: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${model} ${response.status}: ${text.slice(0, 400)}`);
  }
  return JSON.parse(text);
}

async function timeTwice(model: string, input: Record<string, unknown>): Promise<TimedCall> {
  const firstStart = performance.now();
  await callFal(model, input);
  const coldMs = performance.now() - firstStart;
  const secondStart = performance.now();
  const output = await callFal(model, input);
  return { coldMs, warmMs: performance.now() - secondStart, output };
}

function firstUrl(output: unknown, keys: string[]): string | undefined {
  if (typeof output !== 'object' || output === null) return undefined;
  const record = output as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length > 0) {
      const head: unknown = value[0];
      if (typeof head === 'object' && head !== null && 'url' in head) {
        return String((head as { url: unknown }).url);
      }
    }
    if (typeof value === 'object' && value !== null && 'url' in value) {
      return String((value as { url: unknown }).url);
    }
  }
  return undefined;
}

async function main() {
  if (!process.argv.includes('--spend')) {
    throw new Error('This spends fal credit. Re-run with --spend.');
  }
  if (!FAL_KEY) throw new Error('FAL_KEY is not set.');

  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(SKETCH_DIR)).filter((name) => name.endsWith('.png')).sort();
  const rows: string[] = [];
  const links: string[] = [];

  for (const file of files) {
    const name = file.replace(/\.png$/, '');
    const sketch = toDataUri(await readFile(join(SKETCH_DIR, file)));

    const image = await timeTwice('fal-ai/fast-lcm-diffusion/image-to-image', {
      image_url: sketch,
      prompt: PROMPT,
      strength: 0.85,
      num_inference_steps: 4,
    });
    const imageUrl = firstUrl(image.output, ['images', 'image']);
    if (!imageUrl) throw new Error(`No image in LCM output for ${name}`);
    rows.push(
      `| ${name} | sketch to image (LCM) | ${(image.coldMs / 1000).toFixed(1)} | ${(image.warmMs / 1000).toFixed(1)} |`,
    );
    links.push(`- ${name} render: ${imageUrl}`);

    for (const model of ['fal-ai/trellis', 'fal-ai/triposr']) {
      const mesh = await timeTwice(model, { image_url: imageUrl });
      const meshUrl = firstUrl(mesh.output, ['model_mesh', 'model_mesh_url', 'mesh']);
      rows.push(
        `| ${name} | image to 3D (${model.replace('fal-ai/', '')}) | ${(mesh.coldMs / 1000).toFixed(1)} | ${(mesh.warmMs / 1000).toFixed(1)} |`,
      );
      links.push(`- ${name} ${model}: ${meshUrl ?? 'no mesh url in output'}`);
    }
  }

  const report = [
    '## Sketch to 3D latency (fal.ai)',
    '',
    'Seconds, wall clock from this runner, including network. Cold is the first call, warm the second.',
    '',
    '| Sketch | Step | Cold s | Warm s |',
    '|---|---|---|---|',
    ...rows,
    '',
    '### Outputs (open to judge quality)',
    ...links,
    '',
  ].join('\n');
  await writeFile(join(OUT_DIR, 'report.md'), report);
  console.write(`${report}\n`);
}

await main();
