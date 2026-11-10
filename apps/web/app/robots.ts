import type { MetadataRoute } from 'next';
import { DISALLOWED_PREFIXES } from '@/lib/seo/routes';
import { SITE_URL } from '@/lib/seo/site';

// What crawlers may fetch. Staying out of the index is a meta robots job, not a Disallow one: a
// page blocked here can still be indexed from a link, and a blocked page's noindex is never
// read. So /explore, /r/ and /lp/ are crawlable and carry noindex, and in particular /lp/ must
// stay crawlable because Google's AdsBot has to reach the ad landings.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: [...DISALLOWED_PREFIXES] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
