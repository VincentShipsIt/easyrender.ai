import { CREDIT_USD, PAYG, PRO_PLAN } from '@easyrender/harness';
import { HTML_LANG, type Locale } from '@/i18n/config';
import { absoluteUrl, OG_IMAGE, SITE_NAME, SITE_URL } from './site';

// Structured data, built from what the site actually publishes. Nothing here may carry a rating,
// a user count, a price the pricing page does not show, or a real-world size: see
// decisiones/claims.md.

type Thing = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// No logo and no sameAs: the site has neither a logo file nor a confirmed social profile, and a
// structured-data property pointing at a 404 is worse than a missing one.
export function organization(): Thing {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function website(locale: Locale): Thing {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: HTML_LANG[locale],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/**
 * The product itself. Offers are the two the pricing page publishes: credits by the unit, and
 * the Pro subscription. Both read from the harness, so a price change cannot drift from code.
 */
export function softwareApplication(locale: Locale, description: string): Thing {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    inLanguage: HTML_LANG[locale],
    description,
    publisher: { '@id': ORGANIZATION_ID },
    offers: [
      {
        '@type': 'Offer',
        name: 'Pay as you go',
        price: (PAYG.min * CREDIT_USD).toFixed(2),
        priceCurrency: 'USD',
        description: `From ${PAYG.min} credits at $${CREDIT_USD.toFixed(2)} each. Credits never expire.`,
        url: absoluteUrl('/credits'),
      },
      {
        '@type': 'Offer',
        name: PRO_PLAN.label,
        price: (PRO_PLAN.priceCents / 100).toFixed(2),
        priceCurrency: 'USD',
        description: `${PRO_PLAN.monthlyCredits} credits every month.`,
        url: absoluteUrl('/credits'),
      },
    ],
  };
}

export function faqPage(items: { question: string; answer: string }[]): Thing {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function breadcrumbList(items: { name: string; path: string }[]): Thing {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function article(post: {
  locale: Locale;
  title: string;
  description: string;
  date: string;
  updated?: string;
  path: string;
}): Thing {
  return {
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    inLanguage: HTML_LANG[post.locale],
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(post.path) },
    image: absoluteUrl(OG_IMAGE),
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/**
 * Emits one @graph for the page. A single script keeps the nodes cross-referenced by @id, which
 * is what lets the Article point at the Organization instead of repeating it.
 */
export function JsonLd({ graph }: { graph: Thing[] }) {
  const payload = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has to be script content, and this is JSON.stringify of our own data
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: payload }} />
  );
}
