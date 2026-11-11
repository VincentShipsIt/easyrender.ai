# Brief: sell-vintage-furniture-online

- Guide: [`apps/web/content/blog/en/sell-vintage-furniture-online.md`](../../../apps/web/content/blog/en/sell-vintage-furniture-online.md)
- Group / slug: `sell-vintage-furniture-online`
- Publish date: 2026-11-14
- Target keyword: `sell vintage furniture online`, 20 / KD 24, TP 900 (`contenido/materiales/canales/04-seo/keyword-map-200.csv`, KW-892; `KEYWORD-MAP.md` line for "Vender muebles vintage online"). Parent `how to sell antique furniture`: 250, KD not measured (`contenido/AHREFS-W1.md`).
- Retrospective brief, written on 2026-11-11 from the published guide. The guide predated the pipeline.

## Intent and goals

Intent: do and sell (`AHREFS-W1.md`: commercial + transactional; the SERP is consignment and sell-to-us pages). The reader owns one-off vintage pieces and wants to list, price, photograph, describe and ship them.

Goals, as the guide measures them ("How do you know a listing is working?"):

1. Find which platform and kind of piece sell for you: a log per piece (platform, date listed, asking price, sold listings priced from, messages, most-asked question, sale price, days to sell); read it after ten pieces.
2. A listing that answers buyers: a question answered twice goes into the description; three buyers asking the same thing means a missing photo.
3. A realistic price: a run of offers far below asking means the price came from asking prices; reprice from sold listings.
4. No disputes on arrival: every flaw photographed and numbered (measured through the error table, row 3).

## Methods

1. Platform by piece: signed mid-century chair → Chairish or 1stDibs; 1970s pine chest → Facebook Marketplace, collection only; small brass lamps → Etsy or eBay; large used sofa in a city → AptDeco. Deciding factors: value, who handles delivery, whether buyers search for the maker.
2. Pricing, six steps: identify maker and model; eBay Advanced Search with Completed listings; keep matching model and condition, ignore unsold; treat best-offer sales as a ceiling; adjust for condition (original handles and veneer up, replaced top or repaint down); subtract fees and delivery.
3. Maker and age: check under drawers, beneath seats, back panels, under tops; look for stamps and label outlines; construction clues (hand-cut vs machine dovetails, solid boards vs thin board) as clues, not proof; write "unmarked, in the style of …" when unsure.
4. Photos: daylight, plain wall, camera at the piece's middle height; front, three-quarter, side, back, inside every drawer and cupboard; every flaw close up in raking light with a pencil tip pointing at it; fixed, numbered order so the text can cite "photo 7".
5. Listing: title as maker, material, style, object, era ("Ercol elm Windsor dining chair, 1960s"); description in a fixed seven-part order (maker and evidence; decade and country; materials; width, depth, height by tape plus seat height or inside depth; condition flaw by flaw with photo numbers; what is original or replaced; collection or delivery and town).
6. Shipping, six steps: quote first with the measured size; remove legs, glass, loose handles; bag, label and tape screws inside a drawer; wrap in moving blankets and tape the blankets, never the finish; tape drawers and doors through the blankets; photograph before wrapping and before it leaves.
7. Antiques: more than 100 years; keep receipts, auction records and family history; get an appraisal for valuable pieces; favour dealers and curated sites.
8. A 3D model for shape: send a link when someone asks for more angles, next to the flaw close-ups and tape measurements.

## Errors

The guide has 6 entries (symptom → cause → fix):

1. No messages after two weeks → title lacks maker, material or object → rewrite as maker, material, style, object, era.
2. Only very low offers → price from asking prices → reprice from completed listings of the same model and condition.
3. Buyer disputes condition on arrival → flaw never photographed → photograph every flaw, name each with its photo number.
4. Damage in transit → legs left on, tape on the finish, no blankets → legs off, blankets, photograph before it leaves.
5. Every message asks if the colour is real → mixed light or a warm filter → reshoot in daylight only, room lights off.
6. Buyer cancels after measuring their room → no dimensions, or catalogue ones → measure with a tape, including seat height and inside depth.

## First-hand data

| Asset or statement in the guide                                | Source file                                                                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bedside table photo, "photographed once from the front"        | `/showcase/bedside-table.jpg` (720×720, `apps/web/lib/blog/images.ts`)                                                                                                    |
| Bedside table model built from it                              | `/showcase/bedside-table.glb` (1,287,432 bytes, 69,910 triangles, read 2026-11-11), poster `/blog/models/bedside-table.webp` (960×960); the guide quotes no number for it |
| Each finished model in the public gallery has a shareable page | `contenido/materiales/decisiones/claims.md` ("Share the model's page with a link", only while in the public gallery)                                                      |

