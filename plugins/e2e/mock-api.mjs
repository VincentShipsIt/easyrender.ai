// A stand-in for easyrender's catalogue API, for the plugin end-to-end checks.
//
// It speaks the same contract as apps/web (`/api/catalog`, `/api/catalog/quote`, the AR page and the
// QR image) and moves each product queued -> drafting -> building -> ready by the clock, so the real
// plugins can be driven without Replicate, storage or a database. It does not generate models.
// The shapes come from packages/core/src/catalog.ts; change both together.

import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import QRCode from 'qrcode';

const KEY = process.env.E2E_API_KEY ?? 'er_e2e_key';
const PUBLIC_URL = (process.env.E2E_PUBLIC_URL ?? 'http://api.test:4010').replace(/\/$/, '');
const PER_MODEL = 64;
const MAX_BATCH = 100;
const STATES = ['queued', 'drafting', 'building', 'ready', 'needs_credits', 'needs_info', 'failed'];

/** `${platform}|${store}` -> Map(externalId -> item) */
const stores = new Map();
/** Every request the plugins made, so the tests can check what was sent. */
const requests = [];

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function fail(res, status, error, code) {
  json(res, status, { error, code });
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        resolve(null);
      }
    });
  });
}

function stateOf(item, now) {
  if (item.state === 'needs_info') return 'needs_info';
  const age = now - item.startedAt;
  if (age < 1500) return 'drafting';
  if (age < 3000) return 'building';
  return 'ready';
}

function view(item, now) {
  const state = stateOf(item, now);
  const isReady = state === 'ready';
  return {
    externalId: item.externalId,
    title: item.title,
    state,
    error: item.error,
    renderId: item.renderId,
    arUrl: isReady ? `${PUBLIC_URL}/ar/${item.renderId}` : null,
    qrUrl: isReady ? `${PUBLIC_URL}/api/renders/${item.renderId}/qr` : null,
    modelUrl: isReady ? `${PUBLIC_URL}/api/renders/${item.renderId}/model` : null,
  };
}

function scopeOf(url) {
  const platform = url.searchParams.get('platform') ?? '';
  const store = (url.searchParams.get('store') ?? '').trim().toLowerCase();
  return { platform, store, key: `${platform}|${store}` };
}

