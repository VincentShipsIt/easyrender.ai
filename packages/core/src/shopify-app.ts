import { db } from '@easyrender/db';
import {
  type CatalogInput,
  type CatalogQuote,
  type CatalogScope,
  type CatalogSummary,
  listCatalog,
  MAX_CATALOG_BATCH,
  quoteCatalog,
  submitCatalog,
} from './catalog';
import { config } from './config';
import { AppError } from './errors';
import {
  decryptToken,
  ensureShop,
  listShopProducts,
  type ShopifyProduct,
  signLinkState,
  writeRenderMetafields,
} from './shopify';

// What the embedded Shopify page does, step by step. Every call is for one shop, proven by a
// session token (see ./shopify). The shop's products are read from Shopify each time; the 3D work
// is the shared catalogue queue, with platform "shopify" and the shop's domain as the store.

type Fetch = typeof fetch;

export type ShopifyOverview =
  | { isLinked: false; linkUrl: string }
  | {
      isLinked: true;
      // Products that still need a model and have a photo, what that costs and the owner's balance.
      eligible: number;
      noPhoto: number;
      quote: CatalogQuote | null;
      summary: CatalogSummary;
      balance: number;
    };

// A product is done, or on its way, in these states; failed and needs_info are retried.
const SETTLED = new Set(['ready', 'queued', 'drafting', 'building', 'needs_credits']);

async function open(shop: string, sessionToken: string, fetchImpl: Fetch) {
  const row = await ensureShop(shop, sessionToken, fetchImpl);
  return { row, accessToken: decryptToken(row.accessToken) };
}

async function plan(scope: CatalogScope, products: ShopifyProduct[]) {
  const states = new Map(
    (
      await db().catalogItem.findMany({
        where: scope,
        select: { externalId: true, state: true },
      })
    ).map((item) => [item.externalId, item.state]),
  );
  const items: CatalogInput[] = [];
  let noPhoto = 0;
  for (const product of products) {
    const state = states.get(product.id);
    if (product.renderId || (state && SETTLED.has(state))) continue;
    if (!product.imageUrl) noPhoto += 1;
    else items.push({ externalId: product.id, title: product.title, imageUrl: product.imageUrl });
  }
  return { items, noPhoto };
}

export async function shopifyOverview(
  shop: string,
  sessionToken: string,
  fetchImpl: Fetch = fetch,
): Promise<ShopifyOverview> {
  const { row, accessToken } = await open(shop, sessionToken, fetchImpl);
  if (!row.userId) {
    return {
      isLinked: false,
      linkUrl: `${config.appUrl()}/shopify/connect?${new URLSearchParams({ shop, state: signLinkState(shop) })}`,
    };
  }
  const scope: CatalogScope = { userId: row.userId, platform: 'shopify', store: shop };
  const [products, catalog] = await Promise.all([
    listShopProducts(shop, accessToken, fetchImpl),
    // Reading the catalogue also moves its queue forward.
    listCatalog(scope),
  ]);

  // Finished models go onto their product, where the theme block reads them.
  const byId = new Map(products.map((product) => [product.id, product]));
  const finished = catalog.items.flatMap((item) => {
    const product = byId.get(item.externalId);
    return product && item.renderId && item.state === 'ready' && product.renderId !== item.renderId
      ? [{ gid: product.gid, renderId: item.renderId }]
      : [];
  });
  if (finished.length > 0) await writeRenderMetafields(shop, accessToken, finished, fetchImpl);

  const { items, noPhoto } = await plan(scope, products);
  return {
    isLinked: true,
    eligible: items.length,
    noPhoto,
    quote: items.length > 0 ? await quoteCatalog(row.userId, items.length) : null,
    summary: catalog.summary,
    balance: catalog.balance,
  };
}

// Queues the next batch of products. The page calls it until `remaining` is 0, passing the credits
// the merchant saw on the button; a price that went up since stops the run before anything is queued.
export async function shopifyGenerate(
  shop: string,
  sessionToken: string,
  input: { approvedCredits: number; isFirst: boolean },
  fetchImpl: Fetch = fetch,
): Promise<{ sent: number; remaining: number }> {
  const { row, accessToken } = await open(shop, sessionToken, fetchImpl);
  if (!row.userId) throw new AppError('Connect an easyrender account first', 409, 'not_linked');
  const scope: CatalogScope = { userId: row.userId, platform: 'shopify', store: shop };
  const { items } = await plan(scope, await listShopProducts(shop, accessToken, fetchImpl));
  if (items.length === 0) return { sent: 0, remaining: 0 };

  const quote = await quoteCatalog(row.userId, items.length);
  if (input.isFirst && quote.totalCredits > input.approvedCredits) {
    throw new AppError(
      'The price changed. Reload the page and check it again.',
      409,
      'quote_changed',
    );
  }
  const batch = items.slice(0, MAX_CATALOG_BATCH);
  await submitCatalog(scope, batch, batch.length * quote.creditsPerModel);
  return { sent: batch.length, remaining: items.length - batch.length };
}
