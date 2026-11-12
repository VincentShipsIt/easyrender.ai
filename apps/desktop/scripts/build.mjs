// Bundles the Electron main process and the preload script into dist/.
// The renderer is the hosted web app (apps/web); there is nothing to bundle for it.
import { build } from 'esbuild';

const shared = { bundle: true, platform: 'node', target: 'node22', external: ['electron'] };

await Promise.all([
  build({ ...shared, entryPoints: ['src/main.ts'], outfile: 'dist/main.js', format: 'cjs' }),
  // A sandboxed preload has to be a single CommonJS file that only requires electron.
  build({ ...shared, entryPoints: ['src/preload.ts'], outfile: 'dist/preload.cjs', format: 'cjs' }),
]);
