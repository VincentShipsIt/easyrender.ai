import { ENTERPRISE_BOOKING_URL, PLAN_IDS, RENDER_CREDITS, rendersFor } from '@easyrender/harness';
import { ArrowRight, Check, ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { PricingExposure } from '@/components/pricing-exposure';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FAQ_KEYS } from '@/lib/faq';
import { formatCount, formatUsd } from '@/lib/price-format';
import { cn } from '@/lib/utils';

// A home page section in the studio layout: a two-tone statement (title, then description in
// grey), an optional link on the right, and the content below. Rendered inside <StudioShell>.
export function Section({
  id,
  title,
  description,
  children,
  className,
  action,
  narrow = false,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  // Centres the statement in a narrower column.
  narrow?: boolean;
}) {
  return (
    <section id={id} className={cn('sec', narrow && 'sec--center', className)}>
      <div className={cn('sec__head', narrow && 'sec__head--narrow')}>
        <div className={cn('statement reveal', narrow && 'statement--narrow')}>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export async function Pricing() {
  const { currentPricing } = await import('@/lib/pricing');
  const pricing = await currentPricing();
  const { plans: SUBSCRIPTION_PLANS, payg: PAYG } = pricing;
  const [t, locale] = await Promise.all([getTranslations('Landing.pricing'), getLocale()]);
  const usd = (cents: number) =>
    formatUsd(locale, cents / 100, { minimumFractionDigits: cents % 100 === 0 ? 0 : 2 });
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
      price: usd(pricing.creditUsd * 100),
      note: t('payg.note'),
      features: [
        t('payg.features.min', {
          credits: formatCount(locale, PAYG.min),
          price: usd(PAYG.min * pricing.creditUsd * 100),
        }),
        t('payg.features.downloads'),
        t('payg.features.ar'),
        t('payg.features.api'),
      ],
      cta: { href: `/sign-up?next=${encodeURIComponent('/credits')}`, label: t('payg.cta') },
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
      cta: {
        href: `/sign-up?next=${encodeURIComponent('/credits')}`,
        label: t('pro.cta', { plan: SUBSCRIPTION_PLANS[id].label }),
      },
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
    <Section
      id="pricing"
      title={t('title')}
      description={t('description', {
        credits: RENDER_CREDITS,
        price: usd(RENDER_CREDITS * pricing.creditUsd * 100),
      })}
      action={
        <Link className="link" href="/credits">
          {t('seeAll')} <ArrowRight />
        </Link>
      }
    >
      <PricingExposure
        variant={pricing.variant}
        subject={pricing.subject}
        isExperimentActive={pricing.isExperimentActive}
      />
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
                    <Check className="size-4 text-muted-foreground" />
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
    </Section>
  );
}

export type FaqItem = { question: string; answer: string };

/**
 * The home FAQ as plain strings, so the accordion and the FAQPage structured data are built from
 * one list and cannot drift apart.
 */
export async function faqItems(): Promise<FaqItem[]> {
  const { currentPricing } = await import('@/lib/pricing');
  const { creditUsd } = await currentPricing();
  const [t, locale] = await Promise.all([getTranslations('Landing.faq'), getLocale()]);
  const usd = (value: number) => formatUsd(locale, value);
  const price = usd(RENDER_CREDITS * creditUsd);
  const unit = usd(creditUsd);
  return FAQ_KEYS.map((key) => ({
    question: t(`items.${key}.q`),
    answer: t(`items.${key}.a`, { credits: RENDER_CREDITS, price, unit }),
  }));
}

// Native <details>, not the Radix accordion: Radix does not render a closed panel's content at
// all, so the answers were missing from the server HTML that search engines and AI crawlers read,
// and the FAQPage structured data described text the page did not show. <details> keeps every
// answer in the HTML, opens without JavaScript, and is still one click per question.
export async function Faq() {
  const [t, items] = await Promise.all([getTranslations('Landing.faq'), faqItems()]);
  return (
    <Section id="faq" title={t('title')} narrow>
      <div className="sec__column">
        {items.map((item) => (
          <details key={item.question} className="group border-b last:border-b-0">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md py-4 text-left font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              <h3 className="text-base font-medium">{item.question}</h3>
              <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
