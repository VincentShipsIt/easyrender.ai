---

name: material-edits
description: How owner material edits are stored and served, and what a one-material GLB limits
type: project
---

- Edits live in `Render.materialEdits` (JSON list of `{index, baseColor?, roughness?, metalness?}`
  by glTF material index). The stored GLB at `glbKey` is never rewritten. The model route applies
  the edits with `applyMaterialEdits` (`packages/harness/src/glb.ts`, JSON chunk only) on every
  serve, so GLB downloads, USDZ export and the public viewer all show them. Reset = empty list.
- `baseColorFactor` is linear RGB; the picker is sRGB (`apps/web/lib/color.ts`).
- Today's pipeline GLBs have one mesh and one material, with no factors in the file. glTF then
  means metallic 1 and roughness 1, which is why a generated model looks dull until edited.
- A tint on a one-material model tints the whole object (chair and chrome legs together). Real
  per-part editing needs the part pipeline in `/mnt/project-files/material-swap/design.md`.
- Finish roughness values (stone 0.25, wood 0.65, metal 0.3) are general-practice starting points,
  not a sourced table; metalness is binary. See [PBR values](materials-pbr-reference.md).

**Why:** users expect to swap a material and redo one part; this is the model-independent base.
**How to apply:** build the part pipeline on top of this edit layer; do not store edits in the GLB.
