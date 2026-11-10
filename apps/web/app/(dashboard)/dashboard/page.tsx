import { config, getBalance, getDashboardStats, listApiKeys, listRenders } from '@easyrender/core';
import { ArrowRight, Bot, Box, Coins, Loader2, Plug } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { McpSetup } from '@/components/mcp-setup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@/lib/actor';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard · easyrender' };

const SOURCE: Record<string, string> = { mcp: 'Agent', api: 'API', web: 'Web' };
const STATUS: Record<string, string> = {
  drafting: 'Drawing angles',
  preview_ready: 'Preview ready',
  rendering: 'Building 3D',
  ready: '3D ready',
  failed: 'Failed',
};

const ago = (date: Date) => {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

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

  const tiles = [
    { label: 'Credits', value: balance.toLocaleString('en-US'), icon: Coins, href: '/credits' },
    { label: '3D models', value: stats.ready, icon: Box, href: '/library' },
    { label: 'In progress', value: stats.inFlight, icon: Loader2, href: '/library' },
    { label: 'Made by your agents', value: stats.byAgent, icon: Bot, href: '/connectors' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Everything your agents and you have generated, in one place.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/library">
            Open library
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
              Connect your agent
            </CardTitle>
            <CardDescription>
              {keys.length === 0
                ? 'Create a key on the Connectors page, paste the snippet into your agent, then ask it for 3D models. They will show up here.'
                : 'You have a key but no agent has used it yet. Paste the snippet into your agent with your key.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <McpSetup url={`${config.appUrl()}/api/mcp`} />
            <Button asChild>
              <Link href="/connectors">
                {keys.length === 0 ? 'Create my key' : 'Manage keys'}
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent generations</CardTitle>
          <CardDescription>From your agents, the API and the web app.</CardDescription>
        </CardHeader>
        <CardContent>
          {renders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet. Ask your agent for a 3D model, or{' '}
              <Link href="/library" className="text-foreground underline underline-offset-4">
                upload photos to your library
              </Link>
              .
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
                        {render.name || render.prompt || 'Untitled render'}
                      </p>
                      <p className="text-xs text-muted-foreground">{ago(render.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {render.source !== 'web' && <Bot />}
                      {SOURCE[render.source] ?? render.source}
                    </Badge>
                    <Badge variant={render.status === 'ready' ? 'default' : 'secondary'}>
                      {STATUS[render.status] ?? render.status}
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
