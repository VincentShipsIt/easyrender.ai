import { getBalance } from '@easyrender/core';
import { Box, Coins, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/actor';

const NAV = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#connect', label: 'Connect' },
  { href: '/#try', label: 'Try it' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#pricing', label: 'Pricing' },
];

export async function SiteHeader() {
  // Per-request: the header reads the session, so no page (404 included) is prerendered against the database.
  await connection();
  const user = await currentUser().catch(() => null);
  const balance = user ? await getBalance(user.id).catch(() => 0) : 0;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Box className="size-5" />
            easyrender
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Button key={item.href} variant="ghost" size="sm" asChild>
                <Link href={item.href} className="text-muted-foreground">
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/credits">
                  <Coins />
                  {balance.toLocaleString('en-US')}
                  <span className="hidden sm:inline">credits</span>
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/#connect">
                  Connect<span className="hidden sm:inline"> your agent</span>
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
