import { getBalance } from '@easyrender/core';
import { Box } from 'lucide-react';
import Link from 'next/link';
import { SignOutButton } from '@/components/sign-out-button';
import { buttonClass } from '@/components/ui/button';
import { currentUser } from '@/lib/actor';

export async function SiteHeader() {
  const user = await currentUser();
  const balance = user ? await getBalance(user.id) : 0;
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Box className="size-5" />
          easyrender
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/credits" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
            {user ? `${balance.toLocaleString('en-US')} credits` : 'Pricing'}
          </Link>
          {user ? (
            <>
              <Link href="/account" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                Account
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonClass({ size: 'sm' })}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
