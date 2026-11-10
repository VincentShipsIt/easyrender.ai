import { config, getBalance, listApiKeys, listRenders } from '@easyrender/core';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiKeys } from '@/components/api-keys';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@/lib/actor';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in?next=/account');
  const [balance, renders, keys] = await Promise.all([
    getBalance(user.id),
    listRenders(user.id),
    listApiKeys(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
          <p className="text-muted-foreground">
            {user.email} · {balance.toLocaleString('en-US')} credits
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/library">Open library</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/credits">Buy credits</Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your renders</CardTitle>
        </CardHeader>
        <CardContent>
          {renders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet.{' '}
              <Link href="/" className="text-foreground underline underline-offset-4">
                Upload a photo
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {renders.map((render) => (
                <li key={render.id} className="flex items-center justify-between gap-4 py-2">
                  <Link href={`/r/${render.id}`} className="truncate hover:underline">
                    {render.prompt || 'Untitled render'}
                  </Link>
                  <Badge variant="secondary">{render.status.replace('_', ' ')}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>API and MCP</CardTitle>
          <CardDescription>
            Use a key with the REST API or the MCP server. Renders made with a key spend your
            credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeys
            initial={keys.map((key) => ({
              ...key,
              createdAt: key.createdAt.toISOString(),
              lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
            }))}
            mcpUrl={`${config.appUrl()}/api/mcp`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
