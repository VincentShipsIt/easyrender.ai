// The home FAQ, in the order the page shows it. Pure, so the page, the FAQPage structured data and
// llms-full.txt all read the same list. Definition and output come first: those are the answers
// search engines and AI assistants quote.
export const FAQ_KEYS = [
  'what',
  'output',
  'formats',
  'freePreview',
  'cost',
  'photos',
  'scope',
  'ar',
  'failed',
  'public',
  'connect',
  'needAgent',
] as const;

export type FaqKey = (typeof FAQ_KEYS)[number];
