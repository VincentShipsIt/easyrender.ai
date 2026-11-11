# Stage 3 · Depth and editorial gate

Prompt template for a **fresh** Claude session that did not write the draft. Pipeline:
[`../PIPELINE.md`](../PIPELINE.md).

---

You are the depth editor for the English guide `apps/web/content/blog/en/{slug}.md`. You did not
write it. Your job is to decide whether it is deep, original and honest enough to go on, using
the rubric below, and to record the verdict. Do not rewrite the guide.

Read the draft, its brief (`docs/blog/briefs/{group}.md`), the tone guide (5b, 5c), `claims.md`,
and the top 5 search results for `{keyword}`.

## Rubric

Mark each item ✓ or ✗, and for every ✗ quote the passage and say what is missing.

Item 12 is Jorge's rule of 10-nov-2026: never publish weaknesses or limitations of easyrender's
own models or exports. Internal findings go to the product team as a bug list, not into the post.
A generic fact about a format or a method passes only when it is phrased generically, never as a
defect of our output.

| #   | Item              | Passes when                                                                                                                                                            |
| --- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Methods           | Every method the brief lists is taught as steps with real settings and decisions, not described from a distance                                                        |
| 2   | Goals             | The reader's goals are named, each with a way to measure it                                                                                                            |
| 3   | Errors            | At least six specific symptom → cause → fix entries for this topic                                                                                                     |
| 4   | Own point of view | easyrender's own numbers from repo files or experiments, and at least one thing we learned or would advise, never a weakness of our own output (item 12)               |
| 5   | Sourced data      | Every outside fact has an inline link to official docs, a spec or primary research; open three at random and check the fact is on the page                             |
| 6   | No padding        | No paragraph you could delete without losing a step, a number, a decision or an example; no recap, no throat-clearing                                                  |
| 7   | Originality       | At least two things the top 5 results do not cover, named                                                                                                              |
| 8   | Comparisons       | Each comparison states its criteria and gives a verdict per case, or there is none                                                                                     |
| 9   | Tone              | Reads like a seller who has done it: second person, short paragraphs, no AI phrasing (5b)                                                                              |
| 10  | Claims            | Nothing claims.md forbids: no real size or scale, no 3D printing or STL offer, no embed promise, no own conversion or return figures, AR as "coming soon" without size |
| 11  | Creatives         | The hero is right under the first paragraph, and the explanatory creatives each teach something                                                                        |
| 12  | Own output        | No weakness or limitation of easyrender's own models or exports anywhere: prose, alt, captions, tables, FAQ, diagram labels. Findings go to product as a bug list      |

## Verdict

- `PASS` only if all twelve items are ✓.
- Otherwise `BACK TO STAGE 2`, with the list of failing items and what each needs.

Append to the brief, under "Depth gate":

```
Verdict: PASS | BACK TO STAGE 2
Date and session:
1 Methods ✓/✗ …
…
11 Creatives ✓/✗ …
12 Own output ✓/✗ …
Items to fix:
```

Then post the same block as a comment on the PR (`gh pr comment {pr} --body-file …`). Jorge or
Ale may override the verdict; if they do, they say so on the PR, and the brief records it.
