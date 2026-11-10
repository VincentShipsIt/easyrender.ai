'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Posts to a billing endpoint that answers with a Stripe URL, then follows it.
export function BuyButton({
  label,
  body,
  endpoint = '/api/checkout',
  variant = 'default',
  disabled = false,
}: {
  label: string;
  body?: Record<string, unknown>;
  endpoint?: string;
  variant?: 'default' | 'outline';
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="w-full space-y-2">
      <Button
        className="w-full"
        variant={variant}
        disabled={busy || disabled}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body ?? {}),
          });
          const data = await response.json().catch(() => ({}));
          if (response.ok && data.url) {
            window.location.href = data.url;
            return;
          }
          setError(data.error ?? 'Checkout failed');
          setBusy(false);
        }}
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
