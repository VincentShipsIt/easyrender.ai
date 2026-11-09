// @ts-check
// Plain .mjs so `prisma generate` runs without resolving workspace tsconfig files.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

// Prisma 7 does not load env files, so read DATABASE_URL from the app or repo env files here.
// Schema pushes prefer Neon's direct (unpooled) connection when Vercel provides it.
function databaseUrl() {
  if (process.env.DATABASE_URL_UNPOOLED) return process.env.DATABASE_URL_UNPOOLED;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  for (const file of ['apps/web/.env.local', '.env.local', '.env']) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=')) {
        return trimmed.slice('DATABASE_URL='.length).replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return '';
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: { url: databaseUrl() },
});
