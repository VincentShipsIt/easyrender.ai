import { Box, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ModelViewer } from '@/components/model-viewer';
import { Badge } from '@/components/ui/badge';
import type { ShowcaseItem } from '@/lib/showcase';

// A finished render floating next to the prompt bar: the input photo in, the 3D model out.
export function HeroShowcase({ item }: { item: ShowcaseItem }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
      <div className="pointer-events-none absolute inset-[8%] rounded-full bg-gradient-to-tr from-zinc-300/60 via-zinc-100/40 to-transparent blur-3xl dark:from-zinc-700/50 dark:via-zinc-800/30" />
      <div className="animate-float absolute inset-0">
        <ModelViewer
          src={item.model}
          alt={`3D model: ${item.title}`}
          interactive
          zoom={false}
          lazy={false}
          rotationSpeed="18deg"
        />
      </div>
      <div className="animate-float-slow absolute bottom-[6%] left-0 flex items-center gap-3 rounded-xl border bg-card/90 p-2 pr-4 shadow-lg backdrop-blur sm:left-[2%]">
        {/* biome-ignore lint/performance/noImgElement: small static thumbnail */}
        <img src={item.photo} alt="" className="size-14 rounded-lg border object-cover" />
        <div className="text-xs leading-tight">
          <p className="text-muted-foreground">Input photo</p>
          <p className="font-medium">{item.title}</p>
          <p className="text-muted-foreground">{item.dimensions}</p>
        </div>
      </div>
      <Link
        href={`/r/${item.id}`}
        className="animate-float-slow absolute top-[8%] right-0 sm:right-[4%]"
      >
        <Badge variant="secondary" className="gap-1.5 border px-2.5 py-1 shadow-md backdrop-blur">
          <Sparkles />
          Generated in ~2 min
        </Badge>
      </Link>
      <Badge
        variant="outline"
        className="absolute right-[6%] bottom-[14%] hidden gap-1.5 bg-background/80 backdrop-blur sm:flex"
      >
        <Box />
        Drag to spin · View in AR
      </Badge>
    </div>
  );
}
