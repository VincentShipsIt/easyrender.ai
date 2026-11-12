import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { HTML_LANG, type Locale, PATH_HEADER } from '@/i18n/config';
import { pickClientMessages } from '@/lib/client-messages';
import { geistMono, geistSans } from '@/lib/fonts';
import { SITE_URL } from '@/lib/seo/site';
import './globals.css';

// metadataBase makes every relative canonical, Open Graph and sitemap URL absolute against the
// canonical origin, so a preview deployment never emits its own host in an indexable tag.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');
  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [locale, messages, requestHeaders] = await Promise.all([
    getLocale(),
    getMessages(),
    headers(),
  ]);
  // The Shopify app's page runs inside the Shopify admin, which needs App Bridge loaded first in the head.
  const isShopifyApp = requestHeaders.get(PATH_HEADER) === '/shopify';
  return (
    <html
      lang={HTML_LANG[locale as Locale]}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      {isShopifyApp && (
        <head>
          <meta name="shopify-api-key" content={process.env.SHOPIFY_API_KEY ?? ''} />
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
        </head>
      )}
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <NextIntlClientProvider messages={pickClientMessages(messages)}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
