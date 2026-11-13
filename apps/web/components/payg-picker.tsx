'use client';

import {
  type ChargeCurrency,
  displayPricing,
  isValidPaygCredits,
  type PricingVariant,
  rendersFor,
} from '@easyrender/harness/pricing';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { BuyButton } from '@/components/buy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PaygPicker({
  pricingVariant = 'control',
  currency = 'usd',
}: {
  pricingVariant?: PricingVariant;
  currency?: ChargeCurrency;
}) {
  const { creditPrice, payg: PAYG } = displayPricing(pricingVariant, currency);
  const t = useTranslations('PaygPicker');
  const format = useFormatter();
  const usd = (credits: number) =>
    format.number(credits * creditPrice, { style: 'currency', currency: currency.toUpperCase() });
  const [credits, setCredits] = useState(PAYG.presets[1] ?? PAYG.min);
  const isValid = isValidPaygCredits(credits, pricingVariant);
  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {PAYG.presets.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            aria-pressed={credits === preset}
            onClick={() => setCredits(preset)}
            className={cn(
              'rounded-md border px-2 py-1.5 text-sm tabular-nums transition-colors hover:bg-muted',
              credits === preset && 'border-primary bg-muted font-medium',
            )}
          >
            {format.number(preset)}
          </Button>
        ))}
      </div>
      <div className="space-y-1 text-sm">
        <label htmlFor="payg-credits" className="text-muted-foreground">
          {t('custom')}
        </label>
        <Input
          id="payg-credits"
          type="number"
          inputMode="numeric"
          min={PAYG.min}
          max={PAYG.max}
          step={1}
          value={Number.isFinite(credits) ? credits : ''}
          onChange={(event) => setCredits(Number.parseInt(event.target.value, 10))}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {isValid
          ? t('estimate', { price: usd(credits), count: rendersFor(credits) })
          : t('range', { min: format.number(PAYG.min), max: format.number(PAYG.max) })}
      </p>
      <BuyButton
        label={isValid ? t('buyAmount', { credits: format.number(credits) }) : t('buy')}
        body={{ plan: 'payg', credits }}
        pricingVariant={pricingVariant}
        disabled={!isValid}
      />
    </div>
  );
}
