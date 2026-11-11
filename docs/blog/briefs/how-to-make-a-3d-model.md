# Brief: how-to-make-a-3d-model

- Guide: [`apps/web/content/blog/en/how-to-make-a-3d-model.md`](../../../apps/web/content/blog/en/how-to-make-a-3d-model.md)
- Group / slug: `how-to-make-a-3d-model` (core guide of the week; every other guide links here)
- Publish date: 2026-11-16
- Target keyword: `how to make a 3d model`, 800 / KD 4, TP 3,500 (`contenido/materiales/canales/04-seo/keyword-map-200.csv`, KW-091; `KEYWORD-MAP.md` rows 14 and 273).
- Retrospective brief, written on 2026-11-11 from the published guide. The guide predated the pipeline.

## Intent and goals

Intent: learn and choose (`AHREFS-W1.md`: informational; a r/3Dprinting thread ranks, so printing must be ruled out explicitly). The reader wants a model of an object, often without modelling skills, and needs to pick a method.

Goals, each with the check the guide gives:

1. Pick the right method: three questions (does the object exist, is it in hand, how much time) and the comparison table.
2. A model that matches the real piece: the five-point check (spin at full screen, count parts, zoom into textures, read triangles and size, open on a phone over mobile data and try AR on iPhone and Android).
3. A file inside budget: Scene Viewer's 100,000 triangles (ideally 30,000 to 50,000), 2048 px textures, 10 MB.
4. Compare tools fairly: run the same photo through two tools and judge five things (back and underside, counts, texture, file against budget, cost per finished model and whether a preview comes first).

## Methods

1. Software (Blender, SketchUp push/pull, Tinkercad): gather front and side photos plus measurements; block out with boxes and cylinders; bevel edges; unwrap UVs, add materials; apply scale and rotation (Object, Apply, All Transforms); check every side, export GLB. Use a checker texture to find UV stretching.
2. Photogrammetry: soft even light (overcast or no direct sun); lock exposure; low, middle and high rings, a step at a time, about 70% overlap, at least 20 photos (100+ for detail); object fills at least half of each frame; never move the object. Tools: RealityScan (after 20 images, up to 300), Polycam, Meshroom on a computer.
3. LiDAR: iPhone 12 Pro and later Pro models, recent iPad Pro; walk slowly at an even distance in a well-lit room; pull a sofa away from the wall first.
4. AI image-to-3D: one sharp photo of the whole object on a plain background; check the hidden sides; text-to-3D only for concepts. easyrender draws a free nine-view sheet (eight in 45° steps plus top) before the build.
5. 3D artist: brief with photos from every side and material close-ups, tape measurements, formats (GLB and USDZ), budget (30,000 to 50,000 triangles, textures at 2048 px or less, few materials), source file (.blend); ask for a sample in the same category.

Worked example: a floor lamp with a linen shade and brass stem. Verdict: image-to-3D from a supplier photo only; photogrammetry with the brass masked if in stock; an artist for a campaign lamp.

## Errors

The guide has 8 entries (method, symptom → cause → fix):

1. Software: arrives rotated or wrong size → scale and rotation not applied → apply all transforms, export again.
2. Software: grain stretches across one face → poor UV unwrap → checker texture, unwrap that face again.
3. Photogrammetry: holes in a plain white top → nothing to match → overcast day, or another method.
4. Photogrammetry: base missing or fused with the floor → underside never photographed → accept, or a second session with the piece on its side.
5. LiDAR: thin legs lumpy or missing → finer than the sensor resolves → photogrammetry.
6. AI from a photo: back looks invented → hidden side inferred from the visible one → three-quarter photo, or a note about the back.
7. AI from a photo: logo or label a blur → fine detail from one photo → keep the logo in photos, not the model.
8. Artist: late or wrong → brief without measurements, formats or budget → send them up front.

## First-hand data

Verified against the repo on 2026-11-11.

| Number in the guide                                                                                                                                             | Source file                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Showcase models 14,590 (vase) to 69,910 (bedside table with drawers) triangles                                                                                  | `apps/web/public/showcase/clay-vase.glb`, `bedside-table.glb` (index accessors) |
| Stoneware vase model: 16,708 triangles                                                                                                                          | `apps/web/public/showcase/vase.glb`                                             |
| Free sheet of nine views, eight in 45° steps and one from above                                                                                                 | `packages/harness/src/sheet.ts` (`VIEWS`, `SHEET_PROMPT`)                       |
| Model price `{{renderCredits}}` / `{{renderPrice}}`; credits `{{creditPrice}}` pay as you go from `{{paygMinCredits}}`; Pro `{{proPrice}}` for `{{proCredits}}` | `packages/harness/src/pricing.ts` via tokens                                    |
| "credits never expire"                                                                                                                                          | Same wording in the pricing copy, `apps/web/messages/en.json`                   |
| easyrender exports GLB and USDZ, not STL                                                                                                                        | `apps/web/components/model-view.tsx` (GLB download, `exportUsdz`); claims.md    |

