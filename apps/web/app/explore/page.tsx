import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/gallery-grid';
import { Badge } from '@/components/ui/badge';
import { getGallery } from '@/lib/gallery';

export const metadata: Metadata = { title: 'Gallery · easyrender' };

export default async function ExplorePage() {
  const items = await getGallery(48);
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
      <div className="space-y-3">
        <Badge variant="outline">Gallery</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Made with easyrender</h1>
        <p className="text-lg text-muted-foreground">Every model here started as a single photo.</p>
      </div>
      <GalleryGrid items={items} />
    </div>
  );
}
