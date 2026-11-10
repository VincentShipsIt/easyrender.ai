'use client';

import { KeyRound, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { McpSetup } from '@/components/mcp-setup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

const ACTIVE_MS = 30 * 24 * 60 * 60 * 1000;

const when = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// MCP setup plus the API keys behind it. A new key is shown once and filled into the snippets.
export function ConnectorsPanel({ initial, mcpUrl }: { initial: KeyRow[]; mcpUrl: string }) {
  const [keys, setKeys] = useState(initial);
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const form = event?.currentTarget;
    const name = String((form && new FormData(form).get('name')) || 'My agent');
    setBusy(true);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) return;
      const { key, ...rest } = await response.json();
      setCreated(key);
      setKeys((current) => [{ ...rest, lastUsedAt: null }, ...current]);
      form?.reset();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    await fetch(`/api/keys?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setKeys((current) => current.filter((key) => key.id !== id));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Connect your agent</CardTitle>
          <CardDescription>
            {created
              ? 'Your new key is filled in below. Copy the snippet now: the key will not be shown again.'
              : keys.length === 0
                ? 'Create a key, then paste the snippet into your agent.'
                : 'Paste the snippet into your agent and replace er_your_key with one of your keys.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {keys.length === 0 && !created && (
            <Button onClick={() => create()} disabled={busy}>
              <KeyRound />
              Create my key
            </Button>
          )}
          <McpSetup url={mcpUrl} apiKey={created} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API keys</CardTitle>
          <CardDescription>
            One key per agent or tool, so you can see which one is in use and revoke it alone.
            Renders made with a key spend your credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={create} className="flex gap-2">
            <Input name="name" placeholder="Key name, e.g. Claude Code" maxLength={60} />
            <Button type="submit" disabled={busy}>
              Create
            </Button>
          </form>
          <ul className="divide-y rounded-md border">
            {keys.length === 0 && (
              <li className="p-3 text-sm text-muted-foreground">No keys yet.</li>
            )}
            {keys.map((key) => {
              const active =
                key.lastUsedAt && Date.now() - new Date(key.lastUsedAt).getTime() < ACTIVE_MS;
              return (
                <li key={key.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0 space-y-0.5">
                    <p className="flex items-center gap-2">
                      <span className="truncate font-medium">{key.name}</span>
                      <Badge variant={active ? 'default' : 'secondary'}>
                        {active ? 'Connected' : key.lastUsedAt ? 'Idle' : 'Never used'}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <code>{key.prefix}…</code> · created {when(key.createdAt)}
                      {key.lastUsedAt && ` · last used ${when(key.lastUsedAt)}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revoke(key.id)}
                    aria-label={`Revoke ${key.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
