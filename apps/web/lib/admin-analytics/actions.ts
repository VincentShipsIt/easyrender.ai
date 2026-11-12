'use server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from './auth';
import { ANALYTICS_TAG } from './data';
export async function refreshAnalytics() {
  await requireAdmin();
  revalidateTag(ANALYTICS_TAG, { expire: 0 });
}
