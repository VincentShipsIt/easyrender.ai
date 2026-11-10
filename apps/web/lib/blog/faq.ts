// The FAQ heading in each language. The section runs from that `## ` heading to the next one, with
// one `### question` per item. The loader reads it for the FAQPage structured data (posts.ts) and
// the renderer turns the same lines into the accordion (markdown.tsx), so the questions a crawler
// reads in the JSON-LD are always the ones a reader can open on the page.
const FAQ_HEADINGS: ReadonlySet<string> = new Set([
  'faq',
  'faqs',
  'preguntas frecuentes',
  'häufige fragen',
  'questions fréquentes',
  'domande frequenti',
  'perguntas frequentes',
]);

export const isFaqHeading = (text: string): boolean => FAQ_HEADINGS.has(text.trim().toLowerCase());
