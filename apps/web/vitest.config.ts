import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests for the pure parts: the route registry, the sitemaps and the content loader. No
// Next.js runtime, no database, no network.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { environment: 'node', include: ['lib/**/*.test.ts'] },
});
