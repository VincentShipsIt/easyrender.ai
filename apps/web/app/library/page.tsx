import { getBalance, listLibrary, toView } from '@easyrender/core';
import { RENDER_CREDITS } from '@easyrender/harness';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CatalogLibrary } from '@/components/catalog-library';
import { currentUser } from '@/lib/actor';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Library · easyrender' };

export default async function LibraryPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in?next=/library');
  const [renders, balance] = await Promise.all([listLibrary(user.id), getBalance(user.id)]);
  return (
    <CatalogLibrary
      initial={renders.map(toView)}
      initialBalance={balance}
      renderCredits={RENDER_CREDITS}
    />
  );
}
