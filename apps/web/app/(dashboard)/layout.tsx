import { getBalance, listRenders } from '@easyrender/core';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell/app-shell';
import { SiteChrome } from '@/components/site-chrome';
import { currentUser } from '@/lib/actor';

// The app itself is noindex. /credits overrides this: it is the public pricing page.
export const metadata: Metadata = { robots: { index: false, follow: true } };

const RECENTS = 8;

// The signed-in web app: its own shell, no marketing header. Credits is public too, so a visitor
// who is not signed in gets that page inside the marketing frame instead.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser().catch(() => null);
  if (!user) {
    return (
      <SiteChrome>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">{children}</div>
      </SiteChrome>
    );
  }
  const [balance, renders] = await Promise.all([
    getBalance(user.id).catch(() => 0),
    listRenders(user.id, RECENTS).catch(() => []),
  ]);
  return (
    <AppShell
      balance={balance}
      recents={renders.map(({ id, name, status }) => ({ id, name, status }))}
    >
      {children}
    </AppShell>
  );
}
