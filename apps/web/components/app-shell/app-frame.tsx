import { getBalance, getDashboardStats, listApiKeys, listRenders } from '@easyrender/core';
import { RENDER_CREDITS, SHEET_CREDITS } from '@easyrender/harness';
import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/site-chrome';
import { currentUser } from '@/lib/actor';
import { AppShell } from './app-shell';
import type { ShellData } from './types';

const LATEST = 12;

// The frame for pages a signed-in person uses inside the app: the app shell. A visitor who is not
// signed in gets the page inside the marketing frame instead, so public links (pricing, a shared
// render) keep working. `publicInset` wraps the page for that frame when it has no layout of its own.
export async function AppFrame({
  children,
  publicInset = false,
}: {
  children: ReactNode;
  publicInset?: boolean;
}) {
  const user = await currentUser().catch(() => null);
  if (!user) {
    return (
      <SiteChrome>
        {publicInset ? (
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">{children}</div>
        ) : (
          children
        )}
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
