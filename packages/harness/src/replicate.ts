// Thin Replicate REST client. Serverless friendly: it starts predictions and reads them back,
// it never waits for one to finish inside a request. The caller polls or receives a webhook.

const API = 'https://api.replicate.com/v1';
const MAX_ATTEMPTS = 5;

export type PredictionStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export type Prediction = {
  id: string;
  status: PredictionStatus;
  error?: string | null;
  output?: unknown;
  metrics?: { predict_time?: number };
};

export type ReplicateClient = ReturnType<typeof createReplicate>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createReplicate(token: string, fetchImpl: typeof fetch = fetch) {
  if (!token) throw new Error('REPLICATE_API_TOKEN is not set');

  // Retries 429 and 5xx: a low-credit account is throttled to a handful of predictions per minute.
  async function api<T>(path: string, init: RequestInit = {}, attempt = 0): Promise<T> {
    const response = await fetchImpl(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...init.headers },
    });
    if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS - 1) {
      const retryAfter = Number(response.headers.get('retry-after')) || 2 ** attempt;
      await sleep(Math.min(retryAfter, 15) * 1000);
      return api<T>(path, init, attempt + 1);
    }
    if (!response.ok) {
      throw new Error(
        `Replicate ${init.method ?? 'GET'} ${path}: ${response.status} ${await response.text()}`,
      );
    }
    return (await response.json()) as T;
  }

  return {
    // Uploads bytes to Replicate's file store and returns a URL that predictions can read.
    async upload(bytes: Uint8Array, filename: string, contentType: string): Promise<string> {
      const form = new FormData();
      form.append('content', new Blob([bytes as BlobPart], { type: contentType }), filename);
      const file = await api<{ urls: { get: string } }>('/files', { method: 'POST', body: form });
      return file.urls.get;
    },

    async start(path: string, body: unknown, webhook?: string): Promise<Prediction> {
      const payload = webhook
        ? { ...(body as object), webhook, webhook_events_filter: ['completed'] }
        : body;
      return api<Prediction>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },

    get: (id: string) => api<Prediction>(`/predictions/${id}`),
    cancel: (id: string) => api<Prediction>(`/predictions/${id}/cancel`, { method: 'POST' }),
  };
}

export const isSettled = (status: PredictionStatus) =>
  status === 'succeeded' || status === 'failed' || status === 'canceled';

// TRELLIS nests its outputs; the GLB is wherever a .glb URL appears.
export function findGlbUrl(output: unknown): string | null {
  if (typeof output === 'string') return /\.glb(\?|$)/i.test(output) ? output : null;
  if (Array.isArray(output)) return output.map(findGlbUrl).find(Boolean) ?? null;
  if (output && typeof output === 'object') {
    return Object.values(output).map(findGlbUrl).find(Boolean) ?? null;
  }
  return null;
}

export async function download(url: string, fetchImpl: typeof fetch = fetch): Promise<Uint8Array> {
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error(`download ${url}: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
