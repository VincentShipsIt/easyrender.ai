'use client';

import {
  isPlanId,
  type PricingVariant,
  paygPriceCents,
  pricingFor,
} from '@easyrender/harness/pricing';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { captureBrowser, gaEvent } from '@/lib/analytics/browser';

// Posts to a billing endpoint that answers with a Stripe URL, then follows it.
export function BuyButton({
  label,
  body,
  endpoint = '/api/checkout',
  variant = 'default',
  disabled = false,
  pricingVariant = 'control',
}: {
  label: string;
  body?: Record<string, unknown>;
  endpoint?: string;
  variant?: 'default' | 'outline';
  disabled?: boolean;
  pricingVariant?: PricingVariant;
}) {
  const t = useTranslations('BuyButton');
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
            headers: { 'content-type': 'application/json', 'x-pricing-variant': pricingVariant },
            body: JSON.stringify(body ?? {}),
          });
          const data = await response.json().catch(() => ({}));
          if (response.ok && data.url) {
            if (endpoint === '/api/checkout') {
              const value =
                body?.plan === 'payg'
                  ? paygPriceCents(Number(body.credits), pricingVariant) / 100
                  : isPlanId(body?.plan)
                    ? pricingFor(pricingVariant).plans[body.plan].priceCents / 100
                    : undefined;
              const properties = {
                pricing_variant: pricingVariant,
                value,
                currency: 'USD',
                items: [{ item_id: body?.plan }],
              };
              captureBrowser('checkout_started', properties);
              gaEvent('begin_checkout', properties);
            }
            window.location.href = data.url;
            return;
          }
          setError(
            data.code === 'pricing_changed' ? t('pricingChanged') : (data.error ?? t('failed')),
          );
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