The guide quotes no repo numbers: no file sizes, triangle counts or harness limits.

## Sources

Links as published in the guide; not re-read on 2026-11-11.

| URL                                                                  | Fact it supports                                                                                                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| https://www.chairish.com/pages/consign-with-us                       | Chairish: vintage and designer furniture marketplace with a consignment service and a trade program for designers.                                                                         |
| https://www.1stdibs.com/about/                                       | 1stDibs: high-end design and antiques from sellers its experts vet.                                                                                                                        |
| https://www.aptdeco.com/                                             | AptDeco: used furniture marketplace that arranges pickup and delivery.                                                                                                                     |
| https://www.etsy.com/legal/policy/vintage-items-on-etsy/242665563649 | Etsy lists items at least 20 years old as vintage. (`INFORME-SEO-POSTS-W1-2026-11-10.md`: the page returned 403 and was checked through a search engine.)                                  |
| https://about.fb.com/news/2016/10/introducing-marketplace/           | Facebook Marketplace: local buyers, pickup and payment agreed between buyer and seller.                                                                                                    |
| https://www.ebay.com/help/selling/selling/pricing-items?id=4133      | eBay Advanced Search, Completed listings.                                                                                                                                                  |
| https://hts.usitc.gov/                                               | Antique usually means more than 100 years, the line the US tariff schedule uses for duty-free antiques under heading 9706 (FAQ). The link is the HTS search home page, not the 9706 entry. |

Unlinked outside facts: "eBay: wide reach, plus a record of what buyers actually paid"; the body sentence "An antique is usually more than 100 years old, which is also the line US customs uses" (sourced only in the FAQ).

## SERP gaps

From `contenido/AHREFS-W1.md` (10-nov-2026, US): Chairish consignment page, AptDeco home, furnishmevintage.com sell-to-us, Chairish home; position 4 missing; no AI Overview. The report calls it a transactional SERP and suggests platforms first, then photos, listing copy, shipping, then an optional 3D section, with an H2 for the antique parent topic.

Gaps the guide itself targets (SERP content not re-read for this retrospective brief): a neutral platform-by-piece table across marketplaces rather than one marketplace's pitch; a sold-listings pricing method with the best-offer caveat; flaw photography with numbered photos cited in the text; a fixed listing order; courier prep steps; a per-piece log to measure results.

## Creatives

| Creative                                          | Path                                                                                                                        | What it teaches                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero (Style A2), 1280×720 WebP (read with `sips`) | `apps/web/public/blog/illustrations/sell-vintage-furniture-online/hero.webp`                                                | A one-off piece moving from real material to model. Alt: "Illustration of a teak mid-century sideboard with sliding doors and tapered legs, its left side in real wood fading into matte grey clay with a white wireframe mesh on the right, on a dark background". Caption: "Illustration, not an easyrender result: a sideboard drawn as teak on one side and as a clay-and-wireframe mesh on the other."                                                                                    |
| Table                                             | Platform by piece (4 rows)                                                                                                  | Where to list first and why.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Diagram                                           | `diagram:vintage-shot-list` (`components/blog/diagrams/vintage.tsx`)                                                        | The eight shots in order, flaw close-up highlighted.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Diagram                                           | `diagram:listing-title` (`vintage.tsx`)                                                                                     | A searchable title split into maker, material, style, object, era vs "Lovely old chair".                                                                                                                                                                                                                                                                                                                                                                                                       |
| Illustration                                      | `apps/web/public/blog/illustrations/sell-vintage-furniture-online/courier-prep.webp` (1500×1008, registered in `images.ts`) | Courier prep: blankets, legs off and wrapped, screws bagged and labelled in a drawer. Alt: "Illustration of a wooden chest of drawers being packed for a courier: wrapped in moving blankets, legs removed and wrapped, and a labelled bag of screws in the top drawer". Caption: "An illustration, not a photo or an easyrender result: blankets on, legs off, screws bagged and labelled inside a drawer." It is in the earlier flat editorial style (light cream background), not Style A2. |
| Real photo + GLB viewer, side by side             | `/showcase/bedside-table.jpg` and `/showcase/bedside-table.glb`                                                             | A model shows shape and sides the front photo could not; close-ups stay the evidence of condition.                                                                                                                                                                                                                                                                                                                                                                                             |
| Table                                             | Errors (6 rows)                                                                                                             | Symptom → cause → fix.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Pending (not rendered)                            | `<!-- IMAGE PENDING -->`: a real flaw close-up shot by the team                                                             | Listed for the team.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Hero prompt (Style A2). The prompt actually used is not recorded: `INFORME-HEROES-A2-2026-11-11.md` lists only the source file and the object ("teak sideboard") and notes it "fades gradually from teak to clay instead of cutting cleanly"; the prompt in `~/easyrender/blog-style-A/MAPPING.md` is for the earlier monochrome Style A version. This prompt is written to match the published image:

