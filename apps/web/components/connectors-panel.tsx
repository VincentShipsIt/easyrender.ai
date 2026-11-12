'use client';

import { KeyRound, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { type FormEvent, useState } from 'react';
import { McpSetup } from '@/components/mcp-setup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { captureBrowser } from '@/lib/analytics/browser';

export type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

const ACTIVE_MS = 30 * 24 * 60 * 60 * 1000;

// MCP setup plus the API keys behind it. A new key is shown once and filled into the snippets.
export function ConnectorsPanel({ initial, mcpUrl }: { initial: KeyRow[]; mcpUrl: string }) {
  const t = useTranslations('ConnectorsPanel');
  const format = useFormatter();
  const when = (iso: string) =>
    format.dateTime(new Date(iso), { month: 'short', day: 'numeric', year: 'numeric' });
  const [keys, setKeys] = useState(initial);
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const form = event?.currentTarget;
    const name = String((form && new FormData(form).get('name')) || t('defaultName'));
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      }).catch(() => null);
      if (!response?.ok) {
        setError(response?.status === 401 ? t('errors.expired') : t('errors.create'));
        return;
      }
      const { key, ...rest } = await response.json();
      captureBrowser('api_key_created');
      setCreated(key);
      setKeys((current) => [{ ...rest, lastUsedAt: null }, ...current]);
      form?.reset();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    setError(null);
    const response = await fetch(`/api/keys?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => null);
    if (!response?.ok) {
      setError(t('errors.revoke'));
      return;
    }
    captureBrowser('api_key_revoked');
    setKeys((current) => current.filter((key) => key.id !== id));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{t('connect.title')}</CardTitle>
          <CardDescription>
            {created
              ? t('connect.created')
              : keys.length === 0
                ? t('connect.noKeys')
                : t('connect.hasKeys', { placeholder: 'er_your_key' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {keys.length === 0 && !created && (
            <Button onClick={() => create()} disabled={busy}>
              <KeyRound />
              {t('createMyKey')}
            </Button>
          )}
          <McpSetup url={mcpUrl} apiKey={created} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('keys.title')}</CardTitle>
          <CardDescription>{t('keys.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={create} className="flex gap-2">
            <Input name="name" placeholder={t('keys.namePlaceholder')} maxLength={60} />
            <Button type="submit" disabled={busy}>
              {t('keys.create')}
            </Button>
          </form>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <ul className="divide-y rounded-md border">
            {keys.length === 0 && (
              <li className="p-3 text-sm text-muted-foreground">{t('keys.none')}</li>
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
                        {active
                          ? t('keys.connected')
                          : key.lastUsedAt
                            ? t('keys.idle')
                            : t('keys.neverUsed')}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <code>{key.prefix}…</code> ·{' '}
                      {t('keys.created', { date: when(key.createdAt) })}
                      {key.lastUsedAt && ` · ${t('keys.lastUsed', { date: when(key.lastUsedAt) })}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revoke(key.id)}
                    aria-label={t('keys.revoke', { name: key.name })}
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
