import { AppError, getBalance, getRender, toView } from '@easyrender/core';
import { notFound } from 'next/navigation';
import { RenderView } from '@/components/render-view';
import { resolveActor } from '@/lib/actor';

export const dynamic = 'force-dynamic';

export default async function RenderPage({ params }: PageProps<'/r/[id]'>) {
  const { id } = await params;
  const actor = await resolveActor();
  const render = await getRender(id, actor).catch((error) => {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  });
  const balance = actor.userId ? await getBalance(actor.userId) : 0;
  return <RenderView initial={toView(render)} signedIn={Boolean(actor.userId)} balance={balance} />;
}
