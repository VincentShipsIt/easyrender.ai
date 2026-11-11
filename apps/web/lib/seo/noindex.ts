// The pages that must stay out of the index, in one list, because it is enforced in three
// places: a meta tag on the page, an x-robots-tag header from next.config.ts, and an assertion
// that the sitemaps never list any of them. No imports, so next.config.ts can read it too.
//
//  - /explore, /hub and /r/* are the gallery, the element hub and the model pages: product
//    surfaces that grow on their own, parked until decision 2's three conditions are met.
//  - /lp/* are ad landings. They are noindex but deliberately crawlable, because AdsBot has to
//    fetch them, which is why none of this is done with a Disallow.
//  - /sign-in, /sign-up and /oauth are auth.
//  - /compare/* are the English comparison drafts, open for review only (`review` in routes.ts)
//    until Jorge approves publishing them. Publishing one means taking this prefix out, moving
//    `en` to `published` and letting the sitemap pick it up.

export const NOINDEX_PREFIXES = [
  '/explore',
  '/hub',
  '/r/',
  '/lp/',
  '/sign-in',
  '/sign-up',
  '/oauth',
  '/compare',
] as const;

/** The same set as next.config.ts route patterns, for the response header. */
export const NOINDEX_HEADER_PATHS = [
  '/explore',
  '/hub',
  '/r/:id',
  '/lp/:path*',
  '/compare',
  '/compare/:path*',
];

/** True when a path must carry noindex. */
export const isNoindexPath = (path: string): boolean =>
  NOINDEX_PREFIXES.some((prefix) =>
    prefix.endsWith('/')
      ? path.startsWith(prefix)
      : path === prefix || path.startsWith(`${prefix}/`),
  );
