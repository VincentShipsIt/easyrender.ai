import { Box } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';

const COLUMNS = [
  {
    title: 'product',
    links: [
      { href: '/#how-it-works', key: 'howItWorks' },
      { href: '/#try', key: 'try' },
      { href: '/#gallery', key: 'gallery' },
      { href: '/credits', key: 'pricing' },
      { href: '/#faq', key: 'faq' },
    ],
  },
  {
    title: 'developers',
    links: [
      { href: '/#connect', key: 'mcp' },
      { href: '/connectors', key: 'apiKeys' },
    ],
  },
  {
    title: 'account',
    links: [
      { href: '/dashboard', key: 'dashboard' },
      { href: '/sign-up', key: 'signUp' },
      { href: '/sign-in', key: 'signIn' },
    ],
  },
] as const;

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Box className="size-5" />
            easyrender
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{t('tagline')}</p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="space-y-3">
            <p className="text-sm font-medium">{t(column.title)}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="transition-colors hover:text-foreground">
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <p>{t('copyright')}</p>
        <p>{t('pricesNote')}</p>
      </div>
    </footer>
  );
}
