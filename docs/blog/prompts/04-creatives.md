# Stage 4 · Creatives

Prompt template. Pipeline: [`../PIPELINE.md`](../PIPELINE.md).

---

You are adding the creatives to the guide `{slug}`. Read the creatives plan in
`docs/blog/briefs/{group}.md`, the tone guide section 5c, `claims.md`, the content README and
`apps/web/lib/blog/images.ts`.

## The hero illustration (mandatory)

- Juanito generates it in Higgsfield from the prompt in the brief and saves it as
  `apps/web/public/blog/illustrations/{group}/hero.webp`.
- Prompt rules: editorial flat illustration, soft muted palette, clean line work, no
  photorealism, no text, no logos or brands, no rulers, measurements or scale marks, nothing that
  looks like an easyrender result or a photo of the team. It illustrates the concept of the
  guide's first paragraph; it does not have to show furniture.
- At least 1200 pixels wide, so it can be the BlogPosting and Open Graph image. Read the real
  size with `sips -g pixelWidth -g pixelHeight` and register it in `BLOG_IMAGES`.
- In the post, directly under the first paragraph:
  `![Concrete description of what is drawn](/blog/illustrations/{group}/hero.webp "Illustration, not an easyrender result: …")`.

## Explanatory creatives

Each one explains something the text needs; decoration does not count.

- **Diagrams:** a component in `components/blog/diagrams/`, drawn on the site's tokens, greyscale,
  registered in `DIAGRAMS` and `BLOG_DIAGRAMS`, with words in `en` (translations add their own).
- **Crops** of real assets under `public/blog/figures/{group}/`, with a caption that says what
  they are cropped from. Never re-coloured or reshaped.
- **3D models:** only real easyrender GLBs from `public/showcase`, with a poster captured from the
  model itself, registered in `BLOG_MODELS`.
- **Screenshots and video:** real, unretouched. If one is missing, leave
  `<!-- IMAGE PENDING: … -->` and list it for the team; never an AI stand-in.
- **Tables and checklists** only where they help a reader decide or check something.
- Other AI illustrations, beyond the hero, only when a drawing explains texture or a scene better
  than a diagram, captioned as an illustration, under `public/blog/illustrations/{group}/`.

## Rules

- No path in two guides, and none twice in one guide.
- Alt text describes what is shown. Captions say what it is (real output, crop, drawing,
  illustration) and what to look at.
- At least one creative per 400 words of prose and never fewer than five, counting the hero.
- Nothing claims.md forbids, in pictures, captions, tables or diagrams.

## Done when

`cd apps/web && bunx vitest run lib/blog` passes, and every diagram has been looked at at 375 px
and on desktop, in light and dark.
