import {
  ENTERPRISE_BOOKING_URL,
  PAYG,
  PRO_PLAN,
  RENDER_CREDITS,
  rendersFor,
} from '@easyrender/harness';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [t, format] = await Promise.all([getTranslations('Landing.pricing'), getFormatter()]);
  const usd = (cents: number) =>
    format.number(cents / 100, {
      style: 'currency',
      currency: 'USD',
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
      price: usd(1),
      note: t('payg.note'),
      features: [
        t('payg.features.min', { credits: format.number(PAYG.min) }),
        t('payg.features.downloads'),
        t('payg.features.ar'),
        t('payg.features.api'),
      ],
      cta: { href: `/sign-up?next=${encodeURIComponent('/credits')}`, label: t('payg.cta') },
      featured: false,
    },
    {
      name: PRO_PLAN.label,
      price: usd(PRO_PLAN.priceCents),
      note: t('pro.note'),
      features: [
        t('pro.features.credits', { credits: format.number(PRO_PLAN.monthlyCredits) }),
        t('pro.features.models', { count: rendersFor(PRO_PLAN.monthlyCredits) }),
        t('pro.features.rollover'),
        t('pro.features.cancel'),
      ],
      cta: { href: `/sign-up?next=${encodeURIComponent('/credits')}`, label: t('pro.cta') },
      featured: true,
    },
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
      description={t('description', { credits: RENDER_CREDITS, price: usd(RENDER_CREDITS) })}
      action={
        <Link className="link" href="/credits">
          {t('seeAll')} <ArrowRight />
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

const FAQ_KEYS = [
  'connect',
  'needAgent',
  'photos',
  'scope',
  'output',
  'freePreview',
  'failed',
  'public',
  'cost',
] as const;

export type FaqItem = { question: string; answer: string };

/**
 * The home FAQ as plain strings, so the accordion and the FAQPage structured data are built from
 * one list and cannot drift apart.
 */
export async function faqItems(): Promise<FaqItem[]> {
  const [t, format] = await Promise.all([getTranslations('Landing.faq'), getFormatter()]);
  const price = format.number(RENDER_CREDITS / 100, { style: 'currency', currency: 'USD' });
  return FAQ_KEYS.map((key) => ({
    question: t(`items.${key}.q`),
    answer: t(`items.${key}.a`, { credits: RENDER_CREDITS, price }),
  }));
}

export async function Faq() {
  const [t, items] = await Promise.all([getTranslations('Landing.faq'), faqItems()]);
  return (
    <Section id="faq" title={t('title')} narrow>
      <Accordion type="single" collapsible className="sec__column">
        {items.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
