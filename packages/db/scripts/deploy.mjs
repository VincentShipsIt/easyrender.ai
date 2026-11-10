// Runs during the Vercel build: syncs the schema to the production database so a fresh Neon database gets its tables.
// Previews and local builds skip it, so they never change the shared database.
// Prisma stops on changes it flags as possible data loss, such as a new unique constraint. Set
// DB_ACCEPT_DATA_LOSS=1 for one production build to apply such a change, then remove it again.
import { execSync } from 'node:child_process';

if (process.env.VERCEL_ENV !== 'production') {
  console.log('db:deploy skipped (not a Vercel production build)');
} else if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
  throw new Error('db:deploy needs DATABASE_URL in the Vercel production environment');
} else {
  const acceptLoss = process.env.DB_ACCEPT_DATA_LOSS === '1';
  execSync(acceptLoss ? 'prisma db push --accept-data-loss' : 'prisma db push', {
    stdio: 'inherit',
  });
}
