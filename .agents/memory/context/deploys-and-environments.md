# Deploys and environments

- Vercel Git integration. Production deploys when a PR merges to `main`; previews build per PR.
  Project root is `apps/web`; the build command is `bun run vercel-build`, which syncs the
  schema (production only) and runs `next build`.
- CI (`.github/workflows/ci.yml`) runs Biome, the UI guard, typecheck and tests on every PR. It
  does not deploy.
- Env vars live in Vercel; `.env.example` lists them all and `turbo.json` `build.env` must list
  every one the build reads.
- Storage: S3 bucket behind CloudFront (`infra/aws/storage.yml`), assumed through the Vercel OIDC
  role (`AWS_ROLE_ARN`). Local dev writes to `.data/`.
- Database: Neon Postgres. Use the unpooled URL for schema syncs.
