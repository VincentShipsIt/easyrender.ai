import { sideboardPhotoPick, storeFiles } from './ecommerce';
import { glbAnatomy, quickLookPath, usdzAnatomy } from './formats';
import type { Diagram } from './kit';
import { blockoutSideTable, methodDecisionTree, photogrammetryRings } from './methods';
import { imageTo3dPipeline, photoVsPhotogrammetry } from './photo-to-3d';
import { cameraHeight, lensDistance, windowLightSetup } from './photography';
import { listingTitle, vintageShotList } from './vintage';

// Every diagram a guide can show, by the name used after `diagram:` in the markdown. The names
// are also listed in lib/blog/images.ts (BLOG_DIAGRAMS), which stays free of React so the parser
// and its tests do not load components; content.test.ts checks that the two lists match.
export const DIAGRAMS: Record<string, Diagram> = {
  'photo-vs-photogrammetry': photoVsPhotogrammetry,
  'image-to-3d-pipeline': imageTo3dPipeline,
  'window-light-setup': windowLightSetup,
  'camera-height': cameraHeight,
  'lens-distance': lensDistance,
  'store-files': storeFiles,
  'sideboard-photo-pick': sideboardPhotoPick,
  'vintage-shot-list': vintageShotList,
  'listing-title': listingTitle,
  'glb-anatomy': glbAnatomy,
  'method-decision-tree': methodDecisionTree,
  'photogrammetry-rings': photogrammetryRings,
  'blockout-side-table': blockoutSideTable,
  'usdz-anatomy': usdzAnatomy,
  'quick-look-path': quickLookPath,
};
