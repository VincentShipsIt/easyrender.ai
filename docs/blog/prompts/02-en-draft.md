# Stage 2 · English draft with depth

Prompt template. Pipeline: [`../PIPELINE.md`](../PIPELINE.md).

---

You are writing the English guide `{slug}` from its brief, `docs/blog/briefs/{group}.md`. Work in
`{worktree}`, branch `{branch}`. If this is a second round after a failed depth gate, fix only the
items the gate listed, and say how you fixed each one.

## Read first

The brief, the tone guide (sections 5, 5b and 5c in full), `claims.md`, the content README, and
two published guides, to match their structure.

## Write

`apps/web/content/blog/en/{slug}.md`, front matter as in the content README (`group`, `title`
≤ 60 characters, `description` ≤ 155, `date`, `updated`, `keyword`, `cta`).

1. **Answer first.** The first paragraph answers the title in 40 to 60 words. It is the sentence
   search engines and assistants quote, and the hero illustration is drawn from it.
2. **Hero.** Directly under that paragraph: `![alt](/blog/illustrations/{group}/hero.webp "Illustration, not an easyrender result: …")`.
   If the file does not exist yet, leave `<!-- ILLUSTRATION PENDING: … -->` and the tests will
   fail until it does.
3. **Methods.** Numbered steps with the real settings and decisions from the brief. Say when each
   method fails and what it costs in time.
4. **Goals.** What the reader is trying to achieve and how they measure it. Never a conversion,
   return or sales figure of ours (claims.md); outside figures only with their source inline.
5. **Errors.** A symptom → cause → fix section, specific to the topic. A table is right here.
6. **Our point of view.** easyrender's own numbers and what we learned, from the brief, with the
   claims.md limits (size, printing, embedding) respected wherever the product is named. At most
   two or three mentions plus the CTA. Never publish weaknesses or limitations of easyrender's
   own models or exports. Internal findings go to the product team as a bug list, not into the
   post. Generic format or method facts may stay, phrased generically, never as a defect of our
   output.
7. **Comparisons** only where they help the reader decide: state the criteria, then the verdict
   for each case.
8. **FAQ.** `## FAQ` with 3 to 5 `### Question?` items, answers of 40 to 60 words. They render as
   an accordion and become the FAQPage JSON-LD; nothing else to do.
9. **Links.** To the core guide `/learn/how-to-make-a-3d-model`, to related guides, at most one
   link to the home in the text.

Length: 1,800 to 2,500 words for a how-to or a "what is" guide, only if every paragraph carries a
step, a number, a decision or an example. No throat-clearing, no recap paragraph.

## Rules that fail the build

Paragraphs of at most 3 sentences and 60 words. No em dashes, no exclamation marks, none of the
banned phrases (tone guide 5b). No typed prices: use the tokens. No "to scale", "true-to-size",
"will it fit?". A sentence that names easyrender with STL, printing or embedding must rule it out.

## Done when

`cd apps/web && bunx vitest run lib/blog` passes, and you have listed in the brief every outside
fact you used with its URL.
