# Guides

One markdown file per post per language: `content/blog/{locale}/{slug}.md`. The file name is the
slug, so the English `glb-vs-usdz.md` is served at `/learn/glb-vs-usdz` and the Spanish one at
`/es/guias/glb-vs-usdz`. Native slugs per language are the point: write the Spanish slug in
Spanish.

```md
---

group: glb-vs-usdz
title: GLB or USDZ: which file do you need?
description: One sentence, under about 155 characters. It is the meta description and the card.
date: 2026-11-23
updated: 2026-11-30
keyword: glb to usdz
cta: One sentence shown above the closing button.
---

Body in markdown. Supported: `##`/`###`/`####` headings, paragraphs, `-` and `1.` lists,
`>` quotes, `---` rules, `**bold**`, `*italic*`, `` `code` `` and `[links](/learn)`.
```

### Inside the body

- **Prices** are never typed. Write `{{renderCredits}}`, `{{renderPrice}}`, `{{creditPrice}}`,
  `{{paygMinCredits}}`, `{{paygMinPrice}}`, `{{proPrice}}` or `{{proCredits}}`; the loader fills them
  from `@easyrender/harness`, the same source as the pricing page.
- **Images**: `![Alt text that describes the picture](/showcase/armchair.jpg "Optional caption")`
  on a line of its own. Only paths listed in `lib/blog/images.ts` render (with `next/image`, their
  real width and height, lazy loading). Only real easyrender output or real screenshots go in
  that list. Any other path shows as text and fails `content.test.ts`.
- **Missing images**: leave `<!-- IMAGE PENDING: what the picture must show -->`. Comments are
  stripped before rendering, structured data and llms-full.txt.
- **FAQ**: a `## FAQ` section with one `### Question?` per item. The same questions become the
  page's FAQPage structured data, so what crawlers read is what readers see.
- **Links between guides**: link freely. A link to a guide whose date has not come yet shows as
  plain text and becomes a link on that guide's day.
- The closing call to action is the button under the post (with the `cta` sentence). The body
  may hold one more link to the home, mid-post, and no closing CTA section of its own.

`lib/blog/content.test.ts` checks every English guide against these rules and the tone guide:
title and description length, the 40-60 word opening answer, paragraph length, the FAQ, the
link to the core guide, prices, images and the claims.

## The fields

| Field         | Required | What it does                                                                                                                                                                                                          |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `group`       | yes      | Ties the translations of one post together. The six files of the same post share it, and that is how hreflang and the language picker find each other. Keep it stable: changing it breaks the link between languages. |
| `title`       | yes      | The `<h1>` and the `<title>` (see title length below).                                                                                                                                                                |
| `description` | yes      | The meta description, the Open Graph description and the card text.                                                                                                                                                   |
| `date`        | yes      | Publication date, `YYYY-MM-DD` (00:00 UTC) or a full ISO instant.                                                                                                                                                     |
| `updated`     | no       | Date of the last real change. Shown next to the date and used as `dateModified` and `lastmod` once it is later than `date`; an edit made before the publication day leaves both at the publication date.              |
| `keyword`     | no       | The target query, for the record. Rendered only as `keywords` in the structured data.                                                                                                                                 |
| `author`      | no       | The byline and the structured-data author. Defaults to `easyrender team`, published as an Organization.                                                                                                               |
| `authorType`  | no       | `organization` (default) or `person`. Use `person` only for a real person who has agreed to sign.                                                                                                                     |
| `authorUrl`   | no       | Site-relative or absolute URL of the author's page.                                                                                                                                                                   |
| `cta`         | no       | The sentence above the closing "Upload a photo" button.                                                                                                                                                               |
| title length  | —        | The `<title>` is the title plus ` · easyrender` when that fits in 60 characters, and the title alone otherwise. Keep the title itself at 60 or fewer.                                                                 |

## Publishing one post a day in six languages

`date` is a schedule, not a label. A post with a date in the future is invisible everywhere: not
in the hub, not in the sitemap, and its own URL answers 404. On its day it appears by itself,
with no deploy, because the pages are server rendered and the sitemaps revalidate every ten
minutes.

So a week of posts, in every language that has them reviewed, can be committed at once with
seven different dates.

## What stops a language from going live

A language only serves pages once it is in `ROUTABLE_LOCALES` in `i18n/config.ts`, which means
`messages/{locale}.json` exists and a native speaker has reviewed it. Until then its content
files are parsed but never served, never linked and never listed, and the other languages'
hreflang blocks do not mention it. Nothing here is ever machine translated.

A malformed file is skipped with a warning in the server log rather than breaking the hub, so
check the log after adding one.
