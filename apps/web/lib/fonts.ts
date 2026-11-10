import localFont from 'next/font/local';

// Geist is the product face (dashboard, credits, auth). It is declared here instead of imported
// from `geist/font/*` so it can opt out of preloading: the root layout would otherwise preload
// both files (~140 KB) on every page, including the studio marketing pages, which paint their
// first screen in Mona Sans and Martian Mono and only use Geist far below the fold. Without the
// preload the browser fetches a Geist file the first time text actually uses it; `swap` keeps
// that text visible in the fallback face meanwhile.
export const geistSans = localFont({
  src: '../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
  preload: false,
});

export const geistMono = localFont({
  src: '../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2',
  variable: '--font-geist-mono',
  adjustFontFallback: false,
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Roboto Mono',
    'Menlo',
    'Monaco',
    'Liberation Mono',
    'DejaVu Sans Mono',
    'Courier New',
    'monospace',
  ],
  weight: '100 900',
  display: 'swap',
  preload: false,
});
