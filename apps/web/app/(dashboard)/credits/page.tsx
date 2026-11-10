import { getBalance, getBillingStatus } from '@easyrender/core';
import { ENTERPRISE_BOOKING_URL, PRO_PLAN, RENDER_CREDITS, rendersFor } from '@easyrender/harness';
import { Check, CircleCheck } from 'lucide-react';
import Link from 'next/link';
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
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const usd = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;
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
  const back =
    typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : null;
  const signUp = (
    <Button className="w-full" asChild>
      <Link href={SIGN_UP}>Sign up to buy</Link>
    </Button>
  );

  let proFooter: ReactNode = signUp;
  if (user && billing.pro) {
    proFooter = billing.canManage ? (
      <BuyButton label="Manage subscription" endpoint="/api/billing/portal" variant="outline" />
    ) : (
      <Button className="w-full" variant="outline" disabled>
        You are on Pro
      </Button>
    );
  } else if (user) {
    proFooter = <BuyButton label={`Subscribe to ${PRO_PLAN.label}`} body={{ plan: 'pro' }} />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="outline">Pricing</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Credits</h1>
        <p className="text-muted-foreground">
          Previews are free. A full 3D render costs {RENDER_CREDITS} credits ({usd(RENDER_CREDITS)}
          ). Credits never expire.
        </p>
        {user && (
          <p className="text-sm">
            You have {balance.toLocaleString('en-US')} credits
            {billing.pro ? ' and you are on Pro.' : '.'}
          </p>
        )}
        {status === 'success' && (
          <Alert>
            <CircleCheck />
            <AlertDescription>Payment received. Your credits are ready.</AlertDescription>
          </Alert>
        )}
        {back && (
          <Button variant="outline" size="sm" asChild>
            <Link href={back}>Back to your render</Link>
          </Button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <PlanCard
          title="Pay as you go"
          description="Buy exactly what you need, one cent per credit."
          price="$0.01"
          note="per credit"
          features={['GLB and USDZ downloads', 'AR viewer and embeds', 'API and MCP access']}
          footer={user ? <PaygPicker /> : signUp}
        />
        <PlanCard
          title={PRO_PLAN.label}
          description={`${PRO_PLAN.monthlyCredits.toLocaleString('en-US')} credits every month, about ${rendersFor(PRO_PLAN.monthlyCredits)} renders.`}
          price={usd(PRO_PLAN.priceCents)}
          note="per month"
          badge="Best value"
          featured
          features={[
            `${PRO_PLAN.monthlyCredits.toLocaleString('en-US')} credits added each month`,
            'Unused credits roll over',
            'Top up with pay as you go anytime',
            'Cancel anytime',
          ]}
          footer={proFooter}
        />
        <PlanCard
          title="Enterprise"
          description="Volume pricing, invoicing and a direct line to the team."
          price="Custom"
          features={[
            'Volume credit pricing',
            'Invoice billing',
            'Priority support',
            'Onboarding call',
          ]}
          footer={
            <Button className="w-full" variant="outline" asChild>
              <a href={ENTERPRISE_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                Book a call
              </a>
            </Button>
          }
        />
      </div>
    </div>
  );
}
