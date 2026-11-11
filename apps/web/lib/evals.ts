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
