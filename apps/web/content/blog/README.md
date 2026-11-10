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
---

Body in markdown. Supported: `##`/`###`/`####` headings, paragraphs, `-` and `1.` lists,
`>` quotes, `---` rules, `**bold**`, `*italic*`, `` `code` `` and `[links](/learn)`.
```

## The fields

| Field         | Required | What it does                                                                                                                                                                                                          |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `group`       | yes      | Ties the translations of one post together. The six files of the same post share it, and that is how hreflang and the language picker find each other. Keep it stable: changing it breaks the link between languages. |
| `title`       | yes      | The `<h1>` and the `<title>` (with ` · easyrender` appended).                                                                                                                                                         |
| `description` | yes      | The meta description, the Open Graph description and the card text.                                                                                                                                                   |
| `date`        | yes      | Publication date, `YYYY-MM-DD` (00:00 UTC) or a full ISO instant.                                                                                                                                                     |
| `updated`     | no       | Shown next to the date and used as `dateModified` and `lastmod`.                                                                                                                                                      |
| `keyword`     | no       | The target query, for the record. Not rendered.                                                                                                                                                                       |

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
