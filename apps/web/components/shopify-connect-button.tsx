'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { captureBrowser } from '@/lib/analytics/browser';

export function ShopifyConnectButton({ state }: { state: string }) {
  const t = useTranslations('ShopifyConnect');
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setPhase('busy');
    setError(null);
    const response = await fetch('/api/shopify/link', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ state }),
    });
    if (response.ok) {
      captureBrowser('shopify_account_linked');
      return setPhase('done');
    }
    setError((await response.json().catch(() => ({}))).error ?? t('error'));
    setPhase('idle');
  }

  if (phase === 'done') {
    return (
      <Alert>
        <CheckCircle2 />
        <AlertDescription>{t('done')}</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="space-y-3">
      <Button onClick={connect} disabled={phase === 'busy'} className="h-10">
        {phase === 'busy' && <Loader2 className="animate-spin" />}
        {t('button')}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
