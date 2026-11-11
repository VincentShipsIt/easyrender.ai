# Brief: 3d-models-for-ecommerce

- Guide: [`apps/web/content/blog/en/3d-models-for-ecommerce.md`](../../../apps/web/content/blog/en/3d-models-for-ecommerce.md)
- Group / slug: `3d-models-for-ecommerce`
- Publish date: 2026-11-13
- Target keyword: `3d for ecommerce`, 150 / KD 2 (`contenido/materiales/canales/04-seo/keyword-map-200.csv`, KW-067; same in `KEYWORD-MAP.md`). `contenido/AHREFS-W1.md` re-measured it on 10-nov-2026 at 150 / KD 0. Slug phrase `3d models for ecommerce`: 70 / KD 10 (CSV, KW-069).
- Retrospective brief, written on 2026-11-11 from the published guide. The guide predated the pipeline.

## Intent and goals

Intent: learn and compare, with commercial intent (`AHREFS-W1.md`: informational + commercial). The reader runs a store, often furniture, and wants to know what 3D adds, which files are needed, how to get models and whether it is worth it.

Goals, as the guide measures them ("How do you measure whether 3D is worth it?"):

1. Fewer pre-sale questions about the back and the depth.
2. More add-to-carts on pages with a model: 5 to 10 products with a model vs a matched group without; prices, photos and text unchanged for 4 to 6 weeks; compare add-to-cart per product view.
3. Fewer returns where the reason is the look: read the return reasons for both groups.
4. Engagement on your own site: model-viewer events `camera-change` with source `user-interaction`, `ar-status`, `quick-look-button-tapped`, sent to analytics.
5. Files inside budget: Scene Viewer's triangles, texture, materials and file size.

## Methods

Ranking and rollout, as the guide teaches it:

1. Score each product on four questions: does the back or depth matter, is the price high enough that buyers hesitate, do people ask for more angles, do returns mention the look. Start with the top five (armchair, sideboard, shaped floor lamp); skip flat items (prints, rugs).
2. Test two routes on one product (for example a phone scan vs image-to-3D of a table lamp) and compare on a phone.
3. Step by step for a first batch: pick five; make each by the route that fits; check counts, back and texture at full screen; bring files into budget (textures at 2048 px or less, geometry compressed if the viewer supports it); upload with the platform's own tools; open each page on one iPhone and one Android phone over mobile data and try AR; measure for 4 to 6 weeks.
4. Files: GLB for web and Android, USDZ for Apple AR. Shopify: GLB or USDZ as product media, up to 500 MB, optimised over 15 MB, converted so both exist. WooCommerce: an extension such as Arty 3D Viewer. Own site: model-viewer with `ar-modes="webxr scene-viewer quick-look"`.
5. Budget (Scene Viewer): up to 100,000 triangles, ideally 30,000 to 50,000; texture at most 2048 × 2048; up to 10 materials; 10 MB. For Android AR, PNG or JPEG textures rather than an unlisted extension.

Four routes, each judged on product in hand, own time, truth of hidden sides, where it fails: 3D artist (exact; for a sofa in three widths or one campaign hero), manufacturer CAD (exact shape, needs textures and fewer triangles), scanning (RealityScan: after 20 images, up to 300; fails on glass, mirrors, polished metal), image-to-3D (only route from a supplier photo; check the back). Worked example: walnut sideboard, use the three-quarter supplier shot, check brass handles against the close-up and the back.

## Errors

The guide has 7 entries (symptom → cause → fix):

1. No AR button on Android → Scene Viewer loads over HTTPS only, or the phone does not support it → serve over HTTPS, test a second phone.
2. No AR on iPhone from your own site → no USDZ, or wrong content type → add the USDZ, serve as `model/vnd.usdz+zip`.
3. Piece opens huge or tiny in AR → AR uses the size stored in the file, never measured → dimensions in the text; shoppers can pinch to resize.
4. Piece floats above the floor → model bottom above its origin → move the origin to the base in Blender.
5. Slow page on mobile data → 4096 px textures or uncompressed geometry → textures at 2048 or 1024, Draco or Meshopt where supported.
6. Model dark or dirty in AR → baked shadows → texture without baked shadows; Metallic 0 if unset.
7. GLB fails in Scene Viewer → unlisted glTF extension such as WebP textures → plain version with PNG or JPEG.

