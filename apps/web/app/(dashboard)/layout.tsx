import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { currentUser } from '@/lib/actor';

// The app itself is noindex. /credits overrides this: it is the public pricing page.
export const metadata: Metadata = { robots: { index: false, follow: true } };

// The signed-in web app: a dashboard for what your agent generates, your library and connectors.
// Credits is public too, so visitors get it without the sidebar.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser().catch(() => null);
  if (!user) return <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">{children}</div>;
  return (
    <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
      <aside className="lg:sticky lg:top-24 lg:w-48 lg:shrink-0 lg:self-start">
        <DashboardNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
