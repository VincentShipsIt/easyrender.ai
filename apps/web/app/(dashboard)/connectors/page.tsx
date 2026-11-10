import { config, listApiKeys } from '@easyrender/core';
import { Bot, Globe, ShoppingBag, Store } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ConnectorsPanel } from '@/components/connectors-panel';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@/lib/actor';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Connectors · easyrender' };

const SOON = [
  {
    icon: Bot,
    title: 'One-click connect',
    body: 'Add easyrender to Claude.ai or ChatGPT with a sign-in instead of a key.',
  },
  {
    icon: ShoppingBag,
    title: 'Shopify',
    body: 'Sync products and publish 3D viewers to product pages.',
  },
  {
    icon: Store,
    title: 'WooCommerce and PrestaShop',
    body: 'Import your catalogue and embed models with a snippet.',
  },
  {
    icon: Globe,
    title: 'Listing sites',
    body: 'Push models to your real estate listings and portals.',
  },
];

export default async function ConnectorsPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in?next=/connectors');
  const keys = await listApiKeys(user.id);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Connectors</h1>
        <p className="text-muted-foreground">
          Hook easyrender into your agents and tools. Everything they make lands in your library.
        </p>
      </div>
      <ConnectorsPanel
        initial={keys.map((key) => ({
          ...key,
          createdAt: key.createdAt.toISOString(),
          lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
        }))}
        mcpUrl={`${config.appUrl()}/api/mcp`}
      />
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">More connectors</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SOON.map((item) => (
            <Card key={item.title} className="gap-3">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <item.icon className="size-5 text-muted-foreground" />
                  <Badge variant="outline">Coming soon</Badge>
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="leading-relaxed">{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
