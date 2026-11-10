import type { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';

// The signed-in web app: a dashboard for what your agent generates, your library and connectors.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
      <aside className="lg:sticky lg:top-24 lg:w-48 lg:shrink-0 lg:self-start">
        <DashboardNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
