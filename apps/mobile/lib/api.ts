import { API_URL } from './config';
import { cookieFromSetCookie, getCookie, setCookie } from './session';

export type RenderStatus = 'drafting' | 'preview_ready' | 'rendering' | 'ready' | 'failed';

// Mirrors RenderView in @easyrender/core.
export type RenderView = {
  id: string;
  status: RenderStatus;
  prompt: string | null;
  name: string | null;
  error: string | null;
  hasPreview: boolean;
  hasSheet: boolean;
  hasModel: boolean;
  credits: number;
  renderCredits: number;
  sheetCredits: number;
  isPublic: boolean;
  source: string;
  createdAt: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

// better-auth checks the Origin of cookie requests; native fetch sends none, so send the site's own.
const ORIGIN = API_URL.startsWith('http://localhost') ? API_URL : 'https://easyrender.ai';

export async function authHeaders(): Promise<Record<string, string>> {
  const cookie = await getCookie();
  return { origin: ORIGIN, ...(cookie ? { cookie } : {}) };
}

async function call(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    // The cookie is managed by hand; keep the native cookie jar out of it.
    credentials: 'omit',
    headers: { ...(await authHeaders()), ...(init.headers as Record<string, string>) },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      code?: string;
    };
    if (response.status === 401 && (await getCookie())) onUnauthorized?.();
    throw new ApiError(
      body.error ?? body.message ?? 'Something went wrong',
      response.status,
      body.code ?? 'error',
    );
  }
  return response;
}

const json = async <T>(response: Response) => (await response.json()) as T;

export type User = { id: string; email: string; name: string };

async function authenticate(path: string, body: Record<string, string>): Promise<User> {
  const response = await call(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const cookie = cookieFromSetCookie(response.headers.get('set-cookie'));
  if (!cookie) throw new ApiError('Could not start a session', 500, 'no_session');
  await setCookie(cookie);
  const data = await json<{ user: User }>(response);
  return data.user;
}

export const signIn = (email: string, password: string) =>
  authenticate('/api/auth/sign-in/email', { email, password });

export const signUp = (name: string, email: string, password: string) =>
  authenticate('/api/auth/sign-up/email', { name, email, password });

export async function signOut(): Promise<void> {
  await call('/api/auth/sign-out', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  }).catch(() => undefined);
  await setCookie(null);
}

// The current user, or null when there is no live session.
export async function currentUser(): Promise<User | null> {
  if (!(await getCookie())) return null;
  const response = await call('/api/auth/get-session').catch((error) => {
    if (error instanceof ApiError) return null;
    throw error;
  });
  const data = response ? await json<{ user?: User } | null>(response) : null;
  return data?.user ?? null;
}

export async function listLibrary(): Promise<{ renders: RenderView[]; balance: number }> {
  return json(await call('/api/renders', { headers: { 'cache-control': 'no-store' } }));
}

export async function getRender(id: string): Promise<RenderView> {
  return json(await call(`/api/renders/${id}`, { headers: { 'cache-control': 'no-store' } }));
}

export async function uploadPhoto(input: {
  uri: string;
  mimeType: string;
  name?: string;
  prompt?: string;
}): Promise<RenderView> {
  const form = new FormData();
  // React Native's FormData takes a file descriptor in place of a Blob.
  form.append('image', {
    uri: input.uri,
    name: `photo.${input.mimeType === 'image/png' ? 'png' : 'jpg'}`,
    type: input.mimeType,
  } as unknown as Blob);
  if (input.name) form.append('name', input.name);
  if (input.prompt) form.append('prompt', input.prompt);
  return json(await call('/api/renders', { method: 'POST', body: form }));
}

export async function startBuild(id: string): Promise<RenderView> {
  return json(await call(`/api/renders/${id}/render`, { method: 'POST' }));
}

export async function startSheet(id: string): Promise<RenderView> {
  return json(await call(`/api/renders/${id}/sheet`, { method: 'POST' }));
}

export async function setPublic(id: string, isPublic: boolean): Promise<RenderView> {
  return json(
    await call(`/api/renders/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ isPublic }),
    }),
  );
}

export const previewUrl = (id: string) => `${API_URL}/api/renders/${id}/preview`;
export const modelUrl = (id: string) => `${API_URL}/api/renders/${id}/model`;
export const shareUrl = (id: string) => `${API_URL}/r/${id}`;
