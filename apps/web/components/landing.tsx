import {
  ENTERPRISE_BOOKING_URL,
  PAYG,
  PRO_PLAN,
  RENDER_CREDITS,
  rendersFor,
} from '@easyrender/harness';
import {
  Building2,
  Check,
  Code2,
  Home,
  type LucideIcon,
  Rotate3d,
  Smartphone,
  Sofa,
  Store,
} from 'lucide-react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  action,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-16 sm:py-24', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline">{eyebrow}</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

const AUDIENCES: { icon: LucideIcon; key: 'agents' | 'stagers' | 'builders' | 'stores' }[] = [
  { icon: Home, key: 'agents' },
  { icon: Sofa, key: 'stagers' },
  { icon: Building2, key: 'builders' },
  { icon: Store, key: 'stores' },
];

const PERKS: { icon: LucideIcon; key: 'embed' | 'ar' | 'api' }[] = [
  { icon: Rotate3d, key: 'embed' },
  { icon: Smartphone, key: 'ar' },
  { icon: Code2, key: 'api' },
];

export async function RealEstate() {
  const t = await getTranslations('Landing.realEstate');
  return (
    <Section
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      className="border-y bg-muted/30"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((audience) => (
          <Card key={audience.key} className="gap-3">
            <CardHeader>
              <audience.icon className="mb-2 size-5 text-muted-foreground" />
              <CardTitle>{t(`audiences.${audience.key}.title`)}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t(`audiences.${audience.key}.body`)}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-around">
        {PERKS.map((perk) => (
          <div key={perk.key} className="flex items-center gap-2 text-sm">
            <perk.icon className="size-4 text-muted-foreground" />
            {t(`perks.${perk.key}`)}
          </div>
        ))}
      </div>
    </Section>
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
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description', { credits: RENDER_CREDITS, price: usd(RENDER_CREDITS) })}
      action={
        <Button variant="outline" asChild>
          <Link href="/credits">{t('seeAll')}</Link>
        </Button>
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
] as const;

export async function Faq() {
  const t = await getTranslations('Landing.faq');
  return (
    <Section id="faq" eyebrow={t('eyebrow')} title={t('title')}>
      <Accordion type="single" collapsible className="mx-auto max-w-3xl">
        {FAQ_KEYS.map((key) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger className="text-base">{t(`items.${key}.q`)}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {t(`items.${key}.a`)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

export async function FinalCta() {
  const t = await getTranslations('Landing.finalCta');
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-2xl border bg-primary px-6 py-14 text-center text-primary-foreground">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('title')}
        </h2>
        <p className="max-w-xl text-primary-foreground/70">{t('description')}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/#connect">{t('connect')}</Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <Link href="/#try">{t('try')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
