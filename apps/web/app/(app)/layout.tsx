import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Sign in and sign up: noindex, follow. Inherited by every page in the group.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">{children}</div>;
}
