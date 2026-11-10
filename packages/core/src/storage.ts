import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { put } from '@vercel/blob';

// Vercel Blob in deployed environments, local disk otherwise. Blob URLs carry a random
// suffix and are only ever handed out by the API routes after an ownership check.
const LOCAL_PREFIX = 'local:';
// Local disk is dev only; the ignore hints stop Next from tracing the whole project into the build.
const localRoot = () =>
  resolve(
    /* turbopackIgnore: true */ process.env.DATA_DIR ??
      join(/* turbopackIgnore: true */ process.cwd(), '.data'),
  );

export async function putFile(
  pathname: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, Buffer.from(bytes), {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    });
    return blob.url;
  }
  // Vercel's filesystem is read-only, so local disk only works off-platform.
  if (process.env.VERCEL) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set: connect a Blob store to this Vercel project',
    );
  }
  const dot = pathname.lastIndexOf('.');
  const suffixed = `${pathname.slice(0, dot)}-${randomBytes(6).toString('hex')}${pathname.slice(dot)}`;
  const target = join(localRoot(), suffixed);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
  return `${LOCAL_PREFIX}${suffixed}`;
}

export async function getFile(key: string): Promise<Uint8Array> {
  if (key.startsWith(LOCAL_PREFIX)) {
    const target = resolve(localRoot(), key.slice(LOCAL_PREFIX.length));
    if (!target.startsWith(localRoot() + sep)) throw new Error('invalid storage key');
    return new Uint8Array(await readFile(/* turbopackIgnore: true */ target));
  }
  const response = await fetch(key);
  if (!response.ok) throw new Error(`storage read failed: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
