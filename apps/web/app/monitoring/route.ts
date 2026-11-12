// Browser Sentry events go through this route (`tunnelRoute` in next.config.ts) instead of straight
// to sentry.io, so content blockers and network filters cannot drop them. It forwards only the
// envelope, not cookies, and only for our own DSN.
export { POST } from '@sentry/nextjs/tunnel';
