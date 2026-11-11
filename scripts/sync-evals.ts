// Copies the published eval results into the site.
// Usage: bun scripts/sync-evals.ts            fetch the public results and bundle them
//        bun scripts/sync-evals.ts --file=path   read a local file instead (reviewing a run)
//
// The source is results/latest.json of https://github.com/easyrenderai/evals. The file is checked
// first: a malformed one is refused whole, so the /evals page can never print a wrong figure. Runs
// are manual and reviewed by a person, so this is a manual step too: run it, then open a PR with
// the one file it changes.
import { readFileSync, writeFileSync } from 'node:fs';
import { evalResultsProblems } from '../apps/web/lib/evals.ts';

const SOURCE = 'https://raw.githubusercontent.com/easyrenderai/evals/main/results/latest.json';
const TARGET = new URL('../apps/web/content/evals/latest.json', import.meta.url);

async function read(): Promise<string> {
  const file = process.argv.find((arg) => arg.startsWith('--file='))?.slice('--file='.length);
  if (file) return readFileSync(file, 'utf8');
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`${SOURCE} answered ${response.status}`);
  return response.text();
}

const incoming = JSON.parse(await read()) as unknown;
const problems = evalResultsProblems(incoming);
if (problems.length > 0) {
  console.error(`Refusing the results file:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}

const next = `${JSON.stringify(incoming, null, 2)}\n`;
const current = readFileSync(TARGET, 'utf8');
if (next === current) {
  console.log('apps/web/content/evals/latest.json is already up to date.');
} else {
  writeFileSync(TARGET, next);
  const runs = (incoming as { runs: unknown[] }).runs.length;
  console.log(`Updated apps/web/content/evals/latest.json (${runs} run${runs === 1 ? '' : 's'}).`);
}
