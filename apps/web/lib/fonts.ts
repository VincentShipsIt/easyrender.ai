import localFont from 'next/font/local';

// Geist is the product face (dashboard, credits, auth). It is declared here instead of imported
// from `geist/font/*` so it can opt out of preloading: the root layout would otherwise preload
// both files (~140 KB) on every page, including the studio marketing pages, which paint their
// first screen in Mona Sans and Martian Mono and only use Geist far below the fold. Without the
// preload the browser fetches a Geist file the first time text actually uses it; `swap` keeps
// that text visible in the fallback face meanwhile.
//
// The files are Geist 1.9.2 cut down to what the site uses: the Latin, Latin-1 and Latin
// Extended-A characters every language here needs, plus punctuation, currency, arrows and math,
// and the weight axis limited to 400-700 (normal to bold). 66 KB for both instead of 141 KB.
// Every first paint that uses them gets there sooner, the guides hub most of all. How they
// were made: font-files/README.md.
export const geistSans = localFont({
  src: './font-files/Geist-latin.woff2',
  variable: '--font-geist-sans',
  weight: '400 700',
  display: 'swap',
  preload: false,
});

export const geistMono = localFont({
  src: './font-files/GeistMono-latin.woff2',
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
  weight: '400 700',
  display: 'swap',
  preload: false,
});
