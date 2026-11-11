import { getBalance } from '@easyrender/core';
import { Box, Coins, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { SiteMenu } from '@/components/site-menu';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/config';
import { currentUser } from '@/lib/actor';
import { ROUTES } from '@/lib/seo/routes';

// Anchors are relative to the home of the visitor's language, so nothing here leaves the branch
// they are reading. /hub is the same page in every language (product, English, noindex).
const NAV = [
  { hash: '#how-it-works', key: 'howItWorks' },
  { href: '/hub', key: 'hub' },
  { hash: '#connect', key: 'connect' },
  { hash: '#try', key: 'try' },
  { hash: '#pricing', key: 'pricing' },
] as const;

export async function SiteHeader() {
  // Per-request: the header reads the session, so no page (404 included) is prerendered against the database.
  await connection();
  const user = await currentUser().catch(() => null);
  const balance = user ? await getBalance(user.id).catch(() => 0) : 0;
  const [t, format, locale] = await Promise.all([
    getTranslations('Header'),
    getFormatter(),
    getLocale(),
  ]);
  const home = ROUTES.home.paths[locale as Locale];
  const navHref = (item: (typeof NAV)[number]) =>
    'href' in item ? item.href : `${home}${item.hash}`;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* One row at every width: section links only from xl, sign-in (or the balance) from sm,
          the language dropdown always, signed in or not. Whatever is hidden moves into the menu, so nothing is cut off at 320px. */}
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href={home} className="flex items-center gap-2 font-semibold tracking-tight">
            <Box className="size-5" />
            {/* Icon only on the narrowest phones so the header actions still fit. */}
            <span className="max-[400px]:sr-only">easyrender</span>
          </Link>
          <nav aria-label={t('sections')} className="hidden items-center gap-1 xl:flex">
            {NAV.map((item) => (
              <Button key={item.key} variant="ghost" size="sm" asChild>
                <Link href={navHref(item)} className="text-muted-foreground">
                  {t(`nav.${item.key}`)}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <LocaleSwitcher />
          {user ? (
            <>
              {/* The balance moves into the menu below sm, like sign-in when signed out: the
                  language dropdown and Dashboard keep the row ("Tableau de bord" at 320px). */}
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/credits">
                  <Coins />
                  {format.number(balance)} {t('credits')}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  {t('dashboard')}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/sign-in">{t('signIn')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`${home}#connect`}>
                  {/* One text run, so the button's flex gap does not double the space before the suffix. */}
                  <span>
                    {t('connect')}
                    {t('connectSuffix') ? (
                      <span className="hidden sm:inline"> {t('connectSuffix')}</span>
                    ) : null}
                  </span>
                </Link>
              </Button>
            </>
          )}
          <SiteMenu openLabel={t('menuOpen')} closeLabel={t('menuClose')}>
            <nav aria-label={t('sections')} className="flex flex-col">
              {NAV.map((item) => (
                <Button key={item.key} variant="ghost" className="justify-start" asChild>
                  <Link href={navHref(item)} className="text-muted-foreground">
                    {t(`nav.${item.key}`)}
                  </Link>
                </Button>
              ))}
              {user ? (
                <Button variant="ghost" className="justify-start sm:hidden" asChild>
                  <Link href="/credits">
                    <Coins />
                    {format.number(balance)} {t('credits')}
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" className="justify-start sm:hidden" asChild>
                  <Link href="/sign-in">{t('signIn')}</Link>
                </Button>
              )}
            </nav>
          </SiteMenu>
        </div>
      </div>
    </header>
  );
}
