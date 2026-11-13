# Public model material corrections

The 12 objects below received local texture and material edits to their existing GLBs.
The comparison links show the public source photo beside unretouched Chromium renders before
and after, with the same camera, environment, exposure and shadows within each pair.

`S4` means `studio/models/<id>.glb`, `.hd.glb`, `.lod1.glb` and `.lod2.glb`.
`S3` means the same set without `.hd.glb`. All paths below are relative to `apps/web/public/`.

| Object / comparison                                              | Files                             | Correction                                                                                                                                      |
| ---------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [Espresso](showcase-material-comparison/espresso.webp)           | S4                                | Neutral steel F0, binary metal mask, mapped 0.38 roughness and directional micro-grain; black grips, dial and reservoir stay dielectric.        |
| [Bedside table](showcase-material-comparison/bedside-table.webp) | S3 + `showcase/bedside-table.glb` | Less orange walnut, photo-derived grain and a satin dielectric finish.                                                                          |
| [Swivel chair](showcase-material-comparison/swivel-chair.webp)   | S4 + `showcase/swivel-chair.glb`  | Mid-grey heathered cloth, matte upholstery, dark piping and black base retained.                                                                |
| [Stoneware vase](showcase-material-comparison/vase.webp)         | S3 + `showcase/vase.glb`          | Warm sandy stone, fine porous detail, reduced broad smears; mouth stays darker.                                                                 |
| [Clay vase](showcase-material-comparison/clay-vase.webp)         | S4 only                           | Warmer clay and stronger existing distressed bands with photo-derived wear detail.                                                              |
| [Sofa](showcase-material-comparison/sofa.webp)                   | S4                                | Removed the stained albedo, evened charcoal bouclé, retained dark feet and softened exaggerated normal-map creases. Includes a back comparison. |
| [Lamp](showcase-material-comparison/lamp.webp)                   | S4                                | Champagne brass F0, binary metalness, mapped 0.38 roughness and new brushed micro-normals; stronger highlight contrast.                         |
| [Coffee table](showcase-material-comparison/coffee-table.webp)   | S3 + `showcase/coffee-table.glb`  | Cooler oak, more grain contrast and a drier finish.                                                                                             |
| [Barrel](showcase-material-comparison/barrel.webp)               | S4                                | Duller weathered red paint, retained scratches and reduced gloss.                                                                               |
| [Sneaker](showcase-material-comparison/sneaker.webp)             | S4                                | Subtle leather detail and edge sharpening, retaining off-white leather and gum sole colours.                                                    |
| [Cactus](showcase-material-comparison/cactus.webp)               | S4                                | Darker porous neutral concrete, masked away from the green plant and gravel.                                                                    |
| [Crate](showcase-material-comparison/crate.webp)                 | S4                                | Aged boards retained; exposed iron corners now use binary metalness, dark iron F0 and varied mid roughness.                                     |

## Method and delivery

Pillow/NumPy edits reused small patches of the corresponding public source photographs.
Broad photographic lighting was removed from detail patches, edges mirrored for tiling, and
detail scaled to each atlas resolution. Existing atlas features supplied seams, grain direction,
wear bands and material masks. The sofa feet and vase interior also used masks derived from
existing triangle positions/UVs. Geometry was read to select texture pixels, never modified.
The GLB writer replaced image buffer ranges and material parameters without decoding or
re-encoding geometry buffers. Normal texture images remained unchanged and selected material
normal strengths changed in the first pass. The metal follow-up replaces the espresso and lamp
normal images with directional micro-grain; crate wood normals remain unchanged.

All 49 textured variants were updated in the first pass (20,389,280 to 20,201,924 bytes).
The metal follow-up changes 12 of those variants; the current combined size is 21,947,428
bytes and the largest individual increase against the original assets is 1.57×. Texture resolutions were retained.
Studio catalog sizes and the GLB guide's measured byte/texture table were refreshed.
The four existing posters for bedside-table, swivel-chair, vase and coffee-table were recaptured
at their registered `BLOG_MODELS` orbits: `-60deg 75deg auto` for the bedside table and
`30deg 75deg auto` for the others. Each is a transparent 960 × 960 WebP of the corrected GLB.
Studio thumbnails render from the corrected LODs at runtime.

There are no stored USDZ assets under `public/`. USDZ export consumes the GLB; local browser
exports were checked for all four showcase models and the highest-detail studio version of
each of the 12 objects. No export was added to git. iPhone Quick Look was not tested.

The armchair assets, showcase clay vase, source photos, wire models, colliders and unrelated
objects remain unchanged. No viewer lighting, engine wording, paid generation or credits were
used or changed. Existing silhouette, topology and geometry defects remain: these edits improve
material appearance, and do not reconstruct missing photo detail or make the meshes exact replicas.