## Sources

Links as published in the guide; not re-read on 2026-11-11 unless marked.

| URL                                                                                                                  | Fact it supports                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://developers.google.com/ar/develop/scene-viewer                                                                | At most 100,000 triangles, ideally 30,000 to 50,000, textures up to 2048 px, 10 MB or less. Opened 2026-11-11: confirmed.                                                                                                                                                                                                                             |
| https://help.sketchup.com/en/sketchup/pushing-and-pulling-shapes-3d                                                  | SketchUp: push and pull flat shapes into solids.                                                                                                                                                                                                                                                                                                      |
| https://www.tinkercad.com/help-center/what-is-tinkercad                                                              | Tinkercad is a free browser app, easiest for basic shapes.                                                                                                                                                                                                                                                                                            |
| https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode                                       | At least 20 photos, about 70% overlap, rings at different heights, soft light; 100+ for detail. (Returned 403 to the agents per `INFORME-SEO-POSTS-W1-2026-11-10.md`.)                                                                                                                                                                                |
| https://dev.epicgames.com/documentation/realityscan-mobile/realityscan-step-by-step-guide                            | Object fills at least half of each image; processing after 20 images, up to 300; what is not visible in several images will not show up.                                                                                                                                                                                                              |
| https://alicevision.org/                                                                                             | Meshroom, open-source photogrammetry on a computer.                                                                                                                                                                                                                                                                                                   |
| https://www.apple.com/newsroom/2020/03/apple-unveils-new-ipad-pro-with-lidar-scanner-and-trackpad-support-in-ipados/ | "Pro iPhones from the iPhone 12 Pro on, and recent iPad Pro models, have a LiDAR sensor that measures depth directly." Opened 2026-11-11: the page announces the 2020 iPad Pro LiDAR Scanner ("measures the distance to surrounding objects up to 5 meters away") and does not mention any iPhone, so it supports the iPad half of the sentence only. |

Unlinked outside facts: "Blender is free, open source and exports GLB, FBX, OBJ and USD"; "Meshy and Tripo also turn images into 3D models and add text-to-3D".

## SERP gaps

From `contenido/AHREFS-W1.md` (10-nov-2026, US): incomplete (units forced `top_positions=4`); only Tinkercad's 3D Design page (pos. 2) and a r/3Dprinting thread (pos. 4) came back. The report asks for a clear "not for 3D printing or STL" statement and fair treatment of Tinkercad, Blender and image-to-3D tools.

Gaps the guide itself targets (SERP content not re-read for this retrospective brief): all five methods in one table with own time, best use and failure mode; numbered steps per method; a single file budget for any method; a method-tagged error table; a worked example (one floor lamp, three ways) with a verdict; an explicit printing exclusion.

## Creatives

| Creative                                          | Path                                                                                               | What it teaches                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero (Style A2), 1280×720 WebP (read with `sips`) | `apps/web/public/blog/illustrations/how-to-make-a-3d-model/hero.webp`                              | A carved object half finished, half mesh. Alt: "Illustration of a walnut chess knight, its face and front in real carved wood and its back in matte grey clay with a white wireframe mesh, on a dark background". Caption: "Illustration, not an easyrender result: a chess knight drawn half as walnut, half as a clay-and-wireframe mesh." |
| Diagram                                           | `diagram:method-decision-tree` (`components/blog/diagrams/methods.tsx`)                            | The three questions that pick a method.                                                                                                                                                                                                                                                                                                      |
| Table                                             | Five methods by need, own time, best use, watch for                                                | Choosing a method.                                                                                                                                                                                                                                                                                                                           |
| Diagram                                           | `diagram:blockout-side-table` (`methods.tsx`)                                                      | Blockout → bevel → texture on a side table.                                                                                                                                                                                                                                                                                                  |
| Diagram                                           | `diagram:photogrammetry-rings` (`methods.tsx`)                                                     | Rings at three heights with about 70% overlap.                                                                                                                                                                                                                                                                                               |
| Real photo + GLB viewer, side by side             | `/showcase/vase.jpg` (720×720) and `/showcase/vase.glb`, poster `/blog/models/vase.webp` (960×960) | One photo and the model built from it; 16,708 triangles; check the back.                                                                                                                                                                                                                                                                     |
| Table                                             | Errors by method (8 rows)                                                                          | Symptom → cause → fix.                                                                                                                                                                                                                                                                                                                       |

