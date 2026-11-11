import latest from '@/content/evals/latest.json';

// What the eval suite has measured. The suite itself runs outside this app and publishes one
// results file; the page reads that file and nothing else, so a number on /evals always comes
// from a run and never from copy. The bundled file starts empty: until the first run is
// published the page says so instead of showing a figure.

// What a run scores. `checks` are decided by code (a guardrail or a file check); `review` ones
// are judged by a person against the photo.
export const EVAL_CRITERIA = [
  { id: 'shape', method: 'review' },
  { id: 'views', method: 'checks' },
  { id: 'material', method: 'review' },
  { id: 'finish', method: 'review' },
  { id: 'file', method: 'checks' },
] as const;

export type EvalCriterionId = (typeof EVAL_CRITERIA)[number]['id'];

export type EvalScore = { passed: number; total: number };

export type EvalRun = {
  id: string;
  /** ISO date of the run, YYYY-MM-DD. */
  date: string;
  /** Photos in the golden set for this run. */
  photos: number;
  /** The models the run exercised, as the app names them. */
  sheetModel: string;
  buildModel: string;
  criteria: Record<EvalCriterionId, EvalScore>;
  /** Public report of the run, when there is one. */
  reportUrl?: string;
};

export type EvalResults = { runs: EvalRun[] };

/** Every run, newest first. */
export function listRuns(results: EvalResults = latest as EvalResults): EvalRun[] {
  return [...results.runs].sort((a, b) => b.date.localeCompare(a.date));
}

/** A fraction in 0..1; an empty score is 0, never NaN. */
export const passRate = ({ passed, total }: EvalScore): number => (total > 0 ? passed / total : 0);

/** The pass rate of a whole run: every criterion on every photo, counted together. */
export function runPassRate(run: EvalRun): number {
  const scores = EVAL_CRITERIA.map(({ id }) => run.criteria[id]);
  return passRate({
    passed: scores.reduce((sum, score) => sum + score.passed, 0),
    total: scores.reduce((sum, score) => sum + score.total, 0),
  });
}

/** The page is only offered to crawlers once there is a run to show. */
export const hasPublishedRuns = (results: EvalResults = latest as EvalResults): boolean =>
  results.runs.length > 0;

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isScore = (value: unknown): value is EvalScore =>
  typeof value === 'object' &&
  value !== null &&
  isCount((value as EvalScore).passed) &&
  isCount((value as EvalScore).total) &&
  (value as EvalScore).passed <= (value as EvalScore).total;

/**
 * Checks a results file from the eval suite before it is bundled. Returns the problems found, so
 * a malformed file is refused whole instead of printing a wrong figure on the page.
 */
export function evalResultsProblems(input: unknown): string[] {
  const root = input as { runs?: unknown };
  if (typeof input !== 'object' || input === null || !Array.isArray(root.runs)) {
    return ['the file must be an object with a "runs" array'];
  }
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const [index, value] of root.runs.entries()) {
    const run = value as Partial<EvalRun> | null;
    const at = `runs[${index}]`;
    if (typeof run !== 'object' || run === null) {
      problems.push(`${at}: not an object`);
      continue;
    }
    if (typeof run.id !== 'string' || run.id === '') problems.push(`${at}: id is missing`);
    else if (seen.has(run.id)) problems.push(`${at}: duplicate id ${run.id}`);
    else seen.add(run.id);
    if (typeof run.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(run.date)) {
      problems.push(`${at}: date must be YYYY-MM-DD`);
    }
    if (!isCount(run.photos)) problems.push(`${at}: photos must be a whole number`);
    for (const key of ['sheetModel', 'buildModel'] as const) {
      if (typeof run[key] !== 'string' || run[key] === '')
        problems.push(`${at}: ${key} is missing`);
    }
    for (const { id } of EVAL_CRITERIA) {
      if (!isScore(run.criteria?.[id]))
        problems.push(`${at}: criteria.${id} needs passed <= total`);
    }
    if (run.reportUrl !== undefined && !/^https:\/\//.test(run.reportUrl)) {
      problems.push(`${at}: reportUrl must be an https URL`);
    }
  }
  return problems;
}
