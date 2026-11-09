import { getBalance } from '@easyrender/core';
import { CREDIT_PACKS, RENDER_CREDITS, rendersInPack } from '@easyrender/harness';
import Link from 'next/link';
import { BuyButton } from '@/components/buy-button';
import { buttonClass } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
        <p className="mt-2 text-muted-foreground">
          Previews are free. A full 3D render costs {RENDER_CREDITS} credits ({usd(RENDER_CREDITS)}
          ). Credits never expire.
        </p>
        {user && (
          <p className="mt-2 text-sm">You have {balance.toLocaleString('en-US')} credits.</p>
        )}
        {status === 'success' && (
          <p className="mt-2 text-sm text-emerald-600">Payment received. Your credits are ready.</p>
        )}
        {back && (
          <Link href={back} className={`${buttonClass({ variant: 'outline', size: 'sm' })} mt-4`}>
            Back to your render
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {CREDIT_PACKS.map((pack) => (
          <Card key={pack.id} className="space-y-4">
            <div>
              <h2 className="font-semibold">{pack.label}</h2>
              <p className="text-3xl font-semibold tracking-tight">{usd(pack.priceCents)}</p>
              <p className="text-sm text-muted-foreground">
                {pack.credits.toLocaleString('en-US')} credits, about {rendersInPack(pack)} renders
              </p>
            </div>
            {user ? (
              <BuyButton pack={pack.id} label={`Buy ${pack.label}`} />
            ) : (
              <Link
                href={`/sign-up?next=${encodeURIComponent('/credits')}`}
                className={`${buttonClass()} w-full`}
              >
                Sign up to buy
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
