import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GalleryGrid } from '@/components/gallery-grid';
import { Badge } from '@/components/ui/badge';
import { getGallery } from '@/lib/gallery';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Explore');
  return { title: t('metaTitle') };
}

export default async function ExplorePage() {
  const [items, t] = await Promise.all([getGallery(48), getTranslations('Explore')]);
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
      <div className="space-y-3">
        <Badge variant="outline">{t('eyebrow')}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </div>
      <GalleryGrid items={items} />
    </div>
  );
}
