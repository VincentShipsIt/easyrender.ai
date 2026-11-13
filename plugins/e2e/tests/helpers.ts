import { mkdirSync } from 'node:fs';
import type { Page } from '@playwright/test';

export const API_KEY = 'er_e2e_key';
export const API = 'http://127.0.0.1:4010';

export type ApiRequest = {
  method: string;
  path: string;
  platform?: string;
  store?: string;
  maxCredits?: number;
  items?: Array<{ externalId: string; title: string; imageUrl: string }> | number;
};

export async function apiRequests(): Promise<ApiRequest[]> {
  const response = await fetch(`${API}/__requests`);
  return (await response.json()) as ApiRequest[];
}

export async function resetApi(): Promise<void> {
  await fetch(`${API}/__reset`);
}

export async function shot(page: Page, name: string): Promise<void> {
  mkdirSync('screenshots', { recursive: true });
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}

/** True when an <img> has loaded and has a size, so a broken image does not pass. */
export async function isImageLoaded(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).evaluate((img) => {
    const image = img as HTMLImageElement;
    return image.complete && image.naturalWidth > 0;
  });
}