function quote(items) {
  const totalCredits = items * PER_MODEL;
  return { items, creditsPerModel: PER_MODEL, totalCredits, balance: 1_000_000, missingCredits: 0 };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', PUBLIC_URL);
  const path = url.pathname;
  const now = Date.now();

  if (path === '/healthz') return json(res, 200, { ok: true });

  // Test helpers, not part of the real API.
  if (path === '/__requests') return json(res, 200, requests);
  if (path === '/__reset') {
    stores.clear();
    requests.length = 0;
    return json(res, 200, { ok: true });
  }

  // Public pages and images, as on easyrender.ai.
  if (path === '/fixtures/chair.png') {
    res.writeHead(200, { 'content-type': 'image/png' });
    return res.end(readFileSync(new URL('./fixtures/chair.png', import.meta.url)));
  }
  const qr = path.match(/^\/api\/renders\/([A-Za-z0-9_-]+)\/qr$/);
  if (qr) {
    const svg = await QRCode.toString(`${PUBLIC_URL}/ar/${qr[1]}`, { type: 'svg', margin: 1 });
    res.writeHead(200, { 'content-type': 'image/svg+xml', 'access-control-allow-origin': '*' });
    return res.end(svg);
  }
  const ar = path.match(/^\/ar\/([A-Za-z0-9_-]+)$/);
  if (ar) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(
      `<!doctype html><title>AR ${ar[1]}</title><h1>View in your room</h1><p>${ar[1]}</p>`,
    );
  }

  // The API proper: every call needs the owner's key.
  if (path.startsWith('/api/catalog')) {
    if (req.headers.authorization !== `Bearer ${KEY}`) {
      return fail(res, 401, 'Send your easyrender API key', 'unauthorized');
    }

    if (path === '/api/catalog/quote' && req.method === 'GET') {
      const items = Number(url.searchParams.get('items'));
      if (!Number.isInteger(items) || items < 1 || items > 100_000) {
        return fail(res, 400, 'Send items: how many products', 'bad_items');
      }
      requests.push({ method: 'GET', path, items });
      return json(res, 200, { ...quote(items), maxPerRequest: MAX_BATCH });
    }

    if (path === '/api/catalog') {
      const scope = scopeOf(url);
      if (req.method === 'POST') {
        const body = await readBody(req);
        if (!body || typeof body !== 'object')
          return fail(res, 400, 'Send a JSON body', 'bad_body');
        const platform = body.platform;
        const store = String(body.store ?? '')
          .trim()
          .toLowerCase();
        if (!['shopify', 'woocommerce', 'prestashop', 'other'].includes(platform)) {
          return fail(res, 400, 'Unknown platform', 'bad_platform');
        }
        if (!store) return fail(res, 400, 'Send the store domain', 'bad_store');
        if (typeof body.maxCredits !== 'number') {
          return fail(
            res,
            400,
            'Send maxCredits: the total credits the owner approved',
            'bad_body',
          );
        }
        const items = Array.isArray(body.items) ? body.items : [];
        if (items.length < 1 || items.length > MAX_BATCH) {
          return fail(res, 400, `Send 1 to ${MAX_BATCH} items`, 'bad_items');
        }
        for (const item of items) {
          if (
            !item ||
            typeof item.externalId !== 'string' ||
            typeof item.title !== 'string' ||
            typeof item.imageUrl !== 'string'
          ) {
            return fail(res, 400, 'Each item needs externalId, title and imageUrl', 'bad_items');
          }
        }
        const key = `${platform}|${store}`;
        const known = stores.get(key) ?? new Map();
        const todo = items.filter((item) => {
          const current = known.get(item.externalId);
          return !current || stateOf(current, now) === 'needs_info';
        });
        const priced = quote(todo.length);
        requests.push({
          method: 'POST',
          path,
          platform,
          store,
          maxCredits: body.maxCredits,
          items,
        });
        if (priced.totalCredits > body.maxCredits) {
          return fail(
            res,
            409,
            `This run costs ${priced.totalCredits} credits, more than the ${body.maxCredits} you approved`,
            'quote_changed',
          );
        }
        for (const item of todo) {
          // The real API only fetches https photos; anything else needs the owner's attention.
          const isHttps = item.imageUrl.startsWith('https://');
          known.set(item.externalId, {
            externalId: item.externalId,
            title: item.title,
            imageUrl: item.imageUrl,
            renderId: `r_${Buffer.from(`${key}|${item.externalId}`).toString('hex').slice(0, 16)}`,
            startedAt: now,
            state: isHttps ? 'queued' : 'needs_info',
            error: isHttps ? null : 'Send a photo served over https',
          });
        }
        stores.set(key, known);
        return json(res, 202, {
          queued: todo.length,
          skipped: items.length - todo.length,
          quote: priced,
        });
      }

      if (req.method === 'GET') {
        const known = stores.get(scope.key) ?? new Map();
        requests.push({ method: 'GET', path, platform: scope.platform, store: scope.store });
        const items = [...known.values()].map((item) => view(item, now));
        const summary = Object.fromEntries(STATES.map((state) => [state, 0]));
        summary.total = items.length;
        for (const item of items) summary[item.state] += 1;
        return json(res, 200, { items, summary, balance: 1_000_000 });
      }

      if (req.method === 'DELETE') {
        stores.delete(scope.key);
        requests.push({ method: 'DELETE', path, platform: scope.platform, store: scope.store });
        res.writeHead(204);
        return res.end();
      }
    }
  }

  return fail(res, 404, 'Not found', 'not_found');
});

server.listen(4010, '0.0.0.0', () => {
  process.stdout.write(`mock easyrender API on :4010 (public url ${PUBLIC_URL})\n`);
});
