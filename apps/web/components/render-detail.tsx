import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export type DetailMeta = { label: string; value: ReactNode };

// Shared layout of a generation's page: the result, then what it was made from.
export function RenderDetail({
  title,
  prompt,
  badges,
  viewer,
  input,
  angles,
  meta,
  actions,
}: {
  title: string;
  prompt: string | null;
  badges?: string[];
  viewer: ReactNode;
  input: string | null;
  angles: ReactNode;
  meta: DetailMeta[];
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground">
          Gallery
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate text-foreground">{title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          {viewer}
          <div className="grid items-start gap-4 sm:grid-cols-[1fr_2fr]">
            <Card className="gap-3 py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-sm">Input photo</CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                {input ? (
                  // biome-ignore lint/performance/noImgElement: served by our own API or /public
                  <img
                    src={input}
                    alt={`Source of ${title}`}
                    className="aspect-square w-full rounded-lg border bg-white object-contain"
                  />
                ) : (
                  <div className="aspect-square w-full rounded-lg border bg-muted" />
                )}
              </CardContent>
            </Card>
            <Card className="gap-3 py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-sm">Every angle</CardTitle>
              </CardHeader>
              <CardContent className="px-4">{angles}</CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader className="gap-3">
              {badges && badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
              <CardTitle className="text-xl leading-tight">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Prompt
                </p>
                <p className="rounded-lg border bg-muted/40 p-3 text-sm">
                  {prompt || <span className="text-muted-foreground">No prompt, photo only</span>}
                </p>
              </div>
              <Separator />
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {meta.map((row) => (
                  <div key={row.label} className="contents">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {actions && (
                <>
                  <Separator />
                  <div className="space-y-3">{actions}</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
