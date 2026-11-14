'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/config';
import { isPublished, ROUTES } from '@/lib/seo/routes';
import { headerSectionHref } from '@/lib/site-navigation';

// Layouts persist across client navigation. Resolve section links from the live pathname.
export function HeaderNavItem({
  locale,
  href,
  hash,
  isMobile = false,
  children,
}: {
  locale: Locale;
  href: string;
  hash?: string;
  isMobile?: boolean;
  children: ReactNode;
}) {
  const path = usePathname();
  return (
    <Button
      variant="ghost"
      size={isMobile ? 'default' : 'sm'}
      className={isMobile ? 'justify-start' : undefined}
      asChild
    >
      <Link
        href={hash ? headerSectionHref(locale, path, hash) : href}
        className="text-muted-foreground"
      >
        {children}
      </Link>
    </Button>
  );
}

export function HeaderConnect({
  locale,
  connect,
  suffix,
  apiLabel,
}: {
  locale: Locale;
  connect: string;
  suffix: string;
  apiLabel: string;
}) {
  const path = usePathname();
  const isApiPage = isPublished('api', locale) && path === ROUTES.api.paths[locale];
  return (
    <Button size="sm" asChild>
      <Link href={headerSectionHref(locale, path, '#connect')}>
        <span>
          {isApiPage ? apiLabel : connect}
          {!isApiPage && suffix ? <span className="hidden sm:inline"> {suffix}</span> : null}
        </span>
      </Link>
    </Button>
  );
}
