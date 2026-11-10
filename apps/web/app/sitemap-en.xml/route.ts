import { localeSitemapXml, xmlResponse } from '@/lib/seo/sitemap';

export const revalidate = 600;

export const GET = () => xmlResponse(localeSitemapXml('en'));
