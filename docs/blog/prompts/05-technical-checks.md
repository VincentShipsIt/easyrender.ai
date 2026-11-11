# Stage 5 · Technical checks

Prompt template. Pipeline: [`../PIPELINE.md`](../PIPELINE.md), which lists each automated rule
and the test that holds it.

---

You are checking the guide `{slug}` before it goes to translation and review.

1. `bun install` if needed, then `bun run preflight` at the repo root. It must be green: biome, UI
   guards, typecheck, and every test, including `apps/web/lib/blog/content.test.ts` and
   `guide-rules.test.ts`.
2. `cd apps/web && bunx next build`, then `bunx next start`, and fetch the post with `curl` (no
   JavaScript). Check in the HTML: the title and meta description; the JSON-LD (Organization,
   BlogPosting with the hero as `image`, BreadcrumbList, FAQPage); the `og:image` pointing at the
   hero; every figure with its `figcaption`; the hero not lazy; every FAQ answer present inside
   the accordion.
   A post dated in the future is a 404 by design: to check it, change its date locally, and put
   it back before you commit.
3. In a browser at 375 px and at desktop width, light and dark: the hero, every diagram, the
   accordion opening and closing with the keyboard (Tab, Enter, Space) and with a tap, and the
   page with `prefers-reduced-motion`.
4. Record what you ran and the results on the PR. List every check you could not run as not run.

A failing test is fixed in the guide, not by loosening the test. A test can only change with a
reason written in the PR and in this pipeline.
