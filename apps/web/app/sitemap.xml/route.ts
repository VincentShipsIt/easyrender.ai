import { sitemapIndexXml, xmlResponse } from '@/lib/seo/sitemap';

// The index. Only locales that have something to list appear, so a crawler never follows a
// pointer to an empty sitemap. Revalidated often enough that a post scheduled for today shows
// up without a deploy.
export const revalidate = 600;

export const GET = () => xmlResponse(sitemapIndexXml());
