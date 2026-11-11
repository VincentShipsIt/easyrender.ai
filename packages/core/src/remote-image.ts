import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { AppError } from './errors';
import { MAX_UPLOAD_BYTES } from './renders';

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 15_000;

// True for loopback, private, link-local and other addresses a server must never be sent to.
export function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped?.[1]) return isPrivateAddress(mapped[1]);
    return (
      lower === '::' ||
      lower === '::1' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      /^fe[89ab]/.test(lower)
    );
  }
  const [a = 0, b = 0] = address.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

async function assertPublicHost(url: URL) {
  if (url.protocol !== 'https:') throw new AppError('Image URL must be https', 400, 'bad_url');
  if (url.port && url.port !== '443')
    throw new AppError('Image URL port not allowed', 400, 'bad_url');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new AppError('Image URL is not public', 400, 'bad_url');
  }
}

// Downloads a product photo from a store's CDN. The URL comes from a caller, so it must be a public
// https host (checked again on every redirect) and the photo must fit our upload limit.
export async function fetchRemoteImage(
  rawUrl: string,
): Promise<{ bytes: Uint8Array; contentType: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new AppError('Image URL is not valid', 400, 'bad_url');
  }
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(url).catch((error) => {
      if (error instanceof AppError) throw error;
      throw new AppError('Could not reach the image host', 400, 'bad_url');
    });
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }).catch(() => {
      throw new AppError('Could not fetch the image', 400, 'bad_url');
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new AppError('Could not fetch the image', 400, 'bad_url');
      url = new URL(location, url);
      continue;
    }
    if (!response.ok)
      throw new AppError(`Could not fetch image: ${response.status}`, 400, 'bad_url');
    const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
    if (Number(response.headers.get('content-length') ?? 0) > MAX_UPLOAD_BYTES) {
      throw new AppError('Photo is larger than 4 MB', 413, 'too_large');
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_UPLOAD_BYTES) {
      throw new AppError('Photo is larger than 4 MB', 413, 'too_large');
    }
    return { bytes, contentType };
  }
  throw new AppError('Too many redirects fetching the image', 400, 'bad_url');
}
