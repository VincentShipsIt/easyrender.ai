import { getBalance } from '@easyrender/core';
import { CREDIT_PACKS, RENDER_CREDITS, rendersInPack } from '@easyrender/harness';
import { Check, CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { BuyButton } from '@/components/buy-button';
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

export const dynamic = 'force-dynamic';

const usd = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

export default async function CreditsPage({ searchParams }: PageProps<'/credits'>) {
  const { status, next } = await searchParams;
  const user = await currentUser();
  const balance = user ? await getBalance(user.id) : 0;
  const back =
    typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : null;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="outline">Pricing</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Credits</h1>
        <p className="text-muted-foreground">
          Previews are free. A full 3D render costs {RENDER_CREDITS} credits ({usd(RENDER_CREDITS)}
          ). Credits never expire.
        </p>
        {user && <p className="text-sm">You have {balance.toLocaleString('en-US')} credits.</p>}
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
      <div className="grid gap-4 sm:grid-cols-2">
        {CREDIT_PACKS.map((pack) => (
          <Card key={pack.id}>
            <CardHeader>
              <CardTitle>{pack.label}</CardTitle>
              <CardDescription>
                {pack.credits.toLocaleString('en-US')} credits, about {rendersInPack(pack)} renders
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-4xl font-semibold tracking-tight">{usd(pack.priceCents)}</p>
              <ul className="space-y-2 text-sm">
                {['GLB and USDZ downloads', 'AR viewer and embeds', 'API and MCP access'].map(
                  (feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 text-muted-foreground" />
                      {feature}
                    </li>
                  ),
                )}
              </ul>
            </CardContent>
            <CardFooter className="block">
              {user ? (
                <BuyButton pack={pack.id} label={`Buy ${pack.label}`} />
              ) : (
                <Button className="w-full" asChild>
                  <Link href={`/sign-up?next=${encodeURIComponent('/credits')}`}>
                    Sign up to buy
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
