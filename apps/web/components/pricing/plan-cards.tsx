import { ENTERPRISE_BOOKING_URL, PLAN_IDS, rendersFor } from '@easyrender/harness';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCount, formatMoney } from '@/lib/price-format';
import { cn } from '@/lib/utils';

const BUY = `/sign-up?next=${encodeURIComponent('/credits')}`;

/**
 * The plan cards: Free, pay as you go, the monthly plans and Enterprise. The home page and the
 * pricing page both render this, so the two can never show different numbers. Prices, credits and
 * counts come from the harness through currentPricing(), which already honours the A/B variant.
 */
export async function PlanCards() {
  // Imported on use: lib/pricing is server-only and this file is reached from modules that tests load.
  const { currentPricing } = await import('@/lib/pricing');
  const pricing = await currentPricing();
  const { plans: SUBSCRIPTION_PLANS, payg: PAYG } = pricing;
  const [t, locale] = await Promise.all([getTranslations('Landing.pricing'), getLocale()]);
  const usd = (cents: number) =>
    formatMoney(locale, cents / 100, pricing.currency, {
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    });
  const plans = [
    {
      name: t('free.name'),
      price: usd(0),
      note: t('free.note'),
      features: [t('free.features.mcp'), t('free.features.previews'), t('free.features.noCard')],
      cta: { href: '/sign-up', label: t('free.cta') },
      featured: false,
    },
    {
      name: t('payg.name'),
      price: usd(pricing.creditPrice * 100),
      note: t('payg.note'),
      features: [
        t('payg.features.min', {
          credits: formatCount(locale, PAYG.min),
          price: usd(PAYG.min * pricing.creditPrice * 100),
        }),
        t('payg.features.downloads'),
        t('payg.features.ar'),
        t('payg.features.api'),
      ],
      cta: { href: BUY, label: t('payg.cta') },
      featured: false,
    },
    ...PLAN_IDS.map((id) => ({
      name: SUBSCRIPTION_PLANS[id].label,
      price: usd(SUBSCRIPTION_PLANS[id].priceCents),
      note: t('pro.note'),
      features: [
        t('pro.features.credits', {
          credits: formatCount(locale, SUBSCRIPTION_PLANS[id].monthlyCredits),
        }),
        t('pro.features.models', { count: rendersFor(SUBSCRIPTION_PLANS[id].monthlyCredits) }),
        t('pro.features.rollover'),
        t('pro.features.cancel'),
      ],
      cta: { href: BUY, label: t('pro.cta', { plan: SUBSCRIPTION_PLANS[id].label }) },
      featured: id === 'pro',
    })),
    {
      name: t('enterprise.name'),
      price: t('enterprise.price'),
      note: t('enterprise.note'),
      features: [
        t('enterprise.features.volume'),
        t('enterprise.features.invoice'),
        t('enterprise.features.support'),
        t('enterprise.features.onboarding'),
      ],
      cta: { href: ENTERPRISE_BOOKING_URL, label: t('enterprise.cta') },
      featured: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className={cn(plan.featured && 'border-primary shadow-md')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{plan.name}</CardTitle>
              {plan.featured && <Badge>{t('bestValue')}</Badge>}
            </div>
            <p className="pt-2">
              <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
              <span className="ml-2 text-sm text-muted-foreground">{plan.note}</span>
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-muted-foreground" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={plan.featured ? 'default' : 'outline'} asChild>
              {plan.cta.href.startsWith('/') ? (
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              ) : (
                <a href={plan.cta.href} target="_blank" rel="noopener noreferrer">
                  {plan.cta.label}
                </a>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
