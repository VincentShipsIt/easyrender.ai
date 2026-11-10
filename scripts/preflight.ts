// Runs what CI runs, in order, and stops at the first failure: Biome, UI guards, typecheck, tests.
// Usage: bun run preflight [--keep-going]
const keepGoing = process.argv.includes('--keep-going');

const steps: Array<[string, string[]]> = [
  ['biome', ['bunx', 'biome', 'check', '.']],
  ['ui guards', ['bun', 'scripts/check-ui-guards.ts']],
  ['typecheck', ['bunx', 'turbo', 'run', 'typecheck']],
  ['tests', ['bunx', 'turbo', 'run', 'test']],
];

let failed = 0;
for (const [name, cmd] of steps) {
  console.log(`\n▶ ${name}: ${cmd.join(' ')}`);
  const result = Bun.spawnSync(cmd, { stdio: ['inherit', 'inherit', 'inherit'] });
  if (result.exitCode !== 0) {
    failed += 1;
    console.error(`✖ ${name} failed`);
    if (!keepGoing) process.exit(result.exitCode ?? 1);
  }
}
if (failed > 0) process.exit(1);
console.log('\npreflight: ok');
