'use client';

import { Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Key = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export function ApiKeys({ initial, mcpUrl }: { initial: Key[]; mcpUrl: string }) {
  const [keys, setKeys] = useState(initial);
  const [created, setCreated] = useState<string | null>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get('name') || 'API key');
    const response = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) return;
    const { key, ...rest } = await response.json();
    setCreated(key);
    setKeys((current) => [{ ...rest, lastUsedAt: null }, ...current]);
    form.reset();
  }

  async function revoke(id: string) {
    await fetch(`/api/keys?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setKeys((current) => current.filter((key) => key.id !== id));
  }

  const snippet = JSON.stringify(
    {
      mcpServers: {
        easyrender: {
          url: mcpUrl,
          headers: { Authorization: `Bearer ${created ?? 'er_your_key'}` },
        },
      },
    },
    null,
    2,
  );

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="flex gap-2">
        <Input name="name" placeholder="Key name" maxLength={60} />
        <Button type="submit">Create key</Button>
      </form>
      {created && (
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="mb-1 font-medium">Copy this key now. It will not be shown again.</p>
          <code className="break-all">{created}</code>
        </div>
      )}
      <ul className="divide-y rounded-md border">
        {keys.length === 0 && <li className="p-3 text-sm text-muted-foreground">No keys yet.</li>}
        {keys.map((key) => (
          <li key={key.id} className="flex items-center justify-between p-3 text-sm">
            <span>
              {key.name} <code className="text-muted-foreground">{key.prefix}…</code>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => revoke(key.id)}
              aria-label="Revoke key"
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Connect any MCP client with this config:
        </p>
        <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">{snippet}</pre>
      </div>
    </div>
  );
}
