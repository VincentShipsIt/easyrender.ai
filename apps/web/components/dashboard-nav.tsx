'use client';

import { Coins, LayoutDashboard, Library, Plug, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard', key: 'overview', icon: LayoutDashboard },
  { href: '/library', key: 'library', icon: Library },
  { href: '/connectors', key: 'connectors', icon: Plug },
  { href: '/credits', key: 'credits', icon: Coins },
  { href: '/account', key: 'account', icon: UserRound },
] as const;

// Sidebar on desktop, a scrollable tab row on mobile.
export function DashboardNav() {
  const t = useTranslations('DashboardNav');
  const pathname = usePathname();
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
