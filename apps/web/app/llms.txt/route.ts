import { llmsTxt, textResponse } from '@/lib/seo/llms';

// https://easyrender.ai/llms.txt, generated from the route registry like the sitemaps, so it can
// only list indexable pages. Revalidated as often as the sitemaps for scheduled guides.
export const revalidate = 600;

export const GET = () => textResponse(llmsTxt());
