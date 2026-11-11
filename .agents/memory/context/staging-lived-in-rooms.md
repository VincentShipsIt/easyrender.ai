---

name: staging-lived-in-rooms
description: Rules for staged room scenes (table and chairs in a living room) that look lived in and not repeated
type: reference
---

There is no scene pipeline in code yet; the harness builds turnaround sheets and GLBs only. These
are the rules for when scene generation is added (a skill file plus a seeded variation step).

Sources agree on:
- Group objects in odd numbers (3, 5, 7), vary height, shape and texture, e.g. one vertical, one
  horizontal, one sculptural (Livingetc 3-5-7 rule; Havenly layering; Apartment Therapy).
- Coordinate, do not match: matching sets, perfect symmetry and "matchy-matchy" read as catalog
  (Apartment Therapy, Livingetc, Havenly). Asymmetry reads more natural (Havenly, Livingetc),
  except formal dining where equal chair counts are expected.
- Layer: throws, pillows (vary size and shape, not all matched), a smaller rug over a larger neutral
  one, overlap items; "lived-in, not a calculated arrangement" (Havenly). Every item should relate
  to another by colour or material, or it reads as clutter.
- Do not fill every shelf; leave gaps between groups (Livingetc).
- Spacing: at least 18 in between furniture in small rooms, about double in large ones; do not
  push everything to the walls (Apartment Therapy). Rug: front legs of sofa and chairs on it,
  or all legs; about 8-10 in under the sofa front when the sofa sits at the wall (Livingetc);
  about 18 in of bare floor to the walls, 8 in in small rooms (Houzz); at least 24 in beyond a
  dining table (Houzz).
- Plants, mirrors, lamps plus natural light and dimmers add depth (Apartment Therapy).
- Note: Apartment Therapy's "keep it neutral, no personal items" is staging-for-sale advice. For
  "someone lives here" add a life layer: a half-read book, a throw, a mug, a plant.

Not found in these sources: coffee-table-to-sofa distance, walkway widths, plant counts.

**Why:** Vincent wants showcase scenes that look inhabited and differ from one render to the next.
**How to apply:** when building the scene step, pick a seeded "life layer" per render (prop set,
rug, plant, throw, lighting mood) from pools so two renders of the same table never share one
set-dressing, and put the rules above in a skill. Mixed materials (wood, stone, textile) in one
scene must each follow their `materials-*` file.

Sources: apartmenttherapy.com (24 living room staging tips); livingetc.com (3-5-7 rule; rug guide);
havenly.com (layering); houzz.com (11 area rug rules).
