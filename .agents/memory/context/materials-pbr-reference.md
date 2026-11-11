---
name: materials-pbr-reference
description: PBR (glTF metallic-roughness) reference values to use when material swap writes materials
type: reference
---

- Metallic is authored as 0 or 1 (non-metal or raw metal); intermediate values only for dirt or
  thin coatings. Painted, oxidised or weathered metal is a dielectric (Adobe Substance PBR Guide
  part 2). Raw metal base colour sits at about 180-255 sRGB.
- Dielectric reflectance is fixed at 4% (F0 0.04); glTF core assumes IOR 1.5 (Khronos glTF PBR page
  and Adobe guide).
- Base colour should avoid values below about 30-50 sRGB and above 240 sRGB, and contain no baked
  lighting (Adobe guide, partly read from a summary).
- Roughness runs 0 (smooth) to 1 (rough). Per-material roughness ranges were not found in these
  sources; do not hard-code a table until one is sourced. Polished marble and brushed metal are
  low-to-mid, fabric and matte wood high, by general practice only.
- Today's GLBs have one mesh, one material and a base-colour texture only (see
  `/mnt/project-files/material-swap/design.md`), so nothing here is applied yet.

**Why:** the Material swap work needs sane presets so a swapped leather or oak still looks real.
**How to apply:** use `materials.ts` profile ids (`stone`, `wood`, `metal`) as the preset names for
part materials; keep metallic binary; check values against the sources before shipping presets.

Sources: khronos.org/gltf/pbr; adobe.com/learn/substance-3d-designer/web/the-pbr-guide-part-2.
