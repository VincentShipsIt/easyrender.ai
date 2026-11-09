'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function BuyButton({ pack, label }: { pack: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ pack }),
          });
          const data = await response.json();
          if (response.ok) {
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