## Brushed metal follow-up

The espresso, lamp and crate sheets now compare the source photo with **aaf08a0** and the
new materials. Other objects retain their earlier sheets. All four studio resolutions of
each changed object were rendered in headless Chromium and compared to the same source
photo, using the existing camera, default environment, exposure 1 and shadow intensity/softness 1.
Four base-model iterations replaced regular moiré and broad streaks with finer irregular grain.
The reduced-resolution normal images use higher encoding quality so grain survives compression.

| Surface            | Median base colour (sRGB) | Median roughness | Metallic |
| ------------------ | ------------------------- | ---------------- | -------- |
| Espresso steel     | 195, 197, 199             | 96/255 (0.38)    | 255/255  |
| Lamp brass         | 195, 173, 128             | 96/255 (0.38)    | 255/255  |
| Crate exposed iron | 116, 113, 111             | 96/255 (0.38)    | 255/255  |

Values describe the studio base atlases; the evidence manifest contains every resolution.
Roughness p10–p90 spans at least 16 levels, with finer streaks and raised roughness on existing
edge ridges. Steel/brass use new tangent-space normal images at scale 0.8. Read-only triangle
positions and UVs align grain across atlas islands. The metal channel is losslessly encoded
as 0 or 255, with separate masks for espresso grips/knobs, dial cover and rear reservoir.
The printed dial and reservoir colour come from the original atlas. Glass remains opaque in
these single-material assets; this pass corrects its material class without inventing transparency.
Crate wood colour stays within recompression tolerance and its normal image is unchanged.

The swivel-chair photo shows a glossy black coated ring rather than exposed bare steel.
Its five GLBs, cloth, poster and earlier sheet remain unchanged. Painted barrel surfaces and
all other dielectric objects are untouched. No changed studio object has a showcase poster,
so no poster or blog measured figure changes are needed in this follow-up.

The new renders show stronger specular highlights and darker reflected regions than aaf08a0.
The source-photo lighting differs from the fixed viewer environment. Existing mesh distortion
and low-resolution faceting are more noticeable in shiny metal, especially espresso LOD2;
geometry, vertex normals, topology and transforms were deliberately preserved.

Follow-up evidence is isolated in `.data/showcase-material-evidence-metal/` (gitignored):
immutable aaf08a0 copies, editing and capture scripts, masks, intermediate renders, all 12
before/after captures and comparisons, a SHA-256/size/material manifest, and verification logs.
The original `.data/showcase-material-evidence/` tree is retained.

- `python3 scripts/check-showcase-materials.py --asset-ref aaf08a0` fails the new metal checks.
- `python3 scripts/check-showcase-materials.py` passes for all 49 tracked variants, including
  geometry bytes against e615ff6, binary metal separation, colour bands, mapped roughness,
  effective normal detail, preserved dielectrics, catalog sizes and untouched objects.
- All 12 changed variants load without Chromium page errors in the fixed comparison setup.
- `python3 scripts/check-armchair-materials.py` and `bun run preflight` pass. Scratch-database
  integration tests retain their expected skips. iPhone Quick Look remains untested.

## Original evidence and verification

Local evidence: `.data/showcase-material-evidence/` (gitignored). It contains immutable originals,
texture extracts, masks, editing/capture scripts, SHA-256/size manifest, before/after renders and
contact sheets for all 49 variants, actual studio card captures, poster captures, USDZ exports
and command logs. The committed comparison sheets use only public source photos and new
local renders; no owner captures or audit files are included.

- `python3 scripts/check-showcase-materials.py --asset-ref e615ff6` reproduces failures on
  all 49 original variants; the same command without `--asset-ref` passes after the corrections.
- The check compares geometry buffer payloads (including compressed data), accessors, UVs,
  indices, meshes, nodes, transforms and topology against `e615ff6`. They are byte-identical.
  It also checks material colour/response/detail, size bounds, catalog sizes, poster alpha and
  dimensions, texture decoding, and preservation of unrelated GLBs/colliders.
- Headless Chromium loaded all 49 variants before and after without page errors, at fixed
  model-viewer lighting: default environment, exposure 1, shadow intensity/softness 1.
  Studio comparisons use `210deg 75deg auto`, except espresso/sofa (`30deg`),
  sneaker/swivel-chair (`300deg`) and bedside-table (`-60deg`). Sofa backs use `210deg`.
- All 12 actual studio card renderers were captured before and after with their existing
  lighting and material finishing code unchanged.
- `python3 scripts/check-armchair-materials.py` and `bun run preflight` pass.
  Database-backed integration tests retain their usual skips without a scratch database.

Finish condition: all requested textured variants corrected and visually compared, geometry
preserved, existing poster/export paths following the corrected GLBs, and metadata matching
actual bytes. This change is submitted for review without merging or deploying production.
