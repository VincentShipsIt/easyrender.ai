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
    // Callback: ${BETTER_AUTH_URL}/api/auth/callback/google. Set GOOGLE_CLIENT_ID and
    // GOOGLE_CLIENT_SECRET in Vercel; without them Google sign in is simply not registered.
    socialProviders:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              prompt: 'select_account',
            },
          }
        : {},
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
