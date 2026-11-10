import { getBalance } from '@easyrender/core';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@/lib/actor';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Account · easyrender' };

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in?next=/account');
  const balance = await getBalance(user.id);

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>{user.name || 'Your account'}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            <span className="font-medium">{balance.toLocaleString('en-US')}</span> credits
          </p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/credits">Buy credits</Link>
            </Button>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
