'use client';

import { CREDIT_USD, isValidPaygCredits, PAYG, rendersFor } from '@easyrender/harness';
import { useState } from 'react';
import { BuyButton } from '@/components/buy-button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const usd = (credits: number) =>
  (credits * CREDIT_USD).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export function PaygPicker() {
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
            {preset.toLocaleString('en-US')}
          </button>
        ))}
      </div>
      <div className="space-y-1 text-sm">
        <label htmlFor="payg-credits" className="text-muted-foreground">
          Or enter an amount
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
          ? `${usd(credits)} for about ${rendersFor(credits)} renders`
          : `Choose between ${PAYG.min.toLocaleString('en-US')} and ${PAYG.max.toLocaleString('en-US')} credits`}
      </p>
      <BuyButton
        label={valid ? `Buy ${credits.toLocaleString('en-US')} credits` : 'Buy credits'}
        body={{ plan: 'payg', credits }}
        disabled={!valid}
      />
    </div>
  );
}
