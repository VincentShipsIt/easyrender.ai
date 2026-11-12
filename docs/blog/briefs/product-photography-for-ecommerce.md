# Brief: product-photography-for-ecommerce

- Guide: [`apps/web/content/blog/en/product-photography-for-ecommerce.md`](../../../apps/web/content/blog/en/product-photography-for-ecommerce.md)
- Group / slug: `product-photography-for-ecommerce`
- Publish date: 2026-11-12
- Target keyword: `product photography for ecommerce`, 250 / KD 2 (`contenido/materiales/canales/04-seo/keyword-map-200.csv`, KW-108; same in `KEYWORD-MAP.md`). Parent `ecommerce product photography`: 700, KD not measured (`contenido/AHREFS-W1.md`).
- Retrospective brief, written on 2026-11-11 from the published guide. The guide predated the pipeline.

## Intent and goals

Intent: learn and do, with some commercial intent (`AHREFS-W1.md`: informational + commercial). The reader runs a small shop, often furniture, and wants consistent listing photos without a studio.

Goals, as the guide measures them ("How do you know your photos are working?"):

1. Photos read at grid size: open the collection page on a phone; every product recognisable, every main image at the same height.
2. Fewer pre-sale questions: count messages such as "what does the back look like" or "is it really that colour".
3. Fewer look-related returns: watch return reasons "not as described" or "colour different" per product.
4. Better performance after a reshoot: change only the photos for four weeks, then compare views and add-to-cart rate with the four weeks before.
5. Platform compliance: main image passes Amazon and Shopify rules (table in the guide); background eyedropper reads 255, 255, 255.

## Methods

1. Kit: tripod with phone clamp, remote or self-timer, large white foam board, plain backdrop (white wall, paper roll, clean painted floor), a sheet of white printer paper, masking tape to mark tripod and product positions.
2. Lens: 2x or 3x and step back; the 1x lens used close stretches the nearest parts.
3. Phone settings, in order: Photo mode (not Portrait); grid on, align the floor or table line; AE/AF Lock (press and hold on iPhone); exposure down a little for cream or white fabric; fire with timer or remote; full resolution, keep originals.
4. Light: one window with no direct sun, about 45° to the front of the product; white board on the opposite side; ceiling lights off. Move the board, not the product, to control the shadow. Shoot a product's whole series in one go; white paper in the first frame, set white balance on it and copy to the series.
5. Background: plain white or light grey for the main image; expose for the product, then lift only the background with a mask until the eyedropper reads 255, 255, 255; check edges for halos at full size. Styled backgrounds only for context shots.
6. Shot list, same order every product: main (three-quarter), front, side, back, details, context. For three-quarter, rotate the product 30 to 45° from the lens.
7. Export: square JPEG, 2048 px per side, sRGB; file names by product and position (`oak-bench-01-main.jpg`).
8. Furniture: plain wall with clear floor and margin on every side; camera at the middle height of the piece (seat height for a chair); step back at 2x for long pieces rather than switch to 1x; photograph every flaw close up on used pieces.

## Errors

The guide has 9 entries (symptom → cause → fix):

1. White sofa blue on one side, yellow on the other → window light mixed with warm bulbs → room lights off, daylight only.
2. Front legs longer than back → 1x lens close → step back, 2x or 3x.
3. White background looks grey → exposed for the product, background left as shot → lift background until 255, 255, 255.
4. Chair legs blurred, chewed edges → Portrait mode's fake blur → Photo mode.
5. Each photo a different brightness → auto exposure per frame → lock exposure and focus first.
6. Bottle-green velvet a different green → filter or heavy edit → edit for accuracy with the fabric next to the screen.
7. Product small in search results → fills much less than 85% of the frame → crop tighter.
8. Ragged collection grid → mixed aspect ratios → one ratio for every main image.
9. Your reflection in a lacquered cabinet → glossy surface square to the camera → turn the piece a few degrees, or stand in shadow.

## First-hand data

| Number or asset in the guide                                                 | Source file                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| easyrender rejects photos under 400 px on the shortest side, warns below 800 | `packages/harness/src/guardrails.ts` (`LIMITS.minPhotoSide`, `goodPhotoSide`), verified 2026-11-11                                                                                                                               |
| Front and three-quarter crops of the armchair, 388×388 each                  | `apps/web/public/blog/figures/product-photography-for-ecommerce/armchair-front.jpg` and `armchair-three-quarter.jpg`, cells of `/showcase/armchair-angles.jpg` (comment in `apps/web/lib/blog/images.ts`); size read with `sips` |

The 2048 px sRGB JPEG export is the guide's own recommendation, derived from the Amazon and Shopify rules, not a measurement. No other repo numbers in the guide.

## Sources

Links as published in the guide; not re-read on 2026-11-11 unless marked.

