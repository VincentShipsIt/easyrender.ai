'use client';

import { Box, Coins, PanelLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ACCOUNT_NAV, APP_NAV, isActivePath } from './nav';

export type ShellRecent = { id: string; name: string | null; status: string };

const STATUSES = ['drafting', 'preview_ready', 'rendering', 'ready', 'failed'] as const;
const isKnownStatus = (value: string): value is (typeof STATUSES)[number] =>
  (STATUSES as readonly string[]).includes(value);

const STORAGE_KEY = 'er-sidebar';
// One easing and one duration for every drawer in the shell (DESIGN.md: 150-250ms).
const DRAWER = 'duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none';

function StatusDot({ status }: { status: string }) {
  const isRunning = status === 'drafting' || status === 'rendering';
  return (
    <span
      aria-hidden
      className={cn(
        'size-2 shrink-0 rounded-full',
        status === 'ready' && 'bg-foreground',
        isRunning && 'animate-pulse bg-muted-foreground',
        status === 'preview_ready' && 'border border-muted-foreground',
        status === 'failed' && 'bg-destructive',
      )}
    />
  );
}

// The signed-in app: a thin rail of destinations, a collapsible sidebar, and the page in one
// rounded block, with no marketing header. Below `md` the rail becomes a bottom bar and the
// sidebar is hidden.
export function AppShell({
  balance,
  recents,
  children,
}: {
  balance: number;
  recents: ShellRecent[];
  children: ReactNode;
}) {
  const t = useTranslations('AppShell');
  const nav = useTranslations('DashboardNav');
  const format = useFormatter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // The choice is per browser. It is read after mount so the server and client markup match.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === 'closed') setIsOpen(false);
    } catch {
      // Storage can be blocked; the sidebar then starts open.
    }
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, current ? 'closed' : 'open');
      } catch {
        // Not persisted; still works for this visit.
      }
      return !current;
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const account = ACCOUNT_NAV;
  return (
    <div className="flex h-dvh flex-col bg-muted/40 md:flex-row">
      {/* Rail: the destinations as icons. Desktop only; phones get the bottom bar. */}
      <aside
        aria-label={t('navLabel')}
        className="hidden w-14 shrink-0 flex-col items-center gap-1 py-3 md:flex"
      >
        <Button variant="ghost" size="icon" className="mb-2 size-10" asChild>
          <Link href="/" aria-label={t('home')} title={t('home')}>
            <Box className="size-5" />
          </Link>
        </Button>
        {APP_NAV.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="icon"
            className={cn('size-10', isActivePath(pathname, item.href) && 'bg-accent')}
            asChild
          >
            <Link
              href={item.href}
              aria-label={nav(item.key)}
              title={nav(item.key)}
              aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
            >
              <item.icon />
            </Link>
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className={cn('mt-auto size-10', isActivePath(pathname, account.href) && 'bg-accent')}
          asChild
        >
          <Link
            href={account.href}
            aria-label={nav(account.key)}
            title={nav(account.key)}
            aria-current={isActivePath(pathname, account.href) ? 'page' : undefined}
          >
            <account.icon />
          </Link>
        </Button>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-3 md:pl-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={toggle}
            aria-label={t('toggleSidebar')}
            aria-pressed={isOpen}
            title={t('toggleSidebar')}
          >
            <PanelLeft />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold md:hidden">
            <Box className="size-5" />
            easyrender
          </Link>
          <Button variant="outline" size="sm" className="ml-auto" asChild>
            <Link href="/credits">
              <Coins />
              <span className="tabular-nums">{format.number(balance)}</span> {t('credits')}
            </Link>
          </Button>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden border-t bg-background md:mr-2 md:mb-2 md:rounded-lg md:border">
          {/* The drawer keeps a fixed inner width and only its outer width animates, so the
              content does not reflow while it opens or closes. inert keeps focus out when shut. */}
          <div
            inert={!isOpen}
            className={cn(
              'hidden shrink-0 overflow-hidden border-r transition-[width,border-color] md:block',
              DRAWER,
              isOpen ? 'w-60' : 'w-0 border-transparent',
            )}
          >
            <nav
              aria-label={t('sidebar')}
              className={cn(
                'flex h-full w-60 flex-col gap-4 overflow-y-auto p-2 transition-opacity',
                DRAWER,
                !isOpen && 'opacity-0',
              )}
            >
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/library">
                  <Plus />
                  {t('newModel')}
                </Link>
              </Button>
              <div className="flex flex-col gap-0.5">
                {APP_NAV.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      'justify-start font-normal text-muted-foreground',
                      isActivePath(pathname, item.href) && 'bg-accent font-medium text-foreground',
                    )}
                    asChild
                  >
                    <Link
                      href={item.href}
                      aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                    >
                      <item.icon />
                      {nav(item.key)}
                    </Link>
                  </Button>
                ))}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                  {t('recents')}
                </p>
                {recents.length === 0 ? (
                  <p className="px-3 text-sm text-muted-foreground">{t('noRecents')}</p>
                ) : (
                  recents.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="justify-start font-normal"
                      asChild
                    >
                      <Link
                        href={`/r/${item.id}`}
                        title={isKnownStatus(item.status) ? t(`status.${item.status}`) : undefined}
                      >
                        <StatusDot status={item.status} />
                        <span className="truncate">{item.name?.trim() || t('untitled')}</span>
                      </Link>
                    </Button>
                  ))
                )}
              </div>
            </nav>
          </div>
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">{children}</div>
          </main>
        </div>
      </div>

      {/* Bottom bar on phones. */}
      <nav
        aria-label={t('navLabel')}
        className="flex shrink-0 justify-around border-t bg-muted/40 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {[...APP_NAV, account].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
            className={cn(
              'flex min-w-14 flex-col items-center gap-0.5 rounded-md px-2 py-1 text-xs text-muted-foreground',
              isActivePath(pathname, item.href) && 'text-foreground',
            )}
          >
            <item.icon className="size-4" />
            {nav(item.key)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