## First-hand data

Verified against the repo on 2026-11-11 by reading the GLB headers and JSON chunks.

| Number in the guide                                                                                               | Source file                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Six showcase models: 14,590 to 69,910 triangles                                                                   | `apps/web/public/showcase/{clay-vase,bedside-table}.glb` (index accessor counts / 3)                               |
| One 1024 × 1024 texture and one material each                                                                     | `apps/web/public/showcase/*.glb`; texture size also in `apps/web/lib/blog/images.ts` (clay-vase texture 1024×1024) |
| 308,448 to 1,287,432 bytes                                                                                        | `ls -l apps/web/public/showcase/clay-vase.glb bedside-table.glb`                                                   |
| Swivel chair photo and model; stoneware vase angle sheet                                                          | `/showcase/swivel-chair.jpg`, `/showcase/swivel-chair.glb`, `/showcase/vase-angles.jpg`                            |
| Free preview, library of catalogue photos, `{{renderCredits}}` per model, Pro `{{proCredits}}` for `{{proPrice}}` | `packages/harness/src/pricing.ts` via tokens                                                                       |

The guide states "We do not publish conversion or return figures for 3D, because we have not measured any we can stand behind" (claims.md).

## Sources

Links as published in the guide; not re-read on 2026-11-11 unless marked.

| URL                                                                                         | Fact it supports                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://developer.apple.com/augmented-reality/quick-look/                                   | On iPhone and iPad, a USDZ opens in AR Quick Look and places the object in the room. (`INFORME-SEO-POSTS-W1` notes this page was not opened in that pass.)                                                                                                                                                                                                                                                      |
| https://developers.google.com/ar/develop/scene-viewer                                       | Scene Viewer does the same with a GLB on Android; one unit is one metre; budget (100,000 triangles, ideally 30,000 to 50,000; 2048 × 2048; 10 materials; 10 MB); HTTPS; advises against baked shadows; its extension list. Opened 2026-11-11: all confirmed ("Scale: 1 unit = 1 meter"; supported extensions listed are `KHR_materials_unlit` and `KHR_texture_transform`; WebP, Draco and Meshopt not listed). |
| https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/features/ar.ts | `camera-change` with source `user-interaction`, `ar-status`, `quick-look-button-tapped` events.                                                                                                                                                                                                                                                                                                                 |
| https://help.shopify.com/en/manual/products/product-media/product-media-types               | GLB or USDZ, up to 500 MB, optimised over 15 MB, converted so both exist. Opened 2026-11-11: all confirmed.                                                                                                                                                                                                                                                                                                     |
| https://woocommerce.com/products/arty-3d-viewer/                                            | WooCommerce adds 3D through extensions such as Arty 3D Viewer.                                                                                                                                                                                                                                                                                                                                                  |
| https://modelviewer.dev/                                                                    | model-viewer shows a GLB; `ar-modes` hands each phone its AR viewer.                                                                                                                                                                                                                                                                                                                                            |
| https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide   | RealityScan starts processing after 20 images, takes up to 300.                                                                                                                                                                                                                                                                                                                                                 |
| https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/            | Safari looks for `model/vnd.usdz+zip`.                                                                                                                                                                                                                                                                                                                                                                          |

## SERP gaps

From `contenido/AHREFS-W1.md` (10-nov-2026, query "3d models for ecommerce", US): Modelry (vendor), Sketchfab 3D eCommerce, 3dcloud.com and VNTANA guides; position 3 missing. The report reads it as vendors and guides, and suggests "what it is, files you need, four ways, limits".

Gaps the guide itself targeted when the retrospective brief was written (the SERP was re-read on 11-nov-2026; see the section below): a self-run measurement method with matched product groups and model-viewer events instead of vendor conversion claims; the file budget held against real files; a product-ranking score for which items get 3D first; a real-phone error table (HTTPS, content type, origin, extensions).

## Live SERP read (11-nov-2026)

Read on 11-nov-2026 (Europe/Madrid) with WebSearch and the Shopify case study. No Ahrefs units were used. This replaces the note above that the SERP had not been re-read for the retrospective brief.

### What currently surfaces

