import { getBalance } from '@easyrender/core';
import { Box, Coins, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { getFormatter, getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/actor';

const NAV = [
  { href: '/#how-it-works', key: 'howItWorks' },
  { href: '/#connect', key: 'connect' },
  { href: '/#try', key: 'try' },
  { href: '/#gallery', key: 'gallery' },
  { href: '/#pricing', key: 'pricing' },
] as const;

export async function SiteHeader() {
  // Per-request: the header reads the session, so no page (404 included) is prerendered against the database.
  await connection();
  const user = await currentUser().catch(() => null);
  const balance = user ? await getBalance(user.id).catch(() => 0) : 0;
  const [t, format] = await Promise.all([getTranslations('Header'), getFormatter()]);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Box className="size-5" />
            {/* Icon only on the narrowest phones so the header actions still fit. */}
            <span className="max-[400px]:sr-only">easyrender</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Button key={item.href} variant="ghost" size="sm" asChild>
                <Link href={item.href} className="text-muted-foreground">
                  {t(`nav.${item.key}`)}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <nav className="flex items-center gap-1">
          <LocaleSwitcher />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/credits">
                  <Coins />
                  {format.number(balance)}
                  <span className="hidden sm:inline">{t('credits')}</span>
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">{t('signIn')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/#connect">
                  {t('connect')}
                  <span className="hidden sm:inline">{t('connectSuffix')}</span>
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
