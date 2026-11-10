import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">{children}</div>;
}