| URL                                                                           | Fact it supports                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://sell.amazon.com/blog/product-photos                                   | Amazon: pure white RGB 255, 255, 255 main-image background as a best practice; product fills 85% or more; larger than 1,000 px per side for zoom; JPEG preferred, TIFF, PNG and GIF accepted. (`INFORME-SEO-POSTS-W1-2026-11-10.md`: Seller Central G1881 could not be opened, so this seller guide is cited.)                           |
| https://help.shopify.com/en/manual/products/product-media/product-media-types | Shopify: 2048 × 2048 usually displays best for square images; up to 5000 × 5000 or 25 megapixels; PNG then JPEG; under 20 MB. Opened 2026-11-11: all four confirmed ("For square product images, a size of 2048 x 2048 px usually displays best", "smaller than 20 MB"). The "one aspect ratio for all main images" row was not checked. |
| https://www.w3.org/TR/css-color-4/                                            | CSS treats sRGB as the default colour space.                                                                                                                                                                                                                                                                                             |

## SERP gaps

From `contenido/AHREFS-W1.md` (10-nov-2026, US): top organic returned were polamarketing.com (DR 31), an Adobe business guide and a Reddit r/productphotography thread; positions 1 and 5 missing. The report reads it as classic how-to plus studio advice plus community threads, and judges a practical small-shop setup able to compete.

Gaps the guide itself targeted when the retrospective brief was written (the SERP was re-read on 11-nov-2026; see the section below): an exact phone-settings order (Photo mode, AE/AF lock, exposure down for white); a one-window plan with a bounce board; a side-by-side of Amazon and Shopify rules with one export that satisfies both; furniture-specific camera height and lens distance; a way to measure whether photos work (questions, return reasons, four-week reshoot test).

## Live SERP read (11-nov-2026)

Read on 11-nov-2026 (Europe/Madrid) with WebSearch and official help pages. No Ahrefs units were used. This replaces the note above that the SERP had not been re-read for the retrospective brief.

### What currently surfaces

The query still mixes classic how-tos and platform rules: Shopify's DIY product-photography guide (updated for 2026), Shopify's product media types help, marketplace size/rule round-ups (Photolister; regional studio guides that cite Amazon, Shopify and others), and practical crop/background explainers. Community threads and agency posts remain in the mix, as on 10-nov.

### Facts to refresh or confirm

- Amazon main image (unchanged in the guides opened today): pure white RGB 255,255,255 background, product filling about 85% of the frame, longest side at least 500 px (1,000+ px enables zoom). No props, mannequins, text, logos or watermarks on the main image.
- Shopify: help centre still documents uploads up to 5,000×5,000 px / 25 MP and 20 MB, and recommends a 2,048×2,048 square for display. Featured images should share one aspect ratio. 360 and 3D remain interactive media types, not a replacement for stills.
- Google Merchant Center, checked against Google's own help on 11-nov-2026: from 31 January 2027 the minimum product image is 500×500 px. Google _recommends_ 1,500×1,500 px or larger for listing formats. Do not write 1,500 as a hard minimum. Images must show the product accurately, without promotional text, watermarks or borders, and must be publicly crawlable.
- Some 2026 round-ups also mention AI-imagery provenance (IPTC) on Google. Only repeat that if the official Merchant Center page still says it when the guide is next edited.

### Do not copy from the SERP

Do not invent a single "one export that satisfies Amazon, Shopify and Google" pixel size beyond what the three official pages actually share. Do not treat 1,500×1,500 as Google's minimum.

### Gaps that still hold

A phone-settings order (Photo mode, AE/AF lock, exposure down for white), a one-window plan with a bounce board, a side-by-side of Amazon and Shopify rules with one practical export, furniture-specific camera height and lens distance, and a way to measure whether photos work (questions, return reasons, a four-week reshoot test) are still the guide's edge.

### Sources opened this read

- https://help.shopify.com/en/manual/products/product-media/product-media-types
- https://www.shopify.com/blog/12206313-the-ultimate-diy-guide-to-beautiful-product-photography
- https://www.photolister.com/guides/marketplace-product-photo-requirements
- https://support.google.com/merchants/answer/6324350
- https://support.google.com/merchants/answer/16989427?hl=en
- https://support.google.com/merchants/answer/7052112?hl=en
- https://support.google.com/merchants/answer/18353357?hl=en

## Creatives

