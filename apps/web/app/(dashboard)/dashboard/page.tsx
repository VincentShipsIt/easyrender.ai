import { config, getBalance, getDashboardStats, listApiKeys, listRenders } from '@easyrender/core';
import { ArrowRight, Bot, Box, Coins, Loader2, Plug } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';
import { McpSetup } from '@/components/mcp-setup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@/lib/actor';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard');
  return { title: t('metaTitle') };
}

const SOURCES = ['mcp', 'api', 'web'] as const;
const STATUSES = ['drafting', 'preview_ready', 'rendering', 'ready', 'failed'] as const;
const isOneOf = <T extends string>(list: readonly T[], value: string): value is T =>
  (list as readonly string[]).includes(value);

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in?next=/dashboard');
  const [balance, stats, renders, keys] = await Promise.all([
    getBalance(user.id),
    getDashboardStats(user.id),
    listRenders(user.id, 12),
    listApiKeys(user.id),
  ]);
  const connected = keys.filter((key) => key.lastUsedAt).length;
  const [t, format] = await Promise.all([getTranslations('Dashboard'), getFormatter()]);

  const ago = (date: Date) => {
    const now = new Date();
    const minutes = Math.round((now.getTime() - date.getTime()) / 60000);
    if (minutes < 1) return t('justNow');
    if (minutes < 60 * 24) {
      return format.relativeTime(date, { now, unit: minutes < 60 ? 'minute' : 'hour' });
    }
    return format.dateTime(date, { month: 'short', day: 'numeric' });
  };

  const tiles = [
    { label: t('tiles.credits'), value: format.number(balance), icon: Coins, href: '/credits' },
    { label: t('tiles.models'), value: format.number(stats.ready), icon: Box, href: '/library' },
    {
      label: t('tiles.inProgress'),
      value: format.number(stats.inFlight),
      icon: Loader2,
      href: '/library',
    },
    {
      label: t('tiles.byAgent'),
      value: format.number(stats.byAgent),
      icon: Bot,
      href: '/connectors',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/library">
            {t('openLibrary')}
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href}>
            <Card className="gap-2 py-4 transition-colors hover:bg-muted/40">
              <CardHeader className="px-4">
                <CardDescription className="flex items-center gap-2">
                  <tile.icon className="size-4" />
                  {tile.label}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 text-3xl font-semibold tracking-tight tabular-nums">
                {tile.value}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {connected === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="size-4" />
              {t('connect.title')}
            </CardTitle>
            <CardDescription>
              {keys.length === 0 ? t('connect.noKey') : t('connect.unused')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <McpSetup url={`${config.appUrl()}/api/mcp`} />
            <Button asChild>
              <Link href="/connectors">
                {keys.length === 0 ? t('connect.createKey') : t('connect.manageKeys')}
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('recent.title')}</CardTitle>
          <CardDescription>{t('recent.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {renders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t.rich('recent.empty', {
                link: (chunks) => (
                  <Link href="/library" className="text-foreground underline underline-offset-4">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          ) : (
            <ul className="divide-y">
              {renders.map((render) => (
                <li key={render.id}>
                  <Link
                    href={`/r/${render.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-muted/50"
                  >
                    <div className="size-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {render.status !== 'drafting' && render.status !== 'failed' && (
                        // biome-ignore lint/performance/noImgElement: private, auth-gated preview route
                        <img
                          src={`/api/renders/${render.id}/preview`}
                          alt=""
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {render.name || render.prompt || t('untitled')}
                      </p>
                      <p className="text-xs text-muted-foreground">{ago(render.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {render.source !== 'web' && <Bot />}
                      {isOneOf(SOURCES, render.source)
                        ? t(`source.${render.source}`)
                        : render.source}
                    </Badge>
                    <Badge variant={render.status === 'ready' ? 'default' : 'secondary'}>
                      {isOneOf(STATUSES, render.status)
                        ? t(`status.${render.status}`)
                        : render.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
