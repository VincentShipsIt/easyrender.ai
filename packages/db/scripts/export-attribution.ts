import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { db } from '../src';

// Explicit columns only: never select emails, names, photos, tokens or IP hashes.
const output = resolve(process.argv[2] || 'attribution-export');
const teamIds = new Set((process.argv[3] || '').split(',').filter(Boolean));
const attribution = {
  utm_source: true,
  utm_medium: true,
  utm_campaign: true,
  utm_content: true,
  utm_term: true,
  referrer: true,
  landing_path: true,
  geo_country: true,
  consent_region_at_create: true,
} as const;
const attributionColumns = Object.keys(attribution);
const columns = {
  previews: ['preview_id', 'created_at', 'status', 'user_id', ...attributionColumns],
  users: [
    'user_id',
    'created_at',
    'method',
    'had_preview_before',
    ...attributionColumns,
    'is_test',
  ],
  purchases: [
    'order_id',
    'user_id',
    'created_at',
    'pack_id',
    'credits',
    'amount',
    'currency',
    'refunded',
  ],
  renders: ['model_id', 'user_id', 'preview_id', 'created_at', 'status', 'credits_spent'],
};
const pick = (row: Record<string, unknown>) =>
  Object.fromEntries(attributionColumns.map((key) => [key, row[key]]));
const csv = (value: unknown) =>
  `"${String(value instanceof Date ? value.toISOString() : (value ?? '')).replaceAll('"', '""')}"`;
try {
  const result = await db().$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
      const previews = await tx.render.findMany({
        select: {
          id: true,
          createdAt: true,
          userId: true,
          status: true,
          sheetKey: true,
          ...attribution,
        },
        orderBy: { createdAt: 'asc' },
      });
      const users = await tx.user.findMany({
        select: {
          id: true,
          createdAt: true,
          accounts: { select: { providerId: true } },
          ...attribution,
        },
        orderBy: { createdAt: 'asc' },
      });
      const purchases = await tx.purchase.findMany({
        where: { status: { in: ['paid', 'refunded'] } },
        select: {
          id: true,
          userId: true,
          createdAt: true,
          packId: true,
          credits: true,
          amountCents: true,
          status: true,
        },
        orderBy: { createdAt: 'asc' },
      });
      const spends = await tx.creditLedger.findMany({
        where: { reason: 'render', delta: { lt: 0 } },
        select: { userId: true, renderId: true, createdAt: true, delta: true },
      });
      return {
        previews: previews
          .filter(
            (row) =>
              row.sheetKey ||
              (row.status === 'failed' && !spends.some((spend) => spend.renderId === row.id)),
          )
          .map((row) => ({
            preview_id: row.id,
            created_at: row.createdAt,
            status: row.sheetKey ? 'ready' : 'failed',
            user_id: row.userId,
            ...pick(row),
          })),
        users: users.map((row) => ({
          user_id: row.id,
          created_at: row.createdAt,
          method: row.accounts.some((a) => a.providerId === 'google')
            ? 'google'
            : row.accounts.some((a) => a.providerId === 'credential')
              ? 'email'
              : 'otro',
          had_preview_before: previews.some(
            (p) => p.userId === row.id && p.createdAt < row.createdAt,
          ),
          ...pick(row),
          is_test: teamIds.has(row.id),
        })),
        purchases: purchases.map((row) => ({
          order_id: row.id,
          user_id: row.userId,
          created_at: row.createdAt,
          pack_id: row.packId,
          credits: row.credits,
          amount: row.amountCents / 100,
          currency: 'USD',
          refunded: row.status === 'refunded',
        })),
        renders: spends.map((row) => ({
          model_id: row.renderId,
          user_id: row.userId,
          preview_id: row.renderId,
          created_at: row.createdAt,
          status: previews.find((p) => p.id === row.renderId)?.status,
          credits_spent: -row.delta,
        })),
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
  await mkdir(output, { recursive: true });
  for (const key of ['previews', 'users', 'purchases', 'renders'] as const) {
    const rows = result[key] as Record<string, unknown>[];
    await writeFile(
      resolve(output, `${key}.csv`),
      `${columns[key].join(',')}\n${rows.map((row) => columns[key].map((column) => csv(row[column])).join(',')).join('\n')}\n`,
    );
  }
} finally {
  await db().$disconnect();
}
