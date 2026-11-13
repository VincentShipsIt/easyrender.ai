import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const base = process.env.BLOG_BASE_URL || 'http://127.0.0.1:3100';
const output = process.env.EVIDENCE_DIR || '../../.data/blog-image-evidence';
const guides = [
  'how-to-make-a-3d-model-from-photos',
  '3d-models-for-ecommerce',
  'product-photography-for-ecommerce',
  'sell-vintage-furniture-online',
];

// Run against a local production build: bun run build && bun run start --port 3100.
for (const width of [375, 768, 1024, 1152, 1280, 1440]) {
  for (const guide of guides) {
    test(`${guide} at ${width}px`, async ({ browser }, testInfo) => {
      expect(['127.0.0.1', 'localhost']).toContain(new URL(base).hostname);
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 2,
      });
      await context.route('**/*', (route) =>
        new URL(route.request().url()).origin === base ? route.continue() : route.abort(),
      );
      const page = await context.newPage();
      await page.goto(`${base}/learn/${guide}`);
      const images = page.locator('article [data-wide] figure > img');
      expect(await images.count()).toBeGreaterThan(0);
      const measurements = [];
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        const result = await image.evaluate((img: HTMLImageElement) => {
          const rect = img.getBoundingClientRect();
          const figure = img.parentElement?.getBoundingClientRect();
          // Evaluate the browser's sizes expression using its CSS engine at this viewport.
          const slots: string[] = [];
          let depth = 0;
          let start = 0;
          for (let index = 0; index < img.sizes.length; index += 1) {
            const char = img.sizes[index];
            if (char === '(') depth += 1;
            if (char === ')') depth -= 1;
            if (char === ',' && depth === 0) {
              slots.push(img.sizes.slice(start, index).trim());
              start = index + 1;
            }
          }
          slots.push(img.sizes.slice(start).trim());
          const slot = slots.find((part) => {
            const query = part.match(/^(\(min-width: [^)]+\)) /)?.[1];
            return !query || matchMedia(query).matches;
          });
          const probe = document.createElement('div');
          probe.style.width = slot?.replace(/^\(min-width: [^)]+\) /, '') || '';
          document.body.append(probe);
          const declaredWidth = probe.getBoundingClientRect().width;
          probe.remove();
          return {
            src: new URL(img.currentSrc).searchParams.get('url'),
            nativeWidth: Number(img.getAttribute('width')),
            nativeHeight: Number(img.getAttribute('height')),
            width: rect.width,
            height: rect.height,
            columnWidth: figure?.width || 0,
            centerOffset: figure ? rect.x + rect.width / 2 - figure.x - figure.width / 2 : 0,
            declaredWidth,
            quality: new URL(img.currentSrc).searchParams.get('q'),
            isLoaded: img.naturalWidth > 0,
          };
        });
        measurements.push(result);
        const cap = result.nativeWidth < 1440 ? result.nativeWidth / 2 : result.columnWidth;
        expect(result.width, result.src || '').toBeCloseTo(Math.min(cap, result.columnWidth), 0);
        expect(result.centerOffset).toBeCloseTo(0, 0);
        expect(result.declaredWidth).toBeCloseTo(result.width, 0);
        // Account for the one-pixel border when checking the intrinsic content ratio.
        expect((result.width - 2) / (result.height - 2)).toBeCloseTo(
          result.nativeWidth / result.nativeHeight,
          2,
        );
        expect(result.quality).toBe('85');
        expect(result.isLoaded).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await testInfo.attach('measurements', {
        body: JSON.stringify(measurements, null, 2),
        contentType: 'application/json',
      });
      if (width === 375 || width === 1440) {
        await mkdir(output, { recursive: true });
        for (const colorScheme of ['light', 'dark'] as const) {
          await page.emulateMedia({ colorScheme });
          await page.screenshot({
            path: `${output}/${guide}-${width}-${colorScheme}.png`,
            fullPage: true,
          });
        }
      }
      await context.close();
    });
  }
}
