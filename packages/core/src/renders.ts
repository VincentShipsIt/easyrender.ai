import { db, type Render } from '@easyrender/db';
import {
  BUILD_MODEL,
  buildCostUsd,
  buildRequest,
  createReplicate,
  cutCells,
  download,
  findGlbUrl,
  isSettled,
  RENDER_CREDITS,
  SHEET_MODEL,
  sheetOutputUrl,
  sheetRequest,
} from '@easyrender/harness';
import { config } from './config';
import { grantCredits, spendCredits } from './credits';
import { AppError, notFound } from './errors';
import { getFile, putFile } from './storage';

// Who is asking: a signed-in user, an anonymous visitor (cookie), or both.
export type Actor = { userId?: string | null; anonId?: string | null; ipHash?: string | null };

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DAY_MS = 24 * 60 * 60 * 1000;

const replicate = () => createReplicate(config.replicateToken());
const extension = (contentType: string) =>
  contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin';

export function canAccess(render: Pick<Render, 'userId' | 'anonId'>, actor: Actor): boolean {
  if (render.userId) return render.userId === actor.userId;
  return Boolean(render.anonId && render.anonId === actor.anonId);
}

// Each preview costs a real sheet generation, so visitors get a small daily allowance.
async function assertPreviewAllowance(actor: Actor) {
  const since = new Date(Date.now() - DAY_MS);
  const or = [
    actor.userId ? { userId: actor.userId } : null,
    actor.anonId ? { anonId: actor.anonId } : null,
    actor.ipHash ? { ipHash: actor.ipHash } : null,
  ].filter((clause) => clause !== null);
  if (or.length === 0) throw new AppError('Missing visitor id', 400, 'no_actor');

  const user = actor.userId
    ? await db().user.findUnique({ where: { id: actor.userId }, select: { credits: true } })
    : null;
  const credits = user?.credits ?? 0;
  const paying = credits >= RENDER_CREDITS;
  // A paying user can always preview as many items as their balance can build, so a catalog
  // import is not capped at the daily allowance.
  const limit = paying
    ? Math.max(config.paidPreviewsPerDay(), Math.floor(credits / RENDER_CREDITS))
    : config.freePreviewsPerDay();
  const used = await db().render.count({
    where: { createdAt: { gte: since }, OR: paying ? [{ userId: actor.userId as string }] : or },
  });
  if (used >= limit) {
    throw new AppError(
      paying
        ? 'Daily preview limit reached. Try again tomorrow.'
        : 'Free previews used up for today. Buy credits to keep going.',
      429,
      'preview_limit',
    );
  }
}

export async function createDraft(input: {
  actor: Actor;
  bytes: Uint8Array;
  contentType: string;
  prompt?: string | null;
  name?: string | null;
}): Promise<Render> {
  if (!IMAGE_TYPES.has(input.contentType)) {
    throw new AppError('Upload a JPEG, PNG or WebP photo', 415, 'bad_type');
  }
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new AppError('Photo is larger than 4 MB', 413, 'too_large');
  }
  await assertPreviewAllowance(input.actor);

  const ext = extension(input.contentType);
  const sourceKey = await putFile(`sources/source.${ext}`, input.bytes, input.contentType);
  const prompt = input.prompt?.trim().slice(0, 500) || null;
  const render = await db().render.create({
    data: {
      userId: input.actor.userId ?? null,
      anonId: input.actor.anonId ?? null,
      ipHash: input.actor.ipHash ?? null,
      prompt,
      name: input.name?.trim().slice(0, 120) || null,
      sourceKey,
      status: config.sheetEnabled() ? 'drafting' : 'preview_ready',
    },
  });
  if (!config.sheetEnabled()) return render;

  try {
    const client = replicate();
    const sourceUrl = await client.upload(input.bytes, `source.${ext}`, input.contentType);
    const request = sheetRequest(sourceUrl, prompt);
    const prediction = await client.start(
      request.path,
      request.body,
      config.webhookUrl(`/api/webhooks/replicate?render=${render.id}`),
    );
    return await db().render.update({
      where: { id: render.id },
      data: { sourceUrl, sheetPredictionId: prediction.id },
    });
  } catch (error) {
    await fail(render.id, error);
    throw new AppError('Could not start the preview. Try again in a minute.', 502, 'upstream');
  }
}

async function fail(id: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`render ${id} failed:`, message);
  const render = await db().render.update({
    where: { id },
    data: { status: 'failed', error: message.slice(0, 500) },
  });
  if (render.userId && render.credits > 0) {
    await grantCredits({
      userId: render.userId,
      amount: render.credits,
      key: `refund:${render.id}`,
      reason: 'render_failed',
      renderId: render.id,
    });
  }
}

