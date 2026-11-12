import { getBalance, getDashboardStats, listApiKeys, listRenders } from '@easyrender/core';
import { RENDER_CREDITS, SHEET_CREDITS } from '@easyrender/harness';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell/app-shell';
import type { ShellData } from '@/components/app-shell/types';
import { SiteChrome } from '@/components/site-chrome';
import { currentUser } from '@/lib/actor';

// The app itself is noindex, /credits included: the public pricing page is /pricing.
export const metadata: Metadata = { robots: { index: false, follow: true } };

const LATEST = 12;

// The signed-in web app: its own shell, no marketing header. Credits is reachable without an account too, so a visitor
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
  // Each read falls back on its own, so one slow or failing query never blanks the whole shell.
  const [balance, stats, renders, keys] = await Promise.all([
    getBalance(user.id).catch(() => 0),
    getDashboardStats(user.id).catch(() => ({ total: 0, ready: 0, inFlight: 0, byAgent: 0 })),
    listRenders(user.id, LATEST).catch(() => []),
    listApiKeys(user.id).catch(() => []),
  ]);
  const data: ShellData = {
    balance,
    email: user.email,
    name: user.name ?? '',
    stats,
    keys: keys.map((key) => ({
      id: key.id,
      name: key.name,
      lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
    })),
    renders: renders.map((render) => ({
      id: render.id,
      name: render.name,
      prompt: render.prompt,
      status: render.status,
      createdAt: render.createdAt.toISOString(),
    })),
    costs: { render: RENDER_CREDITS, sheet: SHEET_CREDITS },
    now: Date.now(),
  };
  return <AppShell data={data}>{children}</AppShell>;
}
