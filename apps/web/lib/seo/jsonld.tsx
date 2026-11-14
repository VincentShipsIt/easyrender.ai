import { type PricingVariant, PUBLIC_PLAN_IDS, pricingFor } from '@easyrender/harness';
import { HTML_LANG, type Locale } from '@/i18n/config';
import { ROUTES } from './routes';
import { absoluteUrl, OG_IMAGE, OG_IMAGE_SIZE, SITE_NAME, SITE_URL } from './site';

// Structured data, built from what the site actually publishes. Nothing here may carry a rating,
// a user count, a price the pricing page does not show, or a real-world size: see
// decisiones/claims.md.

type Thing = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SOFTWARE_ID = `${SITE_URL}/#software`;

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
export function softwareApplication(
  locale: Locale,
  description: string,
  variant: PricingVariant = 'control',
): Thing {
  const { creditUsd: CREDIT_USD, payg: PAYG, plans: SUBSCRIPTION_PLANS } = pricingFor(variant);
  return {
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
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
        url: absoluteUrl(ROUTES.pricing.paths.en),
      },
      ...PUBLIC_PLAN_IDS.map((id) => ({
        '@type': 'Offer',
        name: SUBSCRIPTION_PLANS[id].label,
        price: (SUBSCRIPTION_PLANS[id].priceCents / 100).toFixed(2),
        priceCurrency: 'USD',
        description: `${SUBSCRIPTION_PLANS[id].monthlyCredits} credits every month.`,
        url: absoluteUrl(ROUTES.pricing.paths.en),
      })),
    ],
  };
}

/**
 * The page itself, so the graph says which page in which language the FAQ and the product belong
 * to. Each locale's home is its own WebPage under the one WebSite.
 */
export function webPage(locale: Locale, path: string, name: string, description: string): Thing {
  const url = absoluteUrl(path);
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: HTML_LANG[locale],
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': SOFTWARE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function faqPage(items: { question: string; answer: string }[], id?: string): Thing {
  return {
    '@type': 'FAQPage',
    ...(id ? { '@id': id } : {}),
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

/**
 * A guide. BlogPosting, signed by its author: a named Person only when one has been agreed,
 * otherwise the easyrender team as an Organization. dateModified is never earlier than
 * datePublished, even for a post that was edited before its publication day.
 */
export function article(post: {
  locale: Locale;
  title: string;
  description: string;
  date: string;
  updated?: string;
  path: string;
  keyword?: string;
  author?: { name: string; type: 'Person' | 'Organization'; url?: string };
  image?: { src: string; width: number; height: number };
}): Thing {
  const url = absoluteUrl(post.path);
  const image = post.image ?? { src: OG_IMAGE, ...OG_IMAGE_SIZE };
  const author = post.author ?? { name: 'easyrender team', type: 'Organization' as const };
  const modified = post.updated && post.updated > post.date ? post.updated : post.date;
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    url,
    headline: post.title,
    description: post.description,
    inLanguage: HTML_LANG[post.locale],
    datePublished: post.date,
    dateModified: modified,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@id': WEBSITE_ID },
    image: {
      '@type': 'ImageObject',
      url: absoluteUrl(image.src),
      width: image.width,
      height: image.height,
    },
    ...(post.keyword ? { keywords: post.keyword } : {}),
    author: {
      '@type': author.type,
      name: author.name,
      url: author.url
        ? /^https?:/.test(author.url)
          ? author.url
          : absoluteUrl(author.url)
        : SITE_URL,
      ...(author.type === 'Organization' ? { parentOrganization: { '@id': ORGANIZATION_ID } } : {}),
    },
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
