# Stage 1 · Research brief

Prompt template. Fill the `{placeholders}`, then give it to a Claude session that works in the
blog worktree. Pipeline: [`../PIPELINE.md`](../PIPELINE.md).

---

You are writing the research brief for one easyrender guide. Nothing gets drafted until this brief
is complete. Work in the repo worktree `{worktree}`, branch `{branch}`.

- Guide: `{group}` (English slug `{slug}`), publishing `{date}`
- Target keyword: `{keyword}` ({volume} / KD {kd}, from the keyword map)
- Secondary queries and questions from the keyword pack: {secondary}

## Read first

- `contenido/materiales/decisiones/tono-de-voz.md` (sections 1, 4, 5, 5b, 5c), `claims.md`,
  `DECISIONES.md`, `posicionamiento.md`. If anything clashes, `claims.md` wins.
- `docs/blog/PIPELINE.md` and `apps/web/content/blog/README.md`.
- The guides already published in `apps/web/content/blog/en/`, so you do not repeat them and so
  you know which creatives are already taken (`lib/blog/images.ts`).

## Do

1. **Search intent.** Read the top 10 results for the keyword. Say what the searcher wants
   (learn, compare, do, buy) and the two or three goals they are trying to reach. For each goal,
   say how the reader can measure it (a platform report, a count, a before/after test). No
   invented figures.
2. **Methods.** List every method the guide must teach, as numbered steps with the settings and
   decisions that matter: how many photos, which angles, which light, file sizes, polygon and
   texture budgets, export settings. Add the trade-offs between methods: time, cost, quality, and
   when each one fails.
3. **Typical errors.** At least six, each as symptom → cause → fix, specific to this topic.
4. **easyrender's first-hand data.** Find real numbers in the repo and name the file each one
   comes from: `public/showcase/*` (sizes, triangle counts, texture sizes; read the GLBs), the
   harness limits (`packages/harness/src/guardrails.ts`, `sheet.ts`, `models.ts`), the export
   code (`components/model-view.tsx`). Where an experiment on a copy of our assets would answer a
   question (compression, conversion), run it outside the repo and record the command and the
   result. Say what we learned and what we would do. Never publish weaknesses or limitations of
   easyrender's own models or exports: a finding of that kind goes to the product team as a bug
   list, not into the post.
5. **Outside sources.** Official docs, specs or primary research only. For each fact, give the
   URL, the exact sentence or number, and the date you read it. If a page cannot be opened and
   read, the fact is left out.
6. **SERP gaps.** What the top results skip or get wrong, and how this guide covers it.
7. **Creatives plan.** The hero illustration (concept of the intro, Higgsfield prompt for Juanito:
   flat editorial illustration, muted palette, no text, no logos, no measurements, at least 1200
   pixels wide) and two to five explanatory creatives (diagram, crop, GLB viewer, screenshot,
   table only if it helps a decision). None may already be used in another guide.
8. **Outline.** H2s as the questions a reader would type, with one line each on what it teaches.
   The FAQ: 3 to 5 questions from the SERP and the keyword pack.

## Output

Write `docs/blog/briefs/{group}.md` with these sections, in this order: Intent and goals ·
Methods · Errors · First-hand data · Sources · SERP gaps · Creatives (with the hero prompt) ·
Outline and FAQ · Depth gate (left empty for stage 3).

## Done when

Every section holds something specific and checkable. A line such as "cover the settings" is a
failure; "Photo mode, AE/AF lock, exposure down for white fabric, 2048 px sRGB JPEG export" is not.
