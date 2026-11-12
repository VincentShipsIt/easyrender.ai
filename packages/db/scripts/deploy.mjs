// Runs during the Vercel build: syncs the schema to the production database so a fresh Neon database gets its tables.
// Previews and local builds skip it, so they never change the shared database.
//
// Prisma's `db push` stops on any new unique constraint ("possible data loss"), even on an empty
// table. This script reads the SQL Prisma would run: a purely additive change (new tables, columns,
// indexes) cannot lose data, so it is applied. Anything else still stops here for a person to
// review; set DB_ACCEPT_DATA_LOSS=1 for one production build to apply it, then remove it again.
//
// `node scripts/deploy.mjs --check` does the same assessment against any database without
// changing it. CI uses it so a risky schema change fails on the pull request, not at deploy time.
import { execSync } from 'node:child_process';
import { assessChange } from './schema-gate.mjs';

const isCheck = process.argv.includes('--check');

if (!isCheck && process.env.VERCEL_ENV !== 'production') {
  console.log('db:deploy skipped (not a Vercel production build)');
} else if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
  throw new Error('db:deploy needs DATABASE_URL in the Vercel production environment');
} else {
  const sql = execSync(
    'prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script',
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
  );
  const change = assessChange(sql);

  if (change.isEmpty) {
    console.log('db:deploy: the database already matches the schema');
  } else if (change.isAdditive) {
    console.log('db:deploy: the schema change only adds tables, columns or indexes');
  } else {
    console.error('db:deploy: the schema change is not purely additive. Needs review:');
    for (const statement of change.risky) console.error(`  ${statement}`);
  }

  if (isCheck) {
    if (!change.isAdditive) process.exit(1);
  } else {
    const isAccepted = change.isAdditive || process.env.DB_ACCEPT_DATA_LOSS === '1';
    execSync(isAccepted ? 'prisma db push --accept-data-loss' : 'prisma db push', {
      stdio: 'inherit',
    });
  }
}
