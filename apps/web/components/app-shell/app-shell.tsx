'use client';

import { Coins, PanelLeft, PanelRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppBreadcrumb } from './app-breadcrumb';
import { ACCOUNT_NAV, APP_NAV, isActivePath } from './nav';
import { RailItem } from './rail-item';
import { RailPreview } from './rail-preview';
import { RendersPanel } from './renders-panel';
import { StatusDot } from './status-dot';
import { displayName, isInFlight, isKnownStatus, type ShellData } from './types';

const SIDEBAR_KEY = 'er-sidebar';
const PANEL_KEY = 'er-renders-panel';
const RECENTS = 8;
// One easing and one duration for every drawer in the shell (DESIGN.md: 150-250ms).
const DRAWER = 'duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none';

type RailKind = 'overview' | 'library' | 'connectors' | 'credits' | 'account';
const RAIL_KINDS: Record<string, RailKind> = {
  overview: 'overview',
  library: 'library',
  connectors: 'connectors',
  credits: 'credits',
  account: 'account',
};

// A drawer remembered per browser. It starts in its default and is read after mount so the
// server and client markup match.
function useDrawer(key: string, initial: boolean) {
  const [isOpen, setIsOpen] = useState(initial);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) setIsOpen(stored === 'open');
    } catch {
      // Storage can be blocked; the drawer then keeps its default.
    }
  }, [key]);
  const toggle = useCallback(() => {
    setIsOpen((current) => {
      try {
        window.localStorage.setItem(key, current ? 'closed' : 'open');
      } catch {
        // Not persisted; still works for this visit.
      }
      return !current;
    });
  }, [key]);
  return [isOpen, toggle] as const;
}

// The signed-in app: a thin rail of destinations that peek at their page on hover, a collapsible
// sidebar, the page in one rounded block with a renders panel beside it, and no marketing header.
// Below `md` the rail becomes a bottom bar and the drawers are hidden.
export function AppShell({ data, children }: { data: ShellData; children: ReactNode }) {
  const t = useTranslations('AppShell');
  const nav = useTranslations('DashboardNav');
  const format = useFormatter();
  const pathname = usePathname();
  const [isSidebarOpen, toggleSidebar] = useDrawer(SIDEBAR_KEY, true);
  const [isPanelOpen, togglePanel] = useDrawer(PANEL_KEY, false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSidebar]);

  const inFlight = data.renders.filter((render) => isInFlight(render.status)).length;
  const recents = data.renders.slice(0, RECENTS);
  const account = ACCOUNT_NAV;

  return (
    <div className="flex h-dvh flex-col bg-muted/40 md:flex-row">
      {/* Rail: the destinations as icons. Desktop only; phones get the bottom bar. */}
      <aside
        aria-label={t('navLabel')}
        className="relative z-30 hidden w-14 shrink-0 flex-col items-center gap-1 py-3 md:flex"
      >
        <Button variant="ghost" size="icon" className="mb-2 size-10" asChild>
          <Link href="/" aria-label={t('home')} title={t('home')}>
            <BrandMark className="size-[1.375rem]" />
          </Link>
        </Button>
        {[...APP_NAV, account].map((item) => {
          const isActive = isActivePath(pathname, item.href);
          const isBottom = item.href === account.href;
          return (
            <RailItem
              key={item.href}
              isActive={isActive}
              isBottom={isBottom}
              className={cn('relative', isBottom && 'mt-auto')}
              preview={
                <RailPreview
                  kind={RAIL_KINDS[item.key] ?? 'overview'}
                  label={nav(item.key)}
                  href={item.href}
                  data={data}
                />
              }
            >
              <Button
                variant="ghost"
                size="icon"
                className={cn('relative size-10', isActive && 'bg-accent')}
                asChild
              >
                <Link
                  href={item.href}
                  aria-label={nav(item.key)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon />
                  {item.key === 'library' && inFlight > 0 && (
                    <span
                      className="absolute top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-xs leading-none font-semibold text-background tabular-nums"
                      role="img"
                      aria-label={t('preview.building')}
                    >
                      {inFlight}
                    </span>
                  )}
                </Link>
              </Button>
            </RailItem>
          );
        })}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-3 md:pl-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={toggleSidebar}
            aria-label={t('toggleSidebar')}
            aria-pressed={isSidebarOpen}
            title={t('toggleSidebar')}
          >
            <PanelLeft />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold md:hidden">
            <BrandMark className="size-[1.375rem]" />
          </Link>
          <AppBreadcrumb />
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden xl:inline-flex"
              onClick={togglePanel}
              aria-label={t('toggleRenders')}
              aria-pressed={isPanelOpen}
              title={t('toggleRenders')}
            >
              <PanelRight />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/credits">
                <Coins />
                <span className="tabular-nums">{format.number(data.balance)}</span> {t('credits')}
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden border-t bg-background md:mr-2 md:mb-2 md:rounded-lg md:border">
          {/* Each drawer keeps a fixed inner width and only its outer width animates, so the
              content does not reflow while it opens or closes. inert keeps focus out when shut. */}
          <div
            inert={!isSidebarOpen}
            className={cn(
              'hidden shrink-0 overflow-hidden border-r transition-[width,border-color] md:block',
              DRAWER,
              isSidebarOpen ? 'w-60' : 'w-0 border-transparent',
            )}
          >
            <nav
              aria-label={t('sidebar')}
              className={cn(
                'flex h-full w-60 flex-col gap-4 overflow-y-auto p-2 transition-opacity',
                DRAWER,
                !isSidebarOpen && 'opacity-0',
              )}
            >
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/dashboard">
                    <Plus />
                    {t('newModel')}
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="px-3 pb-1 text-xs text-muted-foreground">{t('recents')}</p>
                {recents.length === 0 ? (
                  <p className="px-3 text-sm text-muted-foreground">{t('noRecents')}</p>
                ) : (
                  recents.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        'justify-start font-normal',
                        pathname === `/r/${item.id}` && 'bg-accent',
                      )}
                      asChild
                    >
                      <Link
                        href={`/r/${item.id}`}
                        aria-current={pathname === `/r/${item.id}` ? 'page' : undefined}
                        title={isKnownStatus(item.status) ? t(`status.${item.status}`) : undefined}
                      >
                        <StatusDot status={item.status} />
                        <span className="truncate">{displayName(item) || t('untitled')}</span>
                      </Link>
                    </Button>
                  ))
                )}
              </div>
            </nav>
          </div>
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:py-8">
              {children}
            </div>
          </main>
          <aside
            aria-label={t('panel.title')}
            inert={!isPanelOpen}
            className={cn(
              'hidden shrink-0 overflow-hidden border-l transition-[width,border-color] xl:block',
              DRAWER,
              isPanelOpen ? 'w-80' : 'w-0 border-transparent',
            )}
          >
            <div className={cn('h-full transition-opacity', DRAWER, !isPanelOpen && 'opacity-0')}>
              <RendersPanel renders={data.renders} now={data.now} />
            </div>
          </aside>
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
