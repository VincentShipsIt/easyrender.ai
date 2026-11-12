import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Hub } from '@/components/studio/hub';
import { StudioClosing } from '@/components/studio/proof';
import { StudioShell } from '@/components/studio/shell';
import { currentUser } from '@/lib/actor';
import { noindexMetadata } from '@/lib/seo/metadata';
import { CATEGORIES, type CategoryKey } from '@/lib/studio/catalog';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Hub');
  return noindexMetadata(t('metaTitle'), t('metaDescription'));
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// Every element in the hub with its spec sheet. /hub?category=props filters, /hub#lamp opens one.
export default async function HubPage({ searchParams }: PageProps<'/hub'>) {
  const [params, user, t] = await Promise.all([
    searchParams,
    currentUser().catch(() => null),
    getTranslations('Hub'),
  ]);
  const category = first(params.category);
  return (
    <StudioShell>
      <Hub
        initialCategory={
          CATEGORIES.includes(category as CategoryKey) ? (category as CategoryKey) : null
        }
        initialQuery={first(params.q) ?? ''}
      />
      <StudioClosing
        title={t('cta.title')}
        label={t('cta.button')}
        href={user ? '/dashboard' : '/sign-up'}
      />
    </StudioShell>
  );
}