// Moves a render forward if its Replicate job finished. Called by polling and by the webhook;
// it always re-reads the prediction from Replicate, so it is safe to call with any input.
export async function advance(id: string): Promise<Render | null> {
  const render = await db().render.findUnique({ where: { id } });
  if (!render) return null;

  try {
    if (render.status === 'drafting' && render.sheetPredictionId) {
      const prediction = await replicate().get(render.sheetPredictionId);
      if (!isSettled(prediction.status)) return render;
      const url = prediction.status === 'succeeded' ? sheetOutputUrl(prediction.output) : null;
      if (!url) throw new Error(prediction.error ?? `sheet ${prediction.status}`);
      const sheetKey = await putFile('sheets/sheet.png', await download(url), 'image/png');
      const { count } = await db().render.updateMany({
        where: { id, status: 'drafting' },
        data: { status: 'preview_ready', sheetKey, costUsd: { increment: SHEET_MODEL.costUsd } },
      });
      if (count === 0) return db().render.findUnique({ where: { id } });
    }

    if (render.status === 'rendering' && render.buildPredictionId) {
      const prediction = await replicate().get(render.buildPredictionId);
      if (!isSettled(prediction.status)) return render;
      const url = prediction.status === 'succeeded' ? findGlbUrl(prediction.output) : null;
      if (!url) throw new Error(prediction.error ?? `${BUILD_MODEL.name} ${prediction.status}`);
      const glbKey = await putFile('models/model.glb', await download(url), 'model/gltf-binary');
      await db().render.updateMany({
        where: { id, status: 'rendering' },
        data: {
          status: 'ready',
          glbKey,
          costUsd: { increment: buildCostUsd(prediction.metrics?.predict_time) },
        },
      });
    }
  } catch (error) {
    const current = await db().render.findUnique({ where: { id }, select: { status: true } });
    if (current?.status === 'drafting' || current?.status === 'rendering') await fail(id, error);
  }
  return db().render.findUnique({ where: { id } });
}

// The paid step: spends credits, then builds the 3D model from the photo and the sheet's views.
export async function startBuild(id: string, actor: Actor): Promise<Render> {
  if (!actor.userId) throw new AppError('Sign in to render in 3D', 401, 'sign_in');
  const render = await db().render.findUnique({ where: { id } });
  if (!render || !canAccess(render, actor)) throw notFound();
  if (render.status !== 'preview_ready') {
    if (render.status === 'rendering' || render.status === 'ready') return render;
    throw new AppError('This render cannot be built', 409, 'bad_state');
  }

  // Claim the render first so a double click cannot spend twice.
  const { count } = await db().render.updateMany({
    where: { id, status: 'preview_ready' },
    data: { status: 'rendering', userId: actor.userId, credits: RENDER_CREDITS },
  });
  if (count === 0) return (await db().render.findUnique({ where: { id } })) as Render;

  try {
    await spendCredits({
      userId: actor.userId,
      amount: RENDER_CREDITS,
      key: `render:${id}`,
      reason: 'render',
      renderId: id,
    });
  } catch (error) {
    await db().render.update({ where: { id }, data: { status: 'preview_ready', credits: 0 } });
    throw error;
  }

  try {
    const client = replicate();
    const source = await getFile(render.sourceKey);
    const images = [await client.upload(source, 'source.jpg', 'image/jpeg')];
    if (render.sheetKey) {
      const cells = await cutCells(await getFile(render.sheetKey));
      for (const [index, cell] of cells.entries()) {
        images.push(await client.upload(cell, `view-${index}.png`, 'image/png'));
      }
    }
    const prediction = await client.start(
      '/predictions',
      buildRequest(images),
      config.webhookUrl(`/api/webhooks/replicate?render=${id}`),
    );
    return await db().render.update({ where: { id }, data: { buildPredictionId: prediction.id } });
  } catch (error) {
    await fail(id, error);
    throw new AppError(
      'Could not start the 3D render. Your credits were refunded.',
      502,
      'upstream',
    );
  }
}

export type RenderView = {
  id: string;
  status: Render['status'];
  prompt: string | null;
  name: string | null;
  error: string | null;
  hasPreview: boolean;
  hasModel: boolean;
  credits: number;
  renderCredits: number;
  createdAt: string;
};

export function toView(render: Render): RenderView {
  return {
    id: render.id,
    status: render.status,
    prompt: render.prompt,
    name: render.name,
    error: render.status === 'failed' ? 'Generation failed. Credits, if any, were refunded.' : null,
    hasPreview: render.status !== 'drafting' && render.status !== 'failed',
    hasModel: render.status === 'ready' && Boolean(render.glbKey),
    credits: render.credits,
    renderCredits: RENDER_CREDITS,
    createdAt: render.createdAt.toISOString(),
  };
}

// Reads a render the actor may see, nudging its pipeline forward when it is still running.
export async function getRender(id: string, actor: Actor): Promise<Render> {
  const render = await db().render.findUnique({ where: { id } });
  if (!render || !canAccess(render, actor)) throw notFound();
  if (render.status === 'drafting' || render.status === 'rendering') {
    return (await advance(id)) ?? render;
  }
  return render;
}

const IN_FLIGHT: Render['status'][] = ['drafting', 'rendering'];
const MAX_ADVANCE_PER_LIST = 8;

// The user's whole catalog, newest first. Nudges a few in-flight items forward so the
// library makes progress even where Replicate cannot call the webhook (local dev).
export async function listLibrary(userId: string, take = 500): Promise<Render[]> {
  const renders = await db().render.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take,
  });
  const stale = renders
    .filter((render) => IN_FLIGHT.includes(render.status))
    .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
    .slice(0, MAX_ADVANCE_PER_LIST);
  if (stale.length === 0) return renders;
  const advanced = new Map(
    (await Promise.all(stale.map((render) => advance(render.id))))
      .filter((render) => render !== null)
      .map((render) => [render.id, render]),
  );
  return renders.map((render) => advanced.get(render.id) ?? render);
}

export function listRenders(userId: string, take = 24) {
  return db().render.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take });
}
