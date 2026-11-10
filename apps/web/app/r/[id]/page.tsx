import { AppError, canAccess, getBalance, getRender, toView } from '@easyrender/core';
import { Globe, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ModelView } from '@/components/model-view';
import { formatDate, RenderDetail } from '@/components/render-detail';
import { RenderView } from '@/components/render-view';
import { Button } from '@/components/ui/button';
import { resolveActor } from '@/lib/actor';
import { findShowcase } from '@/lib/showcase';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps<'/r/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const demo = findShowcase(id);
  return { title: `${demo?.title ?? '3D render'} · easyrender` };
}

export default async function RenderPage({ params }: PageProps<'/r/[id]'>) {
  const { id } = await params;
  const demo = findShowcase(id);
  if (demo) {
    return (
      <RenderDetail
        title={demo.title}
        prompt={demo.prompt}
        badges={[demo.category, 'Example']}
        viewer={<ModelView src={demo.model} name={demo.id} downloadUrl={null} />}
        input={demo.photo}
        angles={
          demo.angles ? (
            // biome-ignore lint/performance/noImgElement: static showcase image
            <img
              src={demo.angles}
              alt="Every angle"
              className="w-full rounded-lg border bg-white"
            />
          ) : (
            <p className="flex aspect-[2/1] items-center justify-center rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
              Made from the photo alone, without an angle sheet.
            </p>
          )
        }
        meta={[
          { label: 'Status', value: 'Ready' },
          { label: 'Engine', value: demo.engine },
          { label: 'Dimensions', value: demo.dimensions },
          { label: 'Formats', value: 'GLB · USDZ' },
          {
            label: 'Visibility',
            value: (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-3.5" />
                Public
              </span>
            ),
          },
          { label: 'Created', value: formatDate(demo.createdAt) },
        ]}
        actions={
          <Button className="w-full" asChild>
            <Link href="/#top">
              <Sparkles />
              Make your own
            </Link>
          </Button>
        }
      />
    );
  }

  const actor = await resolveActor();
  const render = await getRender(id, actor).catch((error) => {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  });
  const balance = actor.userId ? await getBalance(actor.userId) : 0;
  return (
    <RenderView
      initial={toView(render)}
      signedIn={Boolean(actor.userId)}
      balance={balance}
      owner={canAccess(render, actor)}
    />
  );
}
