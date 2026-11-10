import { getBalance, getBillingStatus } from '@easyrender/core';
import {
  CREDIT_USD,
  ENTERPRISE_BOOKING_URL,
  PRO_PLAN,
  RENDER_CREDITS,
  rendersFor,
} from '@easyrender/harness';
import { Check, CircleCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { BuyButton } from '@/components/buy-button';
import { PaygPicker } from '@/components/payg-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { currentUser } from '@/lib/actor';
import { breadcrumbList, JsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { livePaths, ROUTES } from '@/lib/seo/routes';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// The public pricing page, and the only indexable route in the dashboard group: it overrides the
// layout's noindex. /es/precios and the rest arrive with their own copy.
export async function generateMetadata(): Promise<Metadata> {
  const [t, format] = await Promise.all([getTranslations('Credits'), getFormatter()]);
  const metadata = pageMetadata({
    locale: 'en',
    path: ROUTES.pricing.paths.en,
    title: t('metaTitle'),
    description: t('metaDescription', {
      credits: RENDER_CREDITS,
      price: format.number(RENDER_CREDITS * CREDIT_USD, { style: 'currency', currency: 'USD' }),
      proCredits: format.number(PRO_PLAN.monthlyCredits),
    }),
    alternates: livePaths('pricing'),
  });
  // The dashboard layout is noindex; metadata merges field by field, so the override has to be
  // explicit or the public pricing page inherits it.
  return { ...metadata, robots: { index: true, follow: true } };
}

const SIGN_UP = `/sign-up?next=${encodeURIComponent('/credits')}`;

function PlanCard({
  title,
  description,
  price,
  note,
  badge,
  featured,
  features,
  footer,
}: {
  title: string;
  description: string;
  price: string;
  note?: string;
  badge?: string;
  featured?: boolean;
  features: string[];
  footer: ReactNode;
}) {
  return (
    <Card className={cn(featured && 'border-primary shadow-md')}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {badge && <Badge>{badge}</Badge>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p>
          <span className="text-4xl font-semibold tracking-tight">{price}</span>
          {note && <span className="ml-2 text-sm text-muted-foreground">{note}</span>}
        </p>
        <ul className="space-y-2 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-muted-foreground" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="block">{footer}</CardFooter>
    </Card>
  );
}

export default async function CreditsPage({ searchParams }: PageProps<'/credits'>) {
  const { status, next } = await searchParams;
  const user = await currentUser();
  const [balance, billing] = user
    ? await Promise.all([getBalance(user.id), getBillingStatus(user.id)])
    : [0, { pro: false, canManage: false }];
  const [t, format] = await Promise.all([getTranslations('Credits'), getFormatter()]);
  const usd = (cents: number) =>
    format.number(cents / 100, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    });
  const credits = (value: number) => format.number(value);
  const back =
    typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : null;
  const signUp = (
    <Button className="w-full" asChild>
      <Link href={SIGN_UP}>{t('signUpToBuy')}</Link>
    </Button>
  );

  let proFooter: ReactNode = signUp;
  if (user && billing.pro) {
    proFooter = billing.canManage ? (
      <BuyButton label={t('manageSubscription')} endpoint="/api/billing/portal" variant="outline" />
    ) : (
      <Button className="w-full" variant="outline" disabled>
        {t('onPro')}
      </Button>
    );
  } else if (user) {
    proFooter = (
      <BuyButton label={t('subscribe', { plan: PRO_PLAN.label })} body={{ plan: 'pro' }} />
    );
  }

  return (
    <div className="space-y-8">
      <JsonLd
        graph={[
          breadcrumbList([
            { name: 'easyrender', path: ROUTES.home.paths.en },
            { name: t('title'), path: ROUTES.pricing.paths.en },
          ]),
        ]}
      />
      <div className="space-y-3">
        <Badge variant="outline">{t('eyebrow')}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description', { credits: RENDER_CREDITS, price: usd(RENDER_CREDITS) })}
        </p>
        {user && (
          <p className="text-sm">
            {billing.pro
              ? t('balancePro', { credits: credits(balance) })
              : t('balance', { credits: credits(balance) })}
          </p>
        )}
        {status === 'success' && (
          <Alert>
            <CircleCheck />
            <AlertDescription>{t('success')}</AlertDescription>
          </Alert>
        )}
        {back && (
          <Button variant="outline" size="sm" asChild>
            <Link href={back}>{t('back')}</Link>
          </Button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <PlanCard
          title={t('payg.title')}
          description={t('payg.description')}
          price={usd(1)}
          note={t('payg.note')}
          features={[t('payg.features.downloads'), t('payg.features.ar'), t('payg.features.api')]}
          footer={user ? <PaygPicker /> : signUp}
        />
        <PlanCard
          title={PRO_PLAN.label}
          description={t('pro.description', {
            credits: credits(PRO_PLAN.monthlyCredits),
            count: rendersFor(PRO_PLAN.monthlyCredits),
          })}
          price={usd(PRO_PLAN.priceCents)}
          note={t('pro.note')}
          badge={t('bestValue')}
          featured
          features={[
            t('pro.features.credits', { credits: credits(PRO_PLAN.monthlyCredits) }),
            t('pro.features.rollover'),
            t('pro.features.topUp'),
            t('pro.features.cancel'),
          ]}
          footer={proFooter}
        />
        <PlanCard
          title={t('enterprise.title')}
          description={t('enterprise.description')}
          price={t('enterprise.price')}
          features={[
            t('enterprise.features.volume'),
            t('enterprise.features.invoice'),
            t('enterprise.features.support'),
            t('enterprise.features.onboarding'),
          ]}
          footer={
            <Button className="w-full" variant="outline" asChild>
              <a href={ENTERPRISE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                {t('enterprise.cta')}
              </a>
            </Button>
          }
        />
      </div>
    </div>
  );
}
