import 'server-only';
import { dash } from '@better-auth/infra';
import { db } from '@easyrender/db';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

function createAuth() {
  return betterAuth({
    database: prismaAdapter(db(), { provider: 'postgresql' }),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    // Sign-in posts from whichever domain the visitor is on; without this only BETTER_AUTH_URL's
    // origin is accepted and every other one gets 403 INVALID_ORIGIN.
    trustedOrigins: [
      'https://easyrender.ai',
      'https://www.easyrender.ai',
      ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ],
    // dash() reads BETTER_AUTH_API_KEY; it powers the hosted Better Auth dashboard.
    plugins: [dash(), nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;
let instance: Auth | null = null;

// Lazy so `next build` does not need a database connection.
export const auth = (): Auth => {
  instance ??= createAuth();
  return instance;
};
