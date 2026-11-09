import { createHash, randomBytes } from 'node:crypto';
import { db } from '@easyrender/db';

const hash = (raw: string) => createHash('sha256').update(raw).digest('hex');

// The raw key is shown once; only its hash is stored.
export async function createApiKey(userId: string, name: string) {
  const raw = `er_${randomBytes(24).toString('base64url')}`;
  const key = await db().apiKey.create({
    data: {
      userId,
      name: name.slice(0, 60) || 'API key',
      prefix: raw.slice(0, 10),
      hash: hash(raw),
    },
  });
  return { id: key.id, name: key.name, prefix: key.prefix, createdAt: key.createdAt, key: raw };
}

export function listApiKeys(userId: string) {
  return db().apiKey.findMany({
    where: { userId },
    select: { id: true, name: true, prefix: true, createdAt: true, lastUsedAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeApiKey(userId: string, id: string) {
  await db().apiKey.deleteMany({ where: { id, userId } });
}

export async function verifyApiKey(raw: string | null | undefined): Promise<string | null> {
  if (!raw?.startsWith('er_')) return null;
  const key = await db().apiKey.findUnique({ where: { hash: hash(raw) } });
  if (!key) return null;
  await db().apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return key.userId;
}

export function bearerToken(headers: Headers): string | null {
  const value = headers.get('authorization');
  return value?.toLowerCase().startsWith('bearer ') ? value.slice(7).trim() : null;
}
