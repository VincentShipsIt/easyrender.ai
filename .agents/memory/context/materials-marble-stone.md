---
name: materials-marble-stone
description: What marble and stone can and cannot be, so generated tables, tops and sculptural pieces stay makeable
type: reference
---

Verdict on "can we bend marble into crazy angles?": for solid marble, no. Checked 2026-11-11.

- Stone is brittle: strong in compression, weak in bending and tension (Dynamic Stone Tools
  fabrication guide; SlabWise span guide: "stone fails in bending, not in compression").
- ASTM C503 (marble dimension stone, 2022 edition) only requires a modulus of rupture and flexural
  strength of 1000 psi (6.9 MPa) for both classes (I calcite, II dolomite), compressive 7500 psi
  (52 MPa), absorption max 0.20%. These are minimums, not typical values.
- Overhang limits for 3 cm slabs are short and sources disagree: marble 6-8 in (SlabWise overhang
  guide) vs 10-12 in (SlabWise span guide, Dynamic Stone Tools). Past ~12 in needs corbels, a leg
  or a hidden steel channel; seating overhangs of 18-24 in "need support". Strips under 3 in wide
  are fragile. Heavy ogee/waterfall edges cut the safe limit. A mitered waterfall edge does not
  support the top.
- 2 cm slabs need a plywood sub-top and lose 2-4 in off every limit (SlabWise).
- Curves that exist are not bent stone: they are shallow, or cut from a thick block (CNC, turning,
  carving: general industry practice, not covered by the pages above, so unverified here), or
  they are veneer products. Vendor claims, not tested: Caron Stone sells 1.5-2 mm marble veneer
  on a fiberglass-resin backing "for curved surfaces" (no radius given) and factory-curved
  3-5 mm marble on aluminium honeycomb panels, "radius as tight as 300 mm". Those are cladding,
  not a solid table.
- Polish is fine: marble takes a high gloss. Thin cantilevers, hairline legs, knife edges and
  ribbon curves are what a viewer who knows stone will reject.

**Why:** Vincent expects renders to be a credible starting point for professionals, and the image
model happily draws marble like clay.
**How to apply:** the `stone` profile in `packages/harness/src/materials.ts` carries these rules
into the sheet prompt. Tune the wording there, change figures here with their source.

Sources: dynamicstonetools.com (stone countertop furniture legs and kneewalls guide);
slabwise.com/guides (maximum span; overhang over 12 inches); ASTM C503/C503M-22 preview at
cdn.standards.iteh.ai; Natural Stone Council marble fact sheet; caronstone.com product pages.
