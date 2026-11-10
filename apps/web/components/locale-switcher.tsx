'use client';

import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { setLocale } from '@/i18n/actions';
import { LOCALE_NAMES, LOCALES } from '@/i18n/config';

// Two languages, so one button flips between them.
export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = LOCALES.find((entry) => entry !== locale) ?? LOCALES[0];

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={t('switchTo', { language: LOCALE_NAMES[next] })}
      title={t('switchTo', { language: LOCALE_NAMES[next] })}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
      className="text-muted-foreground max-sm:px-2"
    >
      <Languages />
      <span className="max-sm:hidden">{next.toUpperCase()}</span>
    </Button>
  );
}
