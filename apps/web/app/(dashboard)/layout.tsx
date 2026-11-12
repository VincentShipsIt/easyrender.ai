import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppFrame } from '@/components/app-shell/app-frame';

// The app itself is noindex. /credits overrides this: it is the public pricing page.
export const metadata: Metadata = { robots: { index: false, follow: true } };

// The signed-in web app: its own shell, no marketing header. Credits is public too, so a visitor
// who is not signed in gets that page inside the marketing frame instead.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppFrame publicInset>{children}</AppFrame>;
}
