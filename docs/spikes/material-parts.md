# Spike: PBR and part-aware 3D models for material swap

Date: 2026-11-13. Status: measured on two photos at most per model; geometry and texture quality
were not judged by a person yet (see "Not measured").

Question: which Replicate models can give us (a) real roughness and metalness data and (b) an
object split into parts, so a user can swap the material of one part and redo only that part. It
follows the single-material edit layer in #58 and the design in the material-swap design note.

## How it was run

`.github/workflows/parts-spike.yml` runs `packages/harness/scripts/parts-spike.ts` on the GitHub
runner with the `REPLICATE_API_TOKEN` secret (account shipshitdev), 5 USD cap. Every candidate
gets the same single showcase photo. The script reads each GLB and reports meshes, materials and
which texture maps exist. Runs: 43480026324 (baseline), 43500385389, 43519929527. Cost is
`predict_time` times the model's per-second rate, so it is an estimate, not an invoice.

## Results

| Photo        | Model                           | Result                                                 | Time  | Cost    | Meshes | Materials | Maps colour/MR/normal |
| ------------ | ------------------------------- | ------------------------------------------------------ | ----- | ------- | ------ | --------- | --------------------- |
| armchair     | `firtoz/trellis` (today)        | ok                                                     | 38 s  | $0.053  | 1      | 1         | 1/0/0                 |
| coffee-table | `firtoz/trellis` (today)        | ok                                                     | 33 s  | $0.046  | 1      | 1         | 1/0/0                 |
| armchair     | `ndreca/hunyuan3d-2.1` (PBR on) | ok                                                     | 123 s | $0.120  | 1      | 1         | 1/1/0                 |
| coffee-table | `ndreca/hunyuan3d-2.1`          | failed: no result in 20 min                            | -     | unknown | -      | -         | -                     |
| armchair     | `fire/part-crafter`             | ok                                                     | 36 s  | $0.050  | 4      | 0         | 0/0/0                 |
| coffee-table | `fire/part-crafter`             | failed: no result in 20 min                            | -     | unknown | -      | -         | -                     |
| armchair     | `fishwowater/trellis2`          | failed: stayed "processing" for 10 min, then cancelled | -     | unknown | -      | -         | -                     |
| coffee-table | `fishwowater/trellis2`          | failed: no result in 20 min                            | -     | unknown | -      | -         | -                     |

Part names in the PartCrafter GLB: `geometry_0` to `geometry_3`. Hunyuan's single mesh is named
`textured_mesh.obj`. TRELLIS (today) names are `world` and `geometry_0`.

## What this shows

- **Today's TRELLIS cannot support swapping.** One mesh, one material, a baked colour texture and
  no roughness or metalness data. Confirmed again on generated output, not only on the showcase files.
- **Hunyuan 2.1 gives real PBR data, not parts.** A metallic-roughness map is present, so shine can
  differ across the surface, but it is still one mesh and one material. It cost about 2.3 times
  today's model and took about 3 times as long on the one run that finished.
- **PartCrafter gives parts, not materials.** Four separate meshes for the armchair at about the
  cost of today's model, with no materials or textures at all. Whether the four meshes are
  sensible parts (seat, back, arms, legs) was not checked.
- **No single model gave both.** A part pipeline would need part-aware geometry first, then a
  texture and PBR pass per part. That second step was not tested.
- **TRELLIS.2 did not finish.** The one run with a log reached "Sampling shape SLat 9/12" and was
  still "processing" 10 minutes later, so it looks hung after that stage rather than cold-starting.
  Treat it as unreliable on Replicate until it is re-tested.

## Reliability

Of eight attempts on the three community models, two finished (Hunyuan armchair, PartCrafter
armchair) and six produced nothing in 10 to 20 minutes. The armchair PartCrafter and TRELLIS.2
runs were attempted twice: PartCrafter timed out the first time and finished in 36 s the second,
so a first call can stall (likely a cold start) and a retry can work; TRELLIS.2 failed both
times. The first run's script did not cancel the stuck predictions, so what those cost is
unknown. From #146 on, the script cancels a stuck prediction and records its status and log tail.
Any of these models in the product needs a timeout, a cancel and a refund path (credits rule: a
failed job refunds), and probably one retry.

## Licences (read from the model pages, not legal advice)

- Hunyuan 2.1: the licence excludes the EU, UK and South Korea. We sell in the euro area, so it
  cannot be the production model there without a different agreement.
- PartCrafter fork: MIT. TRELLIS.2: MIT. PartPacker (NVIDIA): non-commercial, not run.

## Not measured

- Whether the parts or the surfaces look right. The GLBs are in the run artifacts
  (`parts-spike`, runs 43500385389 and 43519929527); a person has to open them.
- Per-part retexture, and any texturing model run on a part mesh.
- Cost of the cancelled and timed-out predictions. Check the Replicate usage page.
- Coffee-table runs of PartCrafter and TRELLIS.2 with the fixed script.

## Recommendation

1. Ship the foundation that exists (#58): material edits on any GLB with several materials work
   today and are free.
2. Before building a part pipeline, a person opens the PartCrafter armchair GLB. If the four
   parts are usable, the next spike is geometry from PartCrafter plus a texture pass on each part
   (PBR-capable texturing model), one product, with timeouts and cancel in place.
3. Do not adopt Hunyuan 2.1 for euro-area users because of its licence. Do not adopt TRELLIS.2
   until a run finishes.
