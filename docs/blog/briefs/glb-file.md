# Brief: glb-file

- Guide: [`apps/web/content/blog/en/glb-file.md`](../../../apps/web/content/blog/en/glb-file.md)
- Group / slug: `glb-file`
- Publish date: 2026-11-15
- Target keyword: `glb file`, 1,500 / KD 2 (`contenido/materiales/canales/04-seo/keyword-map-200.csv`, KW-084; `KEYWORD-MAP.md` row 4). Secondary `what is a glb file`: 450 / KD 6 (KW-085).
- Retrospective brief, written on 2026-11-11 from the published guide. The guide predated the pipeline.

## Intent and goals

Intent: learn and do (`AHREFS-W1.md`: informational; the SERP is viewers, converters and marketplaces). The reader has or needs a .glb and wants to know what it is, open it, check it, shrink it and use it on a product page or Android AR.

Goals, each with the check the guide gives:

1. Open the file: Babylon.js Sandbox, model-viewer editor, Blender import, or Scene Viewer on Android.
2. Know what is inside: `gltf-transform inspect` lists meshes, textures, extensions, vertex counts and sizes; compare with the guide's table.
3. Fit the destination: Scene Viewer's 10 MB, 100,000 triangles, 2048 px textures; Shopify optimises over 15 MB.
4. Make it smaller without breaking it: compare bytes before and after (the guide's compression table), then check the compressed file in every viewer it will meet.
5. A file that is valid and looks right: glTF Validator, then a look in a viewer (underneath, behind, fine details).

## Methods

1. Read the structure: 12-byte header (`glTF`, version 2, total length), then a JSON chunk and a binary chunk.
2. Open it: drag into Babylon.js Sandbox or the model-viewer editor; Blender File, Import, glTF 2.0; three.js or Babylon.js in code, Unity via glTFast; Scene Viewer on Android. iPhone AR needs USDZ.
3. Inspect it: `gltf-transform inspect`; check for a NORMAL attribute.
4. Fix materials: Metallic at 0 in Blender when a material sets only a base colour (glTF default is fully metallic), export again.
5. Fix faceting: Shade Smooth and export with Normals ticked (normals cost 12 bytes per vertex).
6. Reduce size (tested on a copy of the bedside table with glTF Transform 4.5): `gltf-transform meshopt`, `gltf-transform draco`, `gltf-transform simplify --ratio 0.5`. Verdict by destination: own site with model-viewer → Meshopt or Draco plus WebP textures, check edges; Android AR via Scene Viewer → plain GLB, JPEG or PNG textures at 2048 px or less, simplify only over 100,000 triangles; Shopify → upload uncompressed.
7. Export from Blender: File, Export, glTF 2.0, format glTF Binary (.glb); tick Normals and UVs under Mesh; JPEG images unless transparency is needed.
8. USDZ for Apple: Reality Converter on a Mac, or recent Blender's USDZ export.

## Errors

The guide has 7 entries (symptom → cause → fix):

1. Model plain grey → .gltf saved without its textures, or images off → re-export as binary .glb.
2. File tens of megabytes → 4096 px textures or many of them → resize to 2048 or 1024 and compress geometry.
3. Curved surfaces faceted → no vertex normals → Shade Smooth, export with normals.
4. Clay or fabric dark or tinted → Metallic unset, default fully metallic → set Metallic 0, export.
5. Black patches, parts seen from inside → faces pointing the wrong way → recalculate normals outside in Blender.
6. Opens in one viewer, fails in another → unsupported extension (Draco, WebP) → export a plain version for that viewer.
7. Upload says file not valid → download cut short, stated length mismatches → download again and compare size.

## First-hand data

Verified against the repo on 2026-11-11 by reading each GLB's header and JSON chunk (script outside the repo).

| Number in the guide                                                                                                                                        | Source file                                                                                                                   | Check                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Header check (glTF, version 2, length) and reject under 20,000 bytes                                                                                       | `packages/harness/src/guardrails.ts` (`checkGlb` comment, `LIMITS.minGlbBytes: 20_000`)                                       | matches                                                                           |
| Six models, one mesh, one material, one 1024 px WebP texture                                                                                               | `apps/web/public/showcase/*.glb`                                                                                              | matches (`EXT_texture_webp`, 1 mesh, 1 material each)                             |
| Sizes 308,448 / 312,816 / 322,876 / 519,988 / 551,068 / 1,287,432 bytes                                                                                    | same files, `ls -l`                                                                                                           | matches                                                                           |
| Triangles 14,590 / 16,708 / 16,228 / 24,268 / 25,879 / 69,910                                                                                              | index accessor count / 3                                                                                                      | matches                                                                           |
| Texture bytes 51,354 / 28,466 / 34,266 / 57,680 / 70,690 / 40,628                                                                                          | image bufferView lengths                                                                                                      | matches                                                                           |
| Geometry share 83 / 90 / 89 / 89 / 87 / 97%                                                                                                                | (file − texture) / file                                                                                                       | Stoneware vase computes to 90.9%, so it rounds to 91%, not 90%. The others match. |
| Clay vase: JSON 1.4 KB, indices 87,540 bytes, 8,406 vertices × 20 bytes = 168,120 bytes, texture 50 KB, 301 KB total (`glb-anatomy` diagram)               | `clay-vase.glb`                                                                                                               | matches (JSON chunk 1,404 bytes)                                                  |
| Texture copy 1024×1024                                                                                                                                     | `apps/web/public/blog/figures/glb-file/clay-vase-texture.webp` (51,354 bytes, the same byte length as the texture in the GLB) | matches                                                                           |
| Compression on a copy of the bedside table: Meshopt 422,480; Draco 235,776; simplify 0.5 → 710,072 bytes, 34,954 triangles; Draco 82% lighter, Meshopt 67% | Experiment outside the repo, recorded in `~/easyrender/INFORME-HERO-FAQ-W1-2026-11-10.md` (glTF Transform 4.5.1)              | percentages recompute; 34,954 triangles is not in that report and was not re-run  |
| Meshopt on the clay vase: 308,448 → 135,740 bytes                                                                                                          | Not found in the earlier reports and not re-run on 2026-11-11                                                                 | untraced                                                                          |

## Sources

Links as published in the guide; not re-read on 2026-11-11 unless marked.

| URL                                                                             | Fact it supports                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html                       | .gltf + .bin + images vs one binary GLB; header and chunk layout; metallic default 1; normals optional and flat ones computed when missing; glTF measures in metres.                                                                                  |
| https://sandbox.babylonjs.com/                                                  | Browser viewer that opens GLB.                                                                                                                                                                                                                        |
| https://modelviewer.dev/editor/                                                 | Browser viewer/editor that opens GLB.                                                                                                                                                                                                                 |
| https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html | Blender File, Import, glTF 2.0 (.glb/.gltf).                                                                                                                                                                                                          |
| https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.0/manual/index.html | Unity reads GLB through glTFast.                                                                                                                                                                                                                      |
| https://developers.google.com/ar/develop/scene-viewer                           | Scene Viewer opens a GLB from a web page in 3D or AR; budget 10 MB, 100,000 triangles, 2048 px; documentation lists neither Draco nor Meshopt. Opened 2026-11-11: confirmed; listed extensions are `KHR_materials_unlit` and `KHR_texture_transform`. |
| https://gltf-transform.dev/cli                                                  | `gltf-transform inspect` lists meshes, textures, extensions, counts and sizes.                                                                                                                                                                        |
| https://modelviewer.dev/                                                        | model-viewer shows a GLB with rotate and zoom.                                                                                                                                                                                                        |
| https://github.khronos.org/glTF-Validator/                                      | A file can pass the validator and still look wrong.                                                                                                                                                                                                   |

Unlinked outside facts: "On product pages, Shopify accepts GLB files as product media"; "Shopify optimises anything over 15 MB itself"; "Apple's Reality Converter, a free Mac app, turns a GLB into a USDZ"; "recent versions of Blender export USDZ directly". The Shopify facts are true per the Shopify page opened on 2026-11-11, but this guide does not link it.

## SERP gaps

From `contenido/AHREFS-W1.md` (10-nov-2026, US): Sketchfab GLB tag page, convert3d.org converter, Meshy online GLB viewer; positions 1 and 5 missing (likely AI Overview/media). The report says the guide must answer what it is and also how to open, view, convert and keep it small, citing the Khronos spec.

Gaps the guide itself targeted when the retrospective brief was written (the SERP was re-read on 11-nov-2026; see the section below): a byte-level breakdown of a real GLB (header, chunks, indices, vertices, texture) with the arithmetic; a size table of six real files showing geometry, not texture, dominates once textures are 1024 px WebP; a measured compression comparison (Meshopt, Draco, simplify) with a verdict per destination; the metallic-default pitfall.

## Live SERP read (11-nov-2026)

Read on 11-nov-2026 (Europe/Madrid) with WebSearch. No Ahrefs units were used. This replaces the note above that the SERP had not been re-read for the retrospective brief.

### What currently surfaces

"What is a GLB file" / "how to open a GLB file" still returns format explainers and viewer/converter pages: docs.poly.app, Vectreal, CGHEVEN, 3D Cloud, and similar "open in the browser / Blender / Windows / Mac" posts. Sketchfab tag pages and online viewers (Meshy and others) remain typical neighbours, as on 10-nov. The guide should still answer what it is *and* how to open, check, convert and keep it small, citing the Khronos glTF 2.0 spec.

### Facts to refresh or confirm

- A GLB is the binary, single-file version of glTF 2.0: geometry, materials, textures and optional animation in one file. Official definition: the Khronos glTF 2.0 specification.
- Opening it: drag into a browser viewer (Khronos glTF Sample Viewer, Babylon.js Sandbox). Edit in Blender via File > Import > glTF 2.0 (.glb/.gltf). These are stable and should stay in the guide.
- Microsoft 3D Viewer was removed from the Microsoft Store on 1 July 2026. Existing installs still run; new installs from the Store do not. Microsoft's deprecated-features documentation and contemporary reports (Neowin, Windows Central) point people to Babylon.js Sandbox instead. The guide should not tell a Windows reader to install 3D Viewer from the Store.
- macOS Preview: some 2026 blog posts say Preview can open GLB. That was not verified on a Mac in this read, and earlier notes in our materials said support arrives in a later macOS, not in current shipping versions. Do not state that Preview opens GLB until someone has checked it on a named macOS version. iPhone still needs USDZ for Quick Look; a raw GLB is not the iPhone path.

### Do not copy from the SERP

Do not recommend a random online converter as the way to "fix" a GLB. Do not claim a measured size or that a GLB is a print file.

### Gaps that still hold

A byte-level breakdown of a real GLB (header, chunks, indices, vertices, texture) with the arithmetic, a size table of real files showing that geometry, not texture, dominates once textures are 1,024 px WebP, a measured compression comparison (Meshopt, Draco, simplify) with a verdict per destination, and the metallic-default pitfall are still the guide's own material.

### Sources opened this read

- https://docs.poly.app/file-extensions/glb
- https://vectreal.com/news-room/how-to-open-a-glb-file
- https://cgheven.com/blog/how-to-open-glb-file
- https://3dcloud.com/glb-files/
- https://learn.microsoft.com/en-us/windows/whats-new/deprecated-features-resources
- https://www.neowin.net/news/microsoft-removes-3d-viewer-from-the-store-ending-new-installs/

## Creatives

| Creative                                          | Path                                                                      | What it teaches                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero (Style A2), 1280×720 WebP (read with `sips`) | `apps/web/public/blog/illustrations/glb-file/hero.webp`                   | A surface and its UV layout. Alt: "Illustration of a celadon teapot, the left half in real glaze and the right half in matte grey clay under a white wireframe mesh whose UV panels peel away from the body, on a dark background". Caption: "Illustration, not an easyrender result: a teapot drawn half as glaze, half as a wireframe mesh with its UV panels peeling off." |
| Diagram                                           | `diagram:glb-anatomy` (`components/blog/diagrams/formats.tsx`)            | The clay vase GLB in proportion to its bytes, and the same model as three glTF files.                                                                                                                                                                                                                                                                                         |
| Table                                             | Six showcase models: bytes, triangles, texture bytes, geometry share      | Where the bytes go in real files.                                                                                                                                                                                                                                                                                                                                             |
| Texture copy                                      | `/blog/figures/glb-file/clay-vase-texture.webp` (1024×1024)               | What a base colour texture and its UV patches look like.                                                                                                                                                                                                                                                                                                                      |
| GLB viewer                                        | `/showcase/clay-vase.glb`, poster `/blog/models/clay-vase.webp` (960×960) | A real GLB to open and turn; 301 KB, 14,590 triangles.                                                                                                                                                                                                                                                                                                                        |
| Table                                             | Compression results on a copy of the bedside table                        | Which command saves how much.                                                                                                                                                                                                                                                                                                                                                 |
| Table                                             | GLB vs glTF vs USDZ                                                       | Which file for which use.                                                                                                                                                                                                                                                                                                                                                     |
| Table                                             | Errors (7 rows)                                                           | Symptom → cause → fix.                                                                                                                                                                                                                                                                                                                                                        |

Hero prompt (Style A2). The prompt actually used is not recorded: `INFORME-HEROES-A2-2026-11-11.md` lists only the source file and the object ("celadon teapot, UV panels"); the prompt in `~/easyrender/blog-style-A/MAPPING.md` is for the earlier monochrome Style A version. This prompt is written to match the published image:

> Dark technical 3D render, 16:9, 1280×720. One object: a rounded teapot with a curved spout, lid and handle, three-quarter view, slightly left of centre. The left half is in real celadon glaze, pale jade green with a soft sheen; the right half is matte grey clay under a fine white wireframe mesh of square quads, with flat UV panels peeling away from the body like an unwrap lifting off, still attached along one edge. White rim light tracing the silhouette and the peeling panels, charcoal-to-black radial gradient background, dark glossy floor with a soft contact shadow. The only accent colour is the celadon green of the glaze. No text, no UI, no numbers, no logos or brands, no rulers, measurements or scale marks, no people, no vase, no armchair. Save as WebP, 1280×720.

## Outline and FAQ

H2s as published:

1. What is inside a GLB file? .gltf vs .glb, header and chunks, our header check, the vase's byte arithmetic.
2. How big are real GLB files, and where do the bytes go? Six-model table; geometry dominates.
3. What do the materials in a GLB describe? PBR metallic-roughness, the texture, the metallic default.
4. Why can a GLB look faceted? Optional normals, flat fallback, cost per vertex, how to add them.
5. How do you open a GLB file? Browser, Blender, code, Android; iPhone needs USDZ; inspect.
6. What is a GLB file used for? Product pages, model-viewer, web 3D, Scene Viewer budget.
7. How do you reduce GLB file size? Compression table and a verdict by destination.
8. How do you get a GLB from Blender, a scan or a photo? Export settings and routes.
9. GLB to USDZ: do you need both? Conversion tools and a three-format table.
10. What goes wrong with a GLB, and how do you fix it? 7-row table.
11. What does a GLB file not tell you? Size depends on the maker; validity is not quality.

FAQ (verbatim):

- Is GLB the same as glTF?
- Can you open a GLB file on an iPhone?
- How do you convert a GLB to another format?
- Why is my GLB file so big?
- Why does my GLB look grey or untextured?

## Depth gate

Retrospective: this guide predated the pipeline; verdict against the current 03-depth-gate rubric based on the published text, without rewriting the post.

```
Verdict: GAPS
Date and session: 2026-11-11, retrospective brief session
1 Methods ✓ Exact menu paths, export ticks, gltf-transform commands and a verdict per destination.
2 Goals ✓ Each task has a check: inspect output, Scene Viewer budget, before/after bytes, validator plus a viewer look.
3 Errors ✓ Seven symptom → cause → fix rows.
4 Own point of view ✓ Six real files read byte by byte, harness header check, a compression experiment with a verdict per destination.
5 Sourced data ✗ Shopify facts have no link in this guide: "On product pages, Shopify accepts GLB files as product media" and "Shopify optimises anything over 15 MB itself". Also unlinked: "Apple's Reality Converter, a free Mac app, turns a GLB into a USDZ".
6 No padding ✓ Paragraphs carry numbers, steps or decisions; the closing section adds the validator point.
7 Originality ✗ Not checked against live SERP. AHREFS-W1.md lists the top results (viewers, converters) but their content was not read. Candidates: byte breakdown of a real GLB; measured compression per destination.
8 Comparisons ✓ Compression table with "Our verdict by destination"; GLB/glTF/USDZ table with "Use it for".
9 Tone ✓ Second person, plain, short paragraphs; content.test.ts passes.
10 Claims ✓ "The model keeps shape and materials, not measurements"; no printing or STL offer.
11 Creatives ✓ Hero under the first paragraph; anatomy diagram, texture copy, real GLB and four tables each teach something.
12 Own output ✗ Borderline: the guide's own numbers expose two showcase traits that its later sections call problems. "Its 8,406 vertices each store a position and a texture coordinate in 20 bytes" (no normals) sits before "when normals are not given, viewers must calculate flat ones ... a curved surface can show faint flat panels". "All six are one mesh with one material and one 1024-pixel WebP texture" sits before "Scene Viewer's documentation lists neither extension" and the error row "A glTF extension the second viewer does not support, such as Draco or WebP textures".
Items to fix (not applied):
- 5: link Shopify's product media page for the two Shopify facts, and Apple's Reality Converter page.
- 7: read the top 5 for the keyword and name two points they lack.
- 12: describe the byte arithmetic without implying our files lack normals (or move normals out of the vase example), and keep the WebP/Scene Viewer caution generic, away from the showcase description. Send the underlying findings to product (already in ~/easyrender/BUGS-PRODUCTO-DESDE-BLOG-2026-11-10.md, items 1 and 3).
- Data: stoneware vase geometry share is 90.9%, so 91%, not 90%; source or re-run the clay vase Meshopt figure (135,740 bytes) and the simplified triangle count (34,954).
```