Hero prompt (Style A2). The prompt actually used is not recorded: `INFORME-HEROES-A2-2026-11-11.md` lists only the source file and the object ("walnut chess knight"); the prompt in `~/easyrender/blog-style-A/MAPPING.md` is for the earlier monochrome Style A version. This prompt is written to match the published image:

> Dark technical 3D render, 16:9, 1280×720. One object: a chess knight, the horse-head piece, standing alone, three-quarter view, slightly left of centre. Its face and front are in real carved walnut with visible grain and a satin finish; its back half is matte grey clay covered by a fine white wireframe mesh of square quads. White rim light tracing the mane and the silhouette, charcoal-to-black radial gradient background, dark glossy floor with a soft contact shadow. The only accent colour is the warm brown of the walnut. No chessboard, no other pieces, no tools. No text, no UI, no numbers, no logos or brands, no rulers, measurements or scale marks, no people, no armchair. Save as WebP, 1280×720.

## Outline and FAQ

H2s as published:

1. Which method should you pick? Decision tree, five-method table, not for printing, the common file budget.
2. Method 1: Model it yourself in software. Tools, learning curve, six steps, two settings that save beginners.
3. Method 2: Photogrammetry. Polycam and RealityScan rules, five capture rules, tools and weak surfaces.
4. Method 3: LiDAR scanning on a phone. Which devices, what it handles, how to walk it.
5. Method 4: Generate it with AI. Image vs text-to-3D, easyrender's sheet, a five-point tool comparison.
6. Method 5: Hire a 3D artist. When, and the five-item brief.
7. How much does a 3D model cost? Time, quotes, subscriptions; easyrender credits via tokens.
8. How do you check a finished model? Five checks; GLB and USDZ.
9. An example: one floor lamp, three ways. Verdict per situation.
10. What goes wrong with each method? 8-row table.
11. What are the limits of each method? Size, unseen surfaces, time; one object at a time.

FAQ (verbatim):

- Do you need to learn Blender to make a 3D model?
- How long does it take to make a 3D model?
- Can you make a 3D model from one photo?
- Is this the same as making a model for 3D printing?
- How many triangles should a 3D model have?

## Depth gate

Retrospective: this guide predated the pipeline; verdict against the current 03-depth-gate rubric based on the published text, without rewriting the post.

```
Verdict: GAPS
Date and session: 2026-11-11, retrospective brief session
1 Methods ✓ Each of the five methods has numbered steps or concrete rules (Apply All Transforms, rings at three heights, 70% overlap, half-frame fill, artist brief with a triangle budget).
2 Goals ✓ Method choice by three questions; five-point model check; Scene Viewer budget; five-point tool comparison.
3 Errors ✓ Eight method-tagged symptom → cause → fix rows.
4 Own point of view ✓ Showcase triangle counts from public/showcase, the nine-view sheet from sheet.ts, and a verdict on the lamp example.
5 Sourced data ✗ "Pro iPhones from the iPhone 12 Pro on, and recent iPad Pro models, have a LiDAR sensor" links to Apple's March 2020 iPad Pro announcement, which (opened 2026-11-11) mentions no iPhone. "Blender is free, open source and exports GLB, FBX, OBJ and USD" and the Meshy/Tripo text-to-3D line are unlinked.
6 No padding ✗ "Models from one photo carry no measured size. Scans miss whatever the camera could not see ... Models you build yourself take time to learn, and artist models take time to commission." restates the table's "Watch for" column and error row 4.
7 Originality ✗ Not checked against live SERP; the AHREFS-W1.md snapshot was incomplete (two results) and their content was not read. Candidates: method-tagged error table; one lamp three ways with a verdict.
8 Comparisons ✓ The table states its criteria (need, own time, best for, watch for); the lamp example gives a verdict per case; the tool comparison names five criteria.
9 Tone ✓ Second person, short paragraphs, fair to other tools; content.test.ts passes.
10 Claims ✓ Printing and STL ruled out; no size claim (one-photo models "carry no measured size"); prices only as tokens.
11 Creatives ✓ Hero under the first paragraph; three diagrams, the method table and the photo/model pair each teach a step.
12 Own output ✓ easyrender appears with neutral facts (free sheet, price, one object at a time); weaknesses are stated per method, generically.
Items to fix (not applied):
- 5: add an Apple source for iPhone 12 Pro LiDAR (or narrow the sentence to iPad Pro); link Blender's export docs; source or cut the Meshy/Tripo line.
- 6: cut the first paragraph of the limits section, keep the one-object point.
- 7: read the top 5 for the keyword and name two points they lack.
```