The query still looks like vendors and implementation guides: studio explainers on GLB + USDZ deliverables, platform-standards posts (WebGL, USDZ, glTF), tool-vendor blogs (including Tripo on "AI 3D models in ecommerce"), and Shopify's Gunner Kennels case study. File-format and "how to add 3D/AR" pages remain the main organic shape, as on 10-nov.

### Facts to refresh or confirm

- Delivery pattern on the studio guides: GLB for web, Android and most storefronts; USDZ for iPhone/iPad AR Quick Look. Several pages recommend a modest polygon budget (around 100,000 triangles or less), textures at 2,048 px or smaller, and a file of a few megabytes. Treat those as third-party recommendations, not our limits, and keep them next to Google Scene Viewer's published budgets already in the guide.
- Shopify case study, Gunner Kennels (opened 11-nov-2026): Shopify reports a 40% increase in order conversion and a 5% reduction in returns after 3D/AR. This is one merchant's result, not a generic "3D raises conversion by 40%" claim. If the guide cites it, name Gunner Kennels and link the case study; never present it as a typical lift.
- Implementation advice that matches our brief: pilot on high-traffic or high-return SKUs, keep still photos, lazy-load the viewer, A/B test against a photo-only control. We still prefer a self-run measurement (matched product groups and model-viewer events) over vendor conversion claims.

### Do not copy from the SERP

Several studio pages ask for "true scale" or a measured origin. That is banned by claims.md. A model made from a photo has no measured size. Do not repeat "true-to-scale", "in Originalgröße", or "à l'échelle réelle" from those pages. Do not invent a typical conversion or return percentage.

### Gaps that still hold

A self-run measurement method, the file budget held against real files, a product-ranking score for which items get 3D first, and a real-phone error table (HTTPS, content type, origin, extensions) are still scarce on the pages opened today.

### Sources opened this read

- https://www.35milimetre.com/blog/glb-usdz-product-3d-models-ecommerce
- https://www.meayt.com/en/blog/ecommerce-3d-and-ar-product-visuals-guide
- https://www.shopify.com/case-studies/gunner-kennels
- https://www.tripo3d.ai/blog/how-to-use-ai-3d-models-in-ecommerce

## Creatives

| Creative                                          | Path                                                                                                                       | What it teaches                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero (Style A2), 1280×720 WebP (read with `sips`) | `apps/web/public/blog/illustrations/3d-models-for-ecommerce/hero.webp`                                                     | A product and its packaging, real vs mesh. Alt: "Illustration of a brown leather loafer beside its shoe box, the front of the loafer in real leather and the heel in matte grey clay with a white wireframe mesh, on a dark background". Caption: "Illustration, not an easyrender result: a loafer drawn half as leather, half as a clay-and-wireframe mesh, next to its box." |
| Real photo + GLB viewer, side by side             | `/showcase/swivel-chair.jpg` (720×720) and `/showcase/swivel-chair.glb`, poster `/blog/models/swivel-chair.webp` (960×960) | Photo shows one chosen view; the model lets the shopper choose. Front is a prediction.                                                                                                                                                                                                                                                                                          |
| Diagram                                           | `diagram:store-files` (`components/blog/diagrams/ecommerce.tsx`)                                                           | One model, two files, three places a shopper meets it.                                                                                                                                                                                                                                                                                                                          |
| Table                                             | File budget: Scene Viewer vs the six showcase models                                                                       | Whether a file is inside budget.                                                                                                                                                                                                                                                                                                                                                |
| Real angle sheet                                  | `/showcase/vase-angles.jpg` (1200×1200)                                                                                    | What image-to-3D draws from one photo; round matte objects are the easy case.                                                                                                                                                                                                                                                                                                   |
| Diagram                                           | `diagram:sideboard-photo-pick` (`ecommerce.tsx`)                                                                           | Which of three supplier shots to use (three-quarter).                                                                                                                                                                                                                                                                                                                           |
| Table                                             | Errors (7 rows)                                                                                                            | Symptom → cause → fix.                                                                                                                                                                                                                                                                                                                                                          |

