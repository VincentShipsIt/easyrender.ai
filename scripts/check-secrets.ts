// Blocks credentials before they reach a public-or-shared git history.
// Usage: bun scripts/check-secrets.ts            scan every tracked file (CI)
//        bun scripts/check-secrets.ts --staged   scan staged files (pre-commit)
// Real env files are rejected by name; only .env.example may be tracked.
import { readFileSync } from 'node:fs';

const staged = process.argv.includes('--staged');
const git = (args: string[]) =>
  Bun.spawnSync(['git', ...args])
    .stdout.toString()
    .split('\n')
    .filter(Boolean);

const files = staged
  ? git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
  : git(['ls-files']);

const PATTERNS: Array<[string, RegExp]> = [
  ['Stripe secret or restricted key', /\b[sr]k_live_[A-Za-z0-9]{16,}/],
  ['Stripe webhook secret', /\bwhsec_[A-Za-z0-9]{16,}/],
  ['Replicate API token', /\br8_[A-Za-z0-9]{30,}/],
  ['AWS access key id', /\bAKIA[0-9A-Z]{16}\b/],
  ['Private key block', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['easyrender API key', /\ber_[A-Za-z0-9]{24,}/],
  ['GitHub token', /\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{30,}/],
  [
    'Database URL with password',
    /postgres(?:ql)?:\/\/[^:\s/]+:(?!password|change|\*+|<)[^@\s]{6,}@(?!localhost|127\.0\.0\.1)/,
  ],
];

const SKIP = /(^|\/)(bun\.lock|node_modules\/|check-secrets\.ts$)/;
const isRealEnvFile = (path: string) => {
  const name = path.split('/').pop() ?? '';
  return name.startsWith('.env') && !name.endsWith('.example');
};

const problems: string[] = [];
for (const file of files) {
  if (isRealEnvFile(file)) {
    problems.push(`${file}: real env files are never committed (only .env.example)`);
    continue;
  }
  if (SKIP.test(file)) continue;
  let text: string;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (text.includes('\0')) continue;
  for (const [label, pattern] of PATTERNS) {
    if (pattern.test(text)) problems.push(`${file}: looks like a ${label}`);
  }
}

if (problems.length > 0) {
  console.error(
    `${problems.join('\n')}\n\nRemove the value, rotate it if it was ever pushed, and keep it in Vercel.`,
  );
  process.exit(1);
}
console.log(`secrets: ok (${files.length} files)`);
