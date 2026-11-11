---
name: materials-wood
description: How solid wood, steam-bent, laminated and veneer parts are made, and what looks wrong in a render
type: reference
---

- Short grain is "the curse of the sawn curve": the tighter a sawn curve, the likelier a structural
  or visual problem (Fine Woodworking, Brian Boggs, "Creating Curved Furniture").
- Steam bending needs species and straight grain: white and red oak and white ash are the safe
  choices; cherry needs a compression strap; walnut varies; many tropical woods do not steam-bend
  (Fine Woodworking, "The best woods for steam-bending"). Air-dried stock at 15-20% moisture.
- Bent lamination: strips about 1/16 to 1/8 in thick, thinner allows a tighter radius, long grain
  all through, virtually no springback, works with almost any wood (Woodsmith; Boggs).
- Kerf-bent plywood does not hold its shape alone; it needs a frame or a veneer back (Woodsmith).
- No radius-to-thickness ratio or steam time was found in these sources: do not invent one.

**Why:** a thin leg or arm with a tight bend reads as a render, not a product a workshop can make.
**How to apply:** the `wood` profile in `materials.ts` asks for grain along each part and curves
only as bent, laminated or thick sawn parts. A dedicated per-species table is future research.

Sources: finewoodworking.com 2021-05-11 and 2018-03-20 articles; woodsmith.com bending-wood article.
