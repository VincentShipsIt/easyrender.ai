import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/site-chrome';

// Every public page: the home, the gallery, the hub, guides, comparisons and the Shopify and OAuth
// screens. The paths are unchanged, the group only decides which frame they sit in.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
