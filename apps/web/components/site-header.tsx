import { LayoutDashboard } from 'lucide-react';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { BrandMark } from '@/components/brand-mark';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { SiteLink as Link } from '@/components/site-link';
import { SiteMenu } from '@/components/site-menu';
import { Button } from '@/components/ui/button';
import { type Locale, PATH_HEADER } from '@/i18n/config';
import { currentUser } from '@/lib/actor';
import { isPublished, ROUTES } from '@/lib/seo/routes';

// Anchors are relative to the home of the visitor's language, so nothing here leaves the branch
// they are reading. /hub is the same page in every language (product, English, noindex).
const NAV = [
  { hash: '#how-it-works', key: 'howItWorks' },
  { href: '/hub', key: 'hub' },
  { hash: '#connect', key: 'connect' },
  { hash: '#try', key: 'try' },
  { route: 'pricing', key: 'pricing' },
] as const;

export async function SiteHeader() {
  // Per-request: the header reads the session, so no page (404 included) is prerendered against the database.
  await connection();
  const user = await currentUser().catch(() => null);
  const [t, locale, headerList] = await Promise.all([
    getTranslations('Header'),
    getLocale(),
    headers(),
  ]);
  const home = ROUTES.home.paths[locale as Locale];
  const path = headerList.get(PATH_HEADER);
  const isMcpPage =
    isPublished('mcp', locale as Locale) && path === ROUTES.mcp.paths[locale as Locale];
  const isApiPage =
    isPublished('api', locale as Locale) && path === ROUTES.api.paths[locale as Locale];
  const apiCta = isApiPage ? (await getTranslations('ApiLanding'))('headerCta') : null;
  const isIntegrationPage = isMcpPage || isApiPage;
  const connectHref = `${isIntegrationPage ? path : home}#connect`;
  // The pricing item is its own page where one is published in this language, else the home anchor.
  const navHref = (item: (typeof NAV)[number]) => {
    if ('href' in item) return item.href;
    if ('route' in item)
      return isPublished(item.route, locale as Locale)
        ? ROUTES.pricing.paths[locale as Locale]
        : `${home}#pricing`;
    if (item.hash === '#connect') return connectHref;
    if (isIntegrationPage && item.hash === '#how-it-works') return `${path}${item.hash}`;
    return `${home}${item.hash}`;
  };
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* One row at every width: section links only from xl, sign-in from sm,
          the language dropdown always, signed in or not. Whatever is hidden moves into the menu, so nothing is cut off at 320px. */}
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href={home} className="flex items-center gap-2 font-semibold tracking-tight">
            <BrandMark className="size-[1.375rem]" />
            {/* Icon only on the narrowest phones so the header actions still fit. */}
            <span className="max-[400px]:sr-only">easyrender</span>
          </Link>
          <nav aria-label={t('sections')} className="hidden items-center gap-1 xl:flex">
            {NAV.map((item) => (
              <Button key={item.key} variant="ghost" size="sm" asChild>
                <Link href={navHref(item)} className="text-muted-foreground">
                  {isApiPage && item.key === 'connect' ? apiCta : t(`nav.${item.key}`)}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <LocaleSwitcher />
          {user ? (
            <>
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
                <Link href={connectHref}>
                  {/* One text run, so the button's flex gap does not double the space before the suffix. */}
                  <span>
                    {apiCta ?? t('connect')}
                    {!isApiPage && t('connectSuffix') ? (
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
                    {isApiPage && item.key === 'connect' ? apiCta : t(`nav.${item.key}`)}
                  </Link>
                </Button>
              ))}
              {!user && (
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
