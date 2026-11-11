---
name: materials-metal-tube
description: Tube bending limits for chair and table frames, so generated metal legs have makeable bends
type: reference
---

- Keep centerline bend radius (CLR) at least 2x the tube diameter, 7x for roll bending; below 2x
  needs special tooling and more risk (Xometry tube bending design tips, updated 2026-03-12).
- Keep at least 2x diameter of straight tube between bends; avoid knots, tight coils, bends over
  180 degrees and tubes that cross themselves (Xometry).
- Steel, stainless, aluminium and brass all bend; some stainless grades need about 50% more power
  than carbon steel; thin-walled tube may wrinkle or flatten without a mandrel (Fractory).
- Not found in these sources: ovality, wall-thinning and springback figures.

**Why:** cantilever chairs and hairpin legs are the common metal furniture; kinks and impossible
loops give the game away.
**How to apply:** the `metal` profile in `materials.ts` carries the 2x rule. Cast and sheet metal
rules in that profile are general practice and unsourced here.

Sources: xometry.com/resources/tube/tube-bending-design-tips; fractory.com steel and aluminium
tube bending page.
