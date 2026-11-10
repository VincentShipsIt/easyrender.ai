import * as SecureStore from 'expo-secure-store';

const KEY = 'easyrender.session';
let cached: string | null | undefined;

// The Better Auth session cookie, kept in the device keychain. The API is cookie based, so the
// app stores the cookie it is handed at sign-in and sends it back on every request.
export async function getCookie(): Promise<string | null> {
  if (cached !== undefined) return cached;
  cached = await SecureStore.getItemAsync(KEY).catch(() => null);
  return cached;
}

export async function setCookie(value: string | null): Promise<void> {
  cached = value;
  if (value) await SecureStore.setItemAsync(KEY, value);
  else await SecureStore.deleteItemAsync(KEY).catch(() => undefined);
}

// Turns a `set-cookie` header (several cookies may arrive joined by commas) into a `cookie` header.
export function cookieFromSetCookie(header: string | null): string | null {
  if (!header) return null;
  const pairs = [...header.matchAll(/(?:^|,\s*)((?:__Secure-)?better-auth\.[\w.-]+)=([^;,\s]*)/g)]
    .filter((match) => match[2] !== '')
    .map((match) => `${match[1]}=${match[2]}`);
  return pairs.length > 0 ? pairs.join('; ') : null;
}
