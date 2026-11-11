# Brief: usdz-file

- Guide: [`apps/web/content/blog/en/usdz-file.md`](../../../apps/web/content/blog/en/usdz-file.md)
- Group / slug: `usdz-file`
- Publish date: 2026-11-17
- Target keyword: `usdz file`, 250 / KD 4 (`contenido/materiales/canales/04-seo/keyword-map-200.csv`, KW-112; `KEYWORD-MAP.md`). Secondary `how to open usdz files`: 50 / KD 2 (KW-379).
- Retrospective brief, written on 2026-11-11 from the published guide. The guide predated the pipeline.

## Intent and goals

Intent: learn and do (`AHREFS-W1.md`: informational + branded, USDZ being Apple's format). The reader has or needs a USDZ for AR on iPhone and iPad and wants to know what it is, open it, check it, serve it on a web page and make one.

Goals, each with the check the guide gives:

1. Open it on the device at hand: tap in Safari, Files, Mail or Messages; space bar in Finder; Blender 3.5+ elsewhere.
2. Know what is inside and how big it is: `unzip -l side-table.usdz` lists every file with its real size (no compression); `metersPerUnit`, `upAxis` and the anchoring line in the main .usda.
3. AR Quick Look working from a web page: the AR badge appears; `a.relList.supports("ar")` returns true; tapping opens Object and AR views instead of downloading.
4. A file small enough to send and load: compare its size with the GLB after asking the exporter for .usdc and JPEG.

## Methods

1. Inspect: `unzip -l file.usdz` (geometry .usda or .usdc, textures PNG or JPEG); unzip a copy and read `metersPerUnit`, `upAxis` and the anchoring (horizontal or vertical) in the main layer.
2. Ask of an exporter: binary .usdc geometry, JPEG textures unless transparency is needed, textures at 2048 px or less; then compare with the GLB and open in Quick Look on a Mac.
3. Serve on a web page, four details: HTTPS with content type `model/vnd.usdz+zip`; wrap a preview image in `<a rel="ar" href="side-table.usdz"><img src="side-table.jpg"></a>`; a single `img` or `picture` child; check `a.relList.supports("ar")` and show a plain download link when false. Or use model-viewer for GLB plus USDZ from one snippet.
4. Make one: Reality Converter (Mac; converts OBJ, glTF, FBX, USD); Blender 3.5+ (File, Export, Universal Scene Description, `.usdz` extension); the three.js USDZ exporter (in the browser); Shopify (converts each upload). Verdict: editors export from Blender and check on a Mac; Shopify sellers upload the GLB; own sites using an in-browser export check its size against the GLB.
5. Test on a phone: send the USDZ by Messages, tap, spin in Object view, switch to AR, look where the legs meet the floor, check the grain under your own lamp.

## Errors

The guide has 7 entries (symptom → cause → fix):

1. Tapping downloads instead of opening AR → no `rel="ar"`, or wrong content type → add it, serve as `model/vnd.usdz+zip`.
2. No AR badge → link has more than one child, or iOS older than 12 → one `img`/`picture` child, test on a current iPhone.
3. Piece huge or tiny → Quick Look uses the size in the file, never measured → dimensions in the text; pinch to resize.
4. Piece floats → base above origin → move the origin to the base in Blender, export again.
5. Colours flatter than in Blender → material setup does not translate to USD → check in Quick Look on a Mac, simplify the material.
6. Curves faceted → source GLB had no normals → add smooth normals before converting.
7. Too big to send → text geometry, PNG textures → binary geometry and JPEG, compare sizes.

## First-hand data

| Number or statement in the guide                                                            | Source file                                                                                        |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Round solid wood table model: 16,228 triangles                                              | `apps/web/public/showcase/coffee-table.glb` (index accessors, read 2026-11-11)                     |
| "Its USDZ is made from this same GLB, so the two always match"; easyrender gives both files | `apps/web/components/model-view.tsx` (`exportUsdz` loads the GLB and runs three.js `USDZExporter`) |
| AR is coming soon                                                                           | `contenido/materiales/decisiones/claims.md` (AR allowed from 10-nov, without real size)            |

No other repo numbers. The earlier measured USDZ sizes of our own exports were removed from the guide on 10-nov (Jorge, «Quítalos del blog») and are kept in `~/easyrender/BUGS-PRODUCTO-DESDE-BLOG-2026-11-10.md`, item 4.

## Sources

Links as published in the guide; not re-read on 2026-11-11.

| URL                                                                              | Fact it supports                                                                                                                                                        |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://openusd.org/release/spec_usdz.html                                       | USDZ is a zip with zero compression holding USD layers and their images; each file starts at a multiple of 64 bytes; listed image types include PNG and JPEG, not WebP. |
| https://www.apple.com/newsroom/2018/06/apple-unveils-arkit-2/                    | USDZ introduced with ARKit 2 at WWDC, June 2018, for iOS 12, with AR Quick Look.                                                                                        |
| https://developer.blender.org/docs/release_notes/3.5/pipeline_assets_io/         | Blender 3.5 and later import USDZ.                                                                                                                                      |
| https://developer.apple.com/augmented-reality/quick-look/                        | Safari, Messages, Mail, News and Notes open USDZ, on iOS 12 / iPadOS 12 and later.                                                                                      |
| https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/ | `rel="ar"` markup around a preview image; Safari adds the AR badge; content type `model/vnd.usdz+zip`.                                                                  |
| https://modelviewer.dev/                                                         | model-viewer shows a GLB and hands iPhones a USDZ.                                                                                                                      |
| https://developer.apple.com/videos/play/wwdc2022/10141/                          | Reality Converter converts OBJ, glTF, FBX and USD to USDZ.                                                                                                              |

Unlinked outside facts: "Android's AR uses Google's Scene Viewer, which reads glTF and GLB files rather than USDZ" (FAQ); "Shopify, for example, accepts both as product media and makes the missing one itself"; ".usda takes several times the bytes of the same mesh in binary .usdc"; "a lossless PNG ... is usually several times the size of a JPEG".

## SERP gaps

From `contenido/AHREFS-W1.md` (10-nov-2026, US): very incomplete (units forced `top_positions=3`); only Apple's AR Quick Look gallery (pos. 2) came back. The report says Apple's docs will be hard to outrank and should be cited, and the guide wins by explaining USDZ plainly for a shop owner, with the size caveat.

Gaps the guide itself targets (SERP content not re-read for this retrospective brief): what decides USDZ file size (text vs binary geometry, PNG vs JPEG, WebP conversion) as an exporter checklist; inspecting a USDZ with `unzip -l` and reading `metersPerUnit`/`upAxis`; the four web-serving details for Quick Look with a symptom table; a tool table with a verdict per seller type.

## Creatives

| Creative                                          | Path                                                                                                 | What it teaches                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero (Style A2), 1280×720 WebP (read with `sips`) | `apps/web/public/blog/illustrations/usdz-file/hero.webp`                                             | An object next to the phone it opens on. Alt: "Illustration of a glowing mushroom table lamp beside a phone lying flat, the lamp's left half lit warm and its right half in matte grey clay with a white wireframe mesh, on a dark background". Caption: "Illustration, not an easyrender result: a lamp drawn half lit, half as a clay-and-wireframe mesh, beside a phone." |
| Diagram                                           | `diagram:usdz-anatomy` (`components/blog/diagrams/formats.tsx`)                                      | A USDZ as an uncompressed zip of a USD layer and its textures.                                                                                                                                                                                                                                                                                                               |
| Table                                             | Exporter choices: smaller vs larger file                                                             | What to ask an exporter for.                                                                                                                                                                                                                                                                                                                                                 |
| Diagram                                           | `diagram:quick-look-path` (`formats.tsx`)                                                            | Two routes into Quick Look (Safari page, file in Messages/Mail/Files), both ending in Object and AR views.                                                                                                                                                                                                                                                                   |
| Table                                             | Four tools to make a USDZ                                                                            | Which tool by where it runs and what it is good at.                                                                                                                                                                                                                                                                                                                          |
| GLB viewer                                        | `/showcase/coffee-table.glb`, poster `/blog/models/coffee-table.webp` (960×960)                      | Check where the legs meet the ground; 16,228 triangles.                                                                                                                                                                                                                                                                                                                      |
| Table                                             | Errors (7 rows)                                                                                      | Symptom → cause → fix.                                                                                                                                                                                                                                                                                                                                                       |
| Pending (not rendered)                            | `<!-- IMAGE PENDING -->`: a real iPhone screenshot of an easyrender USDZ in Quick Look's Object view | Listed for the team; AR view not until tested on device (REQ-00).                                                                                                                                                                                                                                                                                                            |

Hero prompt (Style A2). The prompt actually used is not recorded: `INFORME-HEROES-A2-2026-11-11.md` lists only the source file and the object ("mushroom lamp + phone"); the prompt in `~/easyrender/blog-style-A/MAPPING.md` is for the earlier monochrome Style A version. This prompt is written to match the published image:

> Dark technical 3D render, 16:9, 1280×720. One object: a modern mushroom table lamp with a rounded dome shade and a short flared base, slightly left of centre, with a generic smartphone lying flat and face-up on the floor to its right, blank black screen. The lamp's left half is its real pale shade, lit from inside with a warm glow; its right half is matte grey clay covered by a fine white wireframe mesh of square quads. White rim light tracing the lamp and the phone's edge, charcoal-to-black radial gradient background, dark glossy floor with soft contact shadows. The only accent colour is the warm amber glow of the lit half. No text, no UI or icons on the phone, no numbers, no logos or brands, no rulers, measurements or scale marks, no people, no room, no armchair. Save as WebP, 1280×720.

## Outline and FAQ

H2s as published:

1. What is inside a USDZ file? Zero-compression zip, 64-byte alignment, .usda vs .usdc, ARKit 2 history.
2. What decides the size of a USDZ file? Geometry encoding and texture format; no WebP; exporter choice table.
3. How do you check what is inside a USDZ? `unzip -l`, `metersPerUnit`, `upAxis`, anchoring; what to ask an exporter.
4. USDZ viewer: how do you open a USDZ file? iPhone/iPad, Mac, Windows/Android via Blender.
5. How does AR Quick Look work on a web page? `rel="ar"` and four setup details; model-viewer; size from the file.
6. How do you make a USDZ file? Four tools and a verdict per seller type.
7. An example: an oak side table on an iPhone. Object view, AR, the floor contact, the grain under your lamp.
8. What goes wrong with a USDZ, and how do you fix it? 7-row table.
9. GLB to USDZ: should you keep both? Both for a product page.

FAQ (verbatim):

- Can you open a USDZ file on Android?
- Can you convert a USDZ to a GLB?
- Why does a USDZ model look the wrong size in AR?
- Why is a USDZ bigger than the GLB it came from?
- Is USDZ the same as USD?

## Depth gate

Retrospective: this guide predated the pipeline; verdict against the current 03-depth-gate rubric based on the published text, without rewriting the post.

```
Verdict: GAPS
Date and session: 2026-11-11, retrospective brief session
1 Methods ✓ Exact commands (unzip -l), markup, content type, relList check, Blender menu path and exporter settings.
2 Goals ✓ Each task has a check: listed sizes, metersPerUnit/upAxis, the AR badge and relList.supports("ar"), size against the GLB.
3 Errors ✓ Seven symptom → cause → fix rows.
4 Own point of view ✓ Thin but present: the coffee-table GLB (16,228 triangles) and a verdict per seller type ("Our verdict: ...").
5 Sourced data ✗ Unlinked in this guide: "Android's AR uses Google's Scene Viewer, which reads glTF and GLB files rather than USDZ" (FAQ) and "Shopify, for example, accepts both as product media and makes the missing one itself". The "several times the bytes" comparisons for .usda vs .usdc and PNG vs JPEG have no source or measurement.
6 No padding ✗ The closing section "GLB to USDZ: should you keep both?" restates earlier text: "GLB covers the web and Android, and USDZ covers AR on Apple devices" repeats the viewer section, and the Shopify sentence repeats the tool table's Shopify row; the rest of the section is links.
7 Originality ✗ Not checked against live SERP; the AHREFS-W1.md snapshot returned one result and its content was not read. Candidates: exporter size checklist; unzip -l inspection.
8 Comparisons ✓ Exporter table (smaller vs larger) and tool table with a verdict per seller type.
9 Tone ✓ Second person, plain, short paragraphs; content.test.ts passes.
10 Claims ✓ AR "coming soon"; size from the file, "not a measured size"; "Treat AR as a way to see the look of an object, not to check whether it fits."
11 Creatives ✓ Hero under the first paragraph; two diagrams, two tables and the coffee-table GLB each teach a step. One real screenshot still IMAGE PENDING.
12 Own output ✗ Borderline: read together, the tool row "The three.js USDZ exporter | Any browser | No server, and the USDZ always matches its GLB | Check the size and the materials in Quick Look", the coffee-table caption "Its USDZ is made from this same GLB, so the two always match", and the FAQ "a small WebP texture is converted, often to a much larger PNG" point at easyrender's own in-browser USDZ as the large one. The generic facts are fine; the "always match" echo ties them to our export.
Items to fix (not applied):
- 5: link Scene Viewer and Shopify's product media page at those sentences; measure or soften the "several times" comparisons.
- 6: cut the closing section or reduce it to its two links.
- 7: read the top 5 for the keyword and name two points they lack.
- 12: drop "so the two always match" from the coffee-table caption (or from the tool row) so the size caution stays generic; the underlying finding is item 4 of ~/easyrender/BUGS-PRODUCTO-DESDE-BLOG-2026-11-10.md.
```
