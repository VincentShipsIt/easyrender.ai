import { db } from '@easyrender/db';
import { captureServer } from './analytics';
import { ATTRIBUTION_KEYS, type Attribution, hasFirstTouch, pickAttribution } from './attribution';

/** The existing anonymous ownership proof authorizes the preview, never stores attribution. */
export async function signupAttribution(input: {
  userId: string;
  anonId: string | null;
  attribution: Attribution;
  method: 'email' | 'google' | 'otro';
}) {
  const preview = input.anonId
    ? await db().render.findFirst({
        where: { anonId: input.anonId, userId: null },
        orderBy: { createdAt: 'asc' },
      })
    : null;
  const attribution =
    preview && hasFirstTouch(preview) ? pickAttribution(preview) : input.attribution;
  const result = await db().user.updateMany({
    where: { id: input.userId, AND: ATTRIBUTION_KEYS.map((key) => ({ [key]: null })) },
    data: attribution,
  });
  if (preview)
    await db().render.updateMany({
      where: { anonId: input.anonId, userId: null },
      data: { userId: input.userId },
    });
  if (result.count)
    captureServer(
      'signup',
      input.userId,
      { userId: input.userId, previewId: preview?.id ?? null, source: 'web', attribution },
      {
        method: input.method,
        had_preview_before: Boolean(preview),
        preview_id_before: preview?.id ?? null,
      },
      preview ? `pv_${preview.id}` : undefined,
    );
}