| Creative                                          | Path                                                                                                                 | What it teaches                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero (Style A2), 1280×720 WebP (read with `sips`) | `apps/web/public/blog/illustrations/product-photography-for-ecommerce/hero.webp`                                     | One product, real finish vs mesh. Alt: "Illustration of a gooseneck kettle, one half in black enamel with a copper handle and knob, the other half and the spout in matte grey clay with a white wireframe mesh, on a dark background". Caption: "Illustration, not an easyrender result: a kettle drawn half in its real finish, half as a clay-and-wireframe mesh." |
| Diagram                                           | `diagram:lens-distance` (`components/blog/diagrams/photography.tsx`)                                                 | 1x close stretches the front legs; 2x/3x from further back keeps them even.                                                                                                                                                                                                                                                                                           |
| Diagram                                           | `diagram:window-light-setup` (`photography.tsx`)                                                                     | Plan view: window at 45°, board opposite, tripod in front, ceiling light off.                                                                                                                                                                                                                                                                                         |
| Crops, side by side                               | `/blog/figures/product-photography-for-ecommerce/armchair-front.jpg` and `armchair-three-quarter.jpg` (388×388 each) | Straight front hides depth; three-quarter shows front, side and depth. Captioned as cells of an easyrender angle sheet, not photos.                                                                                                                                                                                                                                   |
| Diagram                                           | `diagram:camera-height` (`photography.tsx`)                                                                          | Camera at the middle height keeps proportions; eye height shrinks the front.                                                                                                                                                                                                                                                                                          |
| Table                                             | Amazon vs Shopify rules                                                                                              | What each platform asks for, by rule.                                                                                                                                                                                                                                                                                                                                 |
| Table                                             | Errors (9 rows)                                                                                                      | Symptom → cause → fix.                                                                                                                                                                                                                                                                                                                                                |
| Pending (not rendered)                            | Two `<!-- IMAGE PENDING -->` notes: a real photo of the window setup; a real mixed-light vs daylight pair            | Listed in `NECESITA-CREATIVOS-W1.md` / the SEO report for the team.                                                                                                                                                                                                                                                                                                   |

Hero prompt (Style A2). The prompt actually used is not recorded: `INFORME-HEROES-A2-2026-11-11.md` lists only the source file and the object ("gooseneck kettle"); the prompt in `~/easyrender/blog-style-A/MAPPING.md` is for the earlier monochrome Style A version. This prompt is written to match the published image:

> Dark technical 3D render, 16:9, 1280×720. One object: a gooseneck pour-over kettle, three-quarter view, slightly left of centre. The body's near half is in real glossy black enamel with a copper handle and a copper lid knob; the other half and the long spout are matte grey clay covered by a fine white wireframe mesh of square quads. White rim light tracing the silhouette, charcoal-to-black radial gradient background, dark glossy floor with a soft contact shadow and faint reflection. The only accent colour is the warm copper of the handle and knob. No text, no UI, no numbers, no logos or brands, no rulers, measurements or scale marks, no people, no camera or tripod, no armchair. Save as WebP, 1280×720.

## Outline and FAQ

H2s as published:

1. What equipment do you need for ecommerce product photography? Tripod first, phone at 2x/3x, the cheap kit list.
2. Which camera settings should you use on a phone? Six settings in order, why the lock matters.
3. Product photography lighting: how do you set it up? One window at 45°, board opposite, lights off, white balance per series.
4. Product photography background: white or not? Main image on white, lifting the background, eyedropper and halo checks.
5. Which angles does every product need? Six-shot order, three-quarter main image, 30 to 45° turn.
6. What do Amazon and Shopify ask for? Rules table and one export for both, file naming.
7. Furniture photography: what changes? Wall and floor, camera height, stepping back, flaws.
8. How do you know your photos are working? Grid check, question count, return reasons, four-week test.
9. Can the same photos become a 3D model? Same rules as image-to-3D input; 360 spin vs 3D model.
10. What are the common mistakes? 9-row table.

FAQ (verbatim):

- Can you take ecommerce product photos with a phone?
- What is the best background for product photography?
- What size should ecommerce product photos be?
- How many photos should each product have?
- Should you edit product photos?

## Depth gate

Retrospective: this guide predated the pipeline; verdict against the current 03-depth-gate rubric based on the published text, without rewriting the post.

```
Verdict: GAPS
Date and session: 2026-11-11, retrospective brief session
1 Methods ✓ Numbered phone settings, window and board positions, 30 to 45° turn, 2048 px sRGB export, file naming.
2 Goals ✓ Four measures: grid check on a phone, question count, return reasons, a four-week photos-only before/after test.
3 Errors ✓ Nine symptom → cause → fix rows.
4 Own point of view ✓ Harness photo limits (guardrails.ts) and real angle-sheet crops; a stated export recommendation ("We would export each main image as a square JPEG, 2048 pixels").
5 Sourced data ✓ Amazon, Shopify and W3C linked inline; Shopify figures checked 2026-11-11. The first mention of Amazon's white rule (background section) relies on the link under the table.
6 No padding ✓ Each paragraph carries a setting, a number or a decision.
7 Originality ✗ Not checked against live SERP. AHREFS-W1.md lists the top results but their content was not read. Candidates: phone-settings order; Amazon/Shopify single export.
8 Comparisons ✓ Amazon vs Shopify by rule, with the verdict "One export works for both"; front vs three-quarter with a verdict per use.
9 Tone ✓ Second person, practical, short paragraphs; content.test.ts passes.
10 Claims ✓ No size or scale claim; no embed promise; no own conversion or return figures (the measurement section tells readers to measure their own).
11 Creatives ✓ Hero under the first paragraph; three diagrams and the crop pair each teach a setting. Two real photos are still IMAGE PENDING.
12 Own output ✓ Only harness limits and neutral sheet crops; nothing about weaknesses of our models or exports.
Items to fix (not applied):
- 7: read the top 5 for the keyword and name two points they lack.
- Optional: link Amazon's seller guide at the first mention of the white-background rule; supply the two pending real photos.
```