> Dark technical 3D render, 16:9, 1280×720. One object: a long, low mid-century teak sideboard with three sliding doors, slim vertical bar handles and splayed tapered legs, three-quarter view. The left end and first door are in real teak with visible grain; across the middle door the wood fades into matte grey clay, and the right end is clay covered by a fine white wireframe mesh of square quads. White rim light along the top edge and legs, charcoal-to-black radial gradient background, dark glossy floor with a soft contact shadow. The only accent colour is the warm reddish brown of the teak. No text, no UI, no numbers, no logos or brands, no rulers, measurements or scale marks, no people, no room set, no armchair. Save as WebP, 1280×720.

## Outline and FAQ

H2s as published:

1. Where can you sell vintage furniture online? Six platforms and a piece-by-piece table.
2. How do you price a vintage piece? Six-step sold-listings method; condition over age; maker names in search.
3. How do you find the maker and the age? Where marks are, construction clues, "unmarked" wording.
4. How do you photograph vintage furniture? Full set, flaws in raking light, numbered photos.
5. What should the listing say? Searchable title, seven-part description, plain condition wording.
6. How do you ship vintage furniture? Collection vs delivery, six courier-prep steps.
7. How to sell antique furniture: what changes? 100-year line, provenance, appraisal, curated sites.
8. Can a 3D model help sell a one-off piece? Model for shape, close-ups for condition, share by link.
9. How do you know a listing is working? Per-piece log, messages as a to-do list, offers as a price signal.
10. What goes wrong, and how do you fix it? 6-row table.

FAQ (verbatim):

- What is the best site to sell vintage furniture?
- How old does furniture have to be to count as vintage or antique?
- How do you price vintage furniture to sell online?
- Do you need professional photos to sell vintage furniture?
- Should you include measurements in the listing?

## Depth gate

Retrospective: this guide predated the pipeline; verdict against the current 03-depth-gate rubric based on the published text, without rewriting the post.

```
Verdict: GAPS
Date and session: 2026-11-11, retrospective brief session
1 Methods ✓ Numbered pricing (6), listing (7) and courier (6) steps with concrete decisions (Completed listings, best offer as ceiling, tape blankets not finish).
2 Goals ✓ Per-piece log read after ten pieces; repeated questions and low offers as measurable signals.
3 Errors ✓ Exactly six symptom → cause → fix rows, the minimum.
4 Own point of view ✗ No easyrender numbers from repo files or experiments. The only first-hand passage is "We tried it on a solid wood bedside table, photographed once from the front." with no figure.
5 Sourced data ✗ "An antique is usually more than 100 years old, which is also the line US customs uses" has no link in the body, and the FAQ's link for heading 9706 goes to the HTS home page (https://hts.usitc.gov/), not the entry. "eBay: wide reach, plus a record of what buyers actually paid" is unlinked.
6 No padding ✗ "So use the model for shape and proportion, and the close-ups as the evidence of condition." restates the paragraph before it ("The model answers questions about shape ... Condition is a job for photographs"). The antique section's "The photos and the listing work the same way" paragraph repeats the photo section.
7 Originality ✗ Not checked against live SERP. AHREFS-W1.md lists the top results (marketplace pages) but their content was not read. Candidates: platform-by-piece table; numbered flaw photos cited in the text.
8 Comparisons ✓ Three stated criteria (value, delivery, maker search) and a verdict per piece.
9 Tone ✓ Seller's voice, second person, short paragraphs; content.test.ts passes.
10 Claims ✓ Measurements by tape, never from the model; the share link is tied to the public gallery; no embed promise.
11 Creatives ✓ Hero under the first paragraph; two diagrams, platform table, courier illustration and photo/model pair each teach a step. Note: courier-prep.webp is in the old flat style, not the A2 house style that 04-creatives.md now asks of extra illustrations.
12 Own output ✓ The bedside table model is shown and captioned neutrally; nothing about weaknesses of our models or exports.
Items to fix (not applied):
- 4: add one repo number with its file (for example the bedside table GLB's 69,910 triangles from public/showcase/bedside-table.glb) and what we learned from it.
- 5: link the HTS 9706 entry (or the Customs source) at the body sentence; source or cut the eBay "record of what buyers paid" line.
- 6: merge the two model/close-up paragraphs; trim the antique section's repeat.
- 7: read the top 5 for the keyword and name two points they lack.
- 11 (style): regenerate courier-prep in Style A2, or record why it stays.
```
