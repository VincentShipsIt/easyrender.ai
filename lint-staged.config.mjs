export default {
  '*.{js,jsx,ts,tsx,mjs,json,jsonc,css}': (files) =>
    `biome check --write --no-errors-on-unmatched ${files.join(' ')}`,
  '*.{ts,tsx}': () => 'bun scripts/check-ui-guards.ts',
};
