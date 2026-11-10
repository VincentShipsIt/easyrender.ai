import { Box } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#try', label: 'Try it' },
      { href: '/#gallery', label: 'Gallery' },
      { href: '/credits', label: 'Pricing' },
      { href: '/#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { href: '/#connect', label: 'MCP server' },
      { href: '/connectors', label: 'API keys' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/sign-up', label: 'Sign up' },
      { href: '/sign-in', label: 'Sign in' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Box className="size-5" />
            easyrender
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Your agent turns product and listing photos into 3D models you can spin, embed and open
            in AR.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="space-y-3">
            <p className="text-sm font-medium">{column.title}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <p>© 2026 easyrender. Powered by Genfeed.</p>
        <p>Prices in USD. Credits never expire.</p>
      </div>
    </footer>
  );
}
