import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ModelViewer } from '@/components/model-viewer';
import { Badge } from '@/components/ui/badge';
import type { GalleryItem } from '@/lib/gallery';

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const t = useTranslations('Gallery');
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <div className="relative aspect-square bg-gradient-to-b from-muted/20 to-muted">
            <ModelViewer src={item.model} alt={t('modelAlt', { title: item.title })} />
            {/* biome-ignore lint/performance/noImgElement: input photo thumbnail */}
            <img
              src={item.photo}
              alt={t('sourceAlt', { title: item.title })}
              loading="lazy"
              className="absolute bottom-2 left-2 size-12 rounded-md border-2 border-background object-cover shadow-md transition-transform group-hover:scale-105 sm:size-14"
            />
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-background/80 backdrop-blur"
            >
              {item.label}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2 border-t px-3 py-2.5">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}
