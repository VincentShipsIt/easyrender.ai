import { Coins, LayoutDashboard, Library, Plug, UserRound } from 'lucide-react';

// The app's destinations. The rail (desktop), the sidebar and the bottom bar (phones) all read
// this list, so a new page is added in one place. Labels live in messages under DashboardNav.
export const APP_NAV = [
  { href: '/dashboard', key: 'overview', icon: LayoutDashboard },
  { href: '/library', key: 'library', icon: Library },
  { href: '/connectors', key: 'connectors', icon: Plug },
  { href: '/credits', key: 'credits', icon: Coins },
] as const;

export const ACCOUNT_NAV = { href: '/account', key: 'account', icon: UserRound } as const;

// A render's page (/r/{id}) belongs to the Library it was opened from.
export const isActivePath = (pathname: string, href: string) =>
  pathname === href ||
  pathname.startsWith(`${href}/`) ||
  (href === '/library' && pathname.startsWith('/r/'));
