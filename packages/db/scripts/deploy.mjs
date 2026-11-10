// Runs during the Vercel build: syncs the schema to the production database so a fresh Neon database gets its tables.
// Previews and local builds skip it, so they never change the shared database.
import { execSync } from 'node:child_process';

if (process.env.VERCEL_ENV !== 'production') {
  console.log('db:deploy skipped (not a Vercel production build)');
} else if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
  throw new Error('db:deploy needs DATABASE_URL in the Vercel production environment');
} else {
  execSync('prisma db push', { stdio: 'inherit' });
}
