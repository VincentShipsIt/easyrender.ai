'use client';

import { CREDIT_USD, isValidPaygCredits, PAYG, rendersFor } from '@easyrender/harness/pricing';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { BuyButton } from '@/components/buy-button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PaygPicker() {
  const t = useTranslations('PaygPicker');
  const format = useFormatter();
  const usd = (credits: number) =>
    format.number(credits * CREDIT_USD, { style: 'currency', currency: 'USD' });
  const [credits, setCredits] = useState(PAYG.presets[1] ?? PAYG.min);
  const valid = isValidPaygCredits(credits);
  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {PAYG.presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setCredits(preset)}
            className={cn(
              'rounded-md border px-2 py-1.5 text-sm tabular-nums transition-colors hover:bg-muted',
              credits === preset && 'border-primary bg-muted font-medium',
            )}
          >
            {format.number(preset)}
          </button>
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
          step={100}
          value={Number.isFinite(credits) ? credits : ''}
          onChange={(event) => setCredits(Number.parseInt(event.target.value, 10))}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {valid
          ? t('estimate', { price: usd(credits), count: rendersFor(credits) })
          : t('range', { min: format.number(PAYG.min), max: format.number(PAYG.max) })}
      </p>
      <BuyButton
        label={valid ? t('buyAmount', { credits: format.number(credits) }) : t('buy')}
        body={{ plan: 'payg', credits }}
        disabled={!valid}
      />
    </div>
  );
}
