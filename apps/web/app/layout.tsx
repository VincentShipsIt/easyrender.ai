import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { HTML_LANG, type Locale } from '@/i18n/config';
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
  const locale = (await getLocale()) as Locale;
  return (
    <html lang={HTML_LANG[locale]} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
