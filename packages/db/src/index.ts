import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

export * from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  // pg already treats sslmode=require as verify-full; saying so explicitly silences its deprecation warning.
  const connectionString = url.replace(
    /sslmode=(prefer|require|verify-ca)\b/,
    'sslmode=verify-full',
  );
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ['error'],
  });
}

// Lazy, so importing the package during `next build` does not need a database.
export function db(): PrismaClient {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}
