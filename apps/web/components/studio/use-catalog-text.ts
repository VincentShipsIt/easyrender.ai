'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { CATALOG } from '@/lib/studio/catalog';

// Element names and prompts in the visitor's language, keyed by id, for the 3D code that writes
// them into the page.
export function useCatalogText() {
  const t = useTranslations('Catalog');
  return useMemo(() => {
    const names: Record<string, string> = {};
    const prompts: Record<string, string> = {};
    for (const item of CATALOG) {
      names[item.id] = t(`items.${item.id}.name`);
      prompts[item.id] = t(`items.${item.id}.prompt`);
    }
    return { names, prompts };
  }, [t]);
}
