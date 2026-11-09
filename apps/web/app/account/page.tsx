import { config, getBalance, listApiKeys, listRenders } from '@easyrender/core';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ApiKeys } from '@/components/api-keys';
import { Card } from '@/components/ui/card';
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-muted-foreground">
          {user.email} · {balance.toLocaleString('en-US')} credits ·{' '}
          <Link href="/credits" className="underline">
            Buy more
          </Link>
        </p>
      </div>
      <Card>
        <h2 className="mb-4 font-semibold">Your renders</h2>
        {renders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing yet.{' '}
            <Link href="/" className="underline">
              Upload a photo
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y text-sm">
            {renders.map((render) => (
              <li key={render.id} className="flex justify-between py-2">
                <Link href={`/r/${render.id}`} className="underline">
                  {render.prompt || 'Untitled render'}
                </Link>
                <span className="text-muted-foreground">{render.status.replace('_', ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h2 className="mb-1 font-semibold">API and MCP</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Use a key with the REST API or the MCP server. Renders made with a key spend your credits.
        </p>
        <ApiKeys
          initial={keys.map((key) => ({
            ...key,
            createdAt: key.createdAt.toISOString(),
            lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
          }))}
          mcpUrl={`${config.appUrl()}/api/mcp`}
        />
      </Card>
    </div>
  );
}
