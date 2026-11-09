import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { buildCostUsd, buildRequest } from './models';
import { CREDIT_PACKS, creditsFor, RENDER_CREDITS, rendersInPack } from './pricing';
import { findGlbUrl } from './replicate';
import { cutCells, sheetOutputUrl, sheetPrompt, VIEWS } from './sheet';
import { watermark } from './watermark';

describe('pricing', () => {
  it('keeps a 70% margin over cost', () => {
    expect(creditsFor(0.3)).toBe(100);
    expect(creditsFor(0.24)).toBe(80);
    expect(RENDER_CREDITS).toBe(80);
    // revenue per render covers cost / (1 - margin)
    expect(RENDER_CREDITS * 0.01 * 0.3).toBeGreaterThanOrEqual(0.24 - 1e-9);
  });

  it('sells whole renders per pack', () => {
    expect(CREDIT_PACKS.map(rendersInPack)).toEqual([12, 62]);
  });
});

describe('replicate output', () => {
  it('finds the GLB in nested TRELLIS output', () => {
    expect(findGlbUrl({ model_file: 'https://x/a.glb', color_video: 'https://x/v.mp4' })).toBe(
      'https://x/a.glb',
    );
    expect(findGlbUrl(['https://x/v.mp4', { mesh: 'https://x/m.glb?sig=1' }])).toBe(
      'https://x/m.glb?sig=1',
    );
    expect(findGlbUrl({ video: 'https://x/v.mp4' })).toBeNull();
  });

  it('reads the sheet URL from string or array output', () => {
    expect(sheetOutputUrl('https://x/s.png')).toBe('https://x/s.png');
    expect(sheetOutputUrl(['https://x/s.png'])).toBe('https://x/s.png');
    expect(sheetOutputUrl(null)).toBeNull();
  });

  it('prices the build by GPU seconds and keeps the photo first', () => {
    expect(buildCostUsd(60)).toBeCloseTo(0.084);
    expect(buildRequest(['p', 'c1']).input.images).toEqual(['p', 'c1']);
  });
});

describe('sheet', () => {
  it('appends the user note without replacing the turnaround prompt', () => {
    expect(sheetPrompt('')).not.toContain('Additional notes');
    const prompt = sheetPrompt('  teak outdoor bench ');
    expect(prompt).toContain('3x3 turnaround sheet');
    expect(prompt.endsWith('Additional notes about the object: teak outdoor bench')).toBe(true);
  });

  it('cuts nine inset cells from a square sheet', async () => {
    const sheet = await sharp({
      create: { width: 300, height: 300, channels: 3, background: '#ffffff' },
    })
      .png()
      .toBuffer();
    const cells = await cutCells(new Uint8Array(sheet));
    expect(cells).toHaveLength(VIEWS.length);
    const meta = await sharp(cells[0]).metadata();
    expect([meta.width, meta.height]).toEqual([84, 84]);
  });

  it('watermarks a downscaled preview', async () => {
    const sheet = await sharp({
      create: { width: 2048, height: 2048, channels: 3, background: '#ffffff' },
    })
      .png()
      .toBuffer();
    const preview = await watermark(new Uint8Array(sheet));
    const meta = await sharp(preview).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(1024);
  });
});