Hero prompt (Style A2). The prompt actually used is not recorded: `INFORME-HEROES-A2-2026-11-11.md` lists only the source file and the object ("leather loafer + box"); the prompt in `~/easyrender/blog-style-A/MAPPING.md` is for the earlier monochrome Style A version. This prompt is written to match the published image:

> Dark technical 3D render, 16:9, 1280×720. One product: a men's slip-on leather loafer, three-quarter view, left of centre, with a plain closed rectangular shoe box behind it to the right. The toe and vamp are in real tan-brown leather with visible stitching; the heel and the rear of the sole are matte grey clay covered by a fine white wireframe mesh of square quads. The box is plain matte dark grey, blank, not split. White rim light tracing the silhouettes, charcoal-to-black radial gradient background, dark glossy floor with soft contact shadows. The only accent colour is the warm tan of the leather. No text, no UI, no numbers, no logos, labels or brands, no rulers, measurements or scale marks, no people, no armchair. Save as WebP, 1280×720.

## Outline and FAQ

H2s as published:

1. What does a 3D model add to a product page? Shopper chooses the view; AR Quick Look and Scene Viewer; AR size comes from the file.
2. How do you measure whether 3D is worth it? Three goals, a matched-group test, model-viewer events.
3. Which files does a store need for 3D? GLB and USDZ; H3s on Shopify, WooCommerce and custom sites, and the file budget table.
4. Ways to create 3D product models. Four routes with criteria and a verdict each.
5. 3D models for furniture stores: where to start. Four-question score, test two routes.
6. How do you add 3D to a store, step by step? Seven steps.
7. An example: a walnut sideboard. Which supplier shot to use and what to check.
8. What goes wrong when a store adds 3D? 7-row table.
9. What are the limits of 3D for ecommerce? No measurements, reflective products, photos still needed.

FAQ (verbatim):

- Do I need 3D models for my online store?
- Which 3D file format does an online store need?
- How big should a 3D product model file be?
- How much does a 3D model for ecommerce cost?
- Can shoppers see a 3D product in AR at its real size?

## Depth gate

Retrospective: this guide predated the pipeline; verdict against the current 03-depth-gate rubric based on the published text, without rewriting the post.

```
Verdict: GAPS
Date and session: 2026-11-11, retrospective brief session
1 Methods ✓ Seven rollout steps, a four-question product score, file budget and platform setup (ar-modes, content type); per-route capture steps are delegated to the core guide by link.
2 Goals ✓ Three goals with a matched-group 4 to 6 week test and named model-viewer events.
3 Errors ✓ Seven symptom → cause → fix rows.
4 Own point of view ✓ Showcase budget column from the real GLBs; advice to test two routes on one product; the explicit "We do not publish conversion or return figures".
5 Sourced data ✓ Scene Viewer, Shopify, Apple, WebKit, model-viewer, WooCommerce and RealityScan linked inline; Scene Viewer and Shopify checked 2026-11-11.
6 No padding ✗ The limits section restates earlier text: "Transparent and reflective products, like a glass vase or a chrome lamp, are hard for every method" repeats the scan verdict "It fails on glass, mirrors and polished metal", and "Keep the dimensions in the product text, and do not rely on AR" repeats section 1 ("So the dimensions belong in your product text") and error row 3.
7 Originality ✗ Not checked against live SERP. AHREFS-W1.md lists the top results but their content was not read. Candidates: matched-group test with model-viewer events; budget held against real files.
8 Comparisons ✓ Four routes, four stated criteria, a verdict per route.
9 Tone ✓ Second person, seller's voice, short paragraphs; content.test.ts passes.
10 Claims ✓ No size or scale claim (FAQ: a model from a photo is not at real size); no embed promise ("Upload ... with your platform's own tools"); no own conversion figures.
11 Creatives ✓ Hero under the first paragraph; photo/model pair, two diagrams, angle sheet and budget table each teach something.
12 Own output ✓ Within this guide the showcase column only shows the files inside budget. Watch: the paragraph right after it ("A file that relies on one outside that list, such as WebP textures, may not open") becomes a statement about our files once read with glb-file, which says the showcase textures are WebP.
Items to fix (not applied):
- 6: cut or merge the repeated limits sentences.
- 7: read the top 5 for the keyword and name two points they lack.
- 12 (watch): keep the WebP caution away from the showcase column, or phrase the budget row without our files.
```
