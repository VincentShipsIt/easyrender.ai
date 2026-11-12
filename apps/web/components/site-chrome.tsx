import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

// The marketing frame: the site header and footer around a page. The signed-in app does not use
// it, it has its own shell (components/app-shell). Both sit under the same root layout, which
// holds the fonts, the translations and analytics.
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
