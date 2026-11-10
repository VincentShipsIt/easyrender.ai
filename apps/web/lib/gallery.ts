import 'server-only';
import { listPublicRenders } from '@easyrender/core';
import { SHOWCASE } from './showcase';

export type GalleryItem = {
  id: string;
  href: string;
  title: string;
  photo: string;
  model: string;
  label: string;
};

// Public renders first, topped up with the demo set so the gallery is never empty.
export async function getGallery(size = 8): Promise<GalleryItem[]> {
  const renders = await (async () => listPublicRenders(size))().catch((error) => {
    console.error('gallery: could not list public renders', error);
    return [];
  });
  const items: GalleryItem[] = renders.map((render) => ({
    id: render.id,
    href: `/r/${render.id}`,
    title: render.prompt || 'Untitled render',
    photo: `/api/renders/${render.id}/source`,
    model: `/api/renders/${render.id}/model`,
    label: '3D model',
  }));
  for (const demo of SHOWCASE) {
    if (items.length >= size) break;
    items.push({
      id: demo.id,
      href: `/r/${demo.id}`,
      title: demo.title,
      photo: demo.photo,
      model: demo.model,
      label: demo.category,
    });
  }
  return items;
}
