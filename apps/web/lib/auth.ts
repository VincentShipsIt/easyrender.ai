import 'server-only';
import { dash } from '@better-auth/infra';
import { signupAttribution } from '@easyrender/core';
import { normalizeAttribution } from '@easyrender/core/attribution';
import { db } from '@easyrender/db';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { addOAuthServerContext, createAuthMiddleware, getOAuthState } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { privacyRegion } from '@/lib/analytics/privacy-region';

function createAuth() {
  return betterAuth({
    database: prismaAdapter(db(), { provider: 'postgresql' }),
    // Existing Better Auth state cookie carries only its CSRF nonce; attribution stays in DB state.
    account: { storeStateStrategy: 'database' },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-in/social') return;
        const h = ctx.headers ?? new Headers();
        await addOAuthServerContext({
          attribution: normalizeAttribution(
            ctx.body?.additionalData?.attribution,
            ctx.context.baseURL,
            privacyRegion(h),
          ),
          anonId: h.get('cookie')?.match(/(?:^|;\s*)er_anon=([^;]+)/)?.[1] ?? null,
        });
        // Only the normalized server context enters state; never persist raw client extras.
        ctx.body.additionalData = {};
      }),
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user, ctx) => {
            const state = await getOAuthState();
            const h = ctx?.headers ?? new Headers();
            const stored = state?.serverContext;
            const attribution = stored?.attribution
              ? (stored.attribution as ReturnType<typeof normalizeAttribution>)
              : normalizeAttribution(
                  ctx?.body?.attribution,
                  ctx?.context.baseURL ?? 'https://easyrender.ai',
                  privacyRegion(h),
                );
            await signupAttribution({
              userId: user.id,
              attribution,
              anonId:
                typeof stored?.anonId === 'string'
                  ? stored.anonId
                  : (h.get('cookie')?.match(/(?:^|;\s*)er_anon=([^;]+)/)?.[1] ?? null),
              method: ctx?.path?.includes('callback') ? 'google' : 'email',
            });
          },
        },
      },
    },
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
