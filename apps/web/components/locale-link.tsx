'use client';

import type { ComponentProps } from 'react';
import type { Locale } from '@/i18n/config';
import { HOME_LOCALE_COOKIE, HOME_LOCALE_MAX_AGE } from '@/lib/home-locale-constants';

type LocaleLinkProps = ComponentProps<'a'> & { href: string; locale: Locale };

/**
 * A plain link to the same page in another language, server rendered and crawlable. Clicking it
 * also remembers the language for the marketing root, so / stops redirecting by country. Without
 * JavaScript the link still works, and proxy.ts reads the Referer instead (lib/home-locale.ts).
 * A full page load, not a client navigation, because the new page has another <html lang>.
 */
export function LocaleLink({ href, locale, onClick, ...props }: LocaleLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        // biome-ignore lint/suspicious/noDocumentCookie: one first-party preference cookie, read only by proxy.ts.
        document.cookie = `${HOME_LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${HOME_LOCALE_MAX_AGE}; SameSite=Lax${secure}`;
        onClick?.(event);
      }}
    />
  );
}
