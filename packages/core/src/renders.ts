import { db, type Render } from '@easyrender/db';
import {
  BUILD_MODEL,
  buildCostUsd,
  buildRequest,
  checkGlb,
  checkNote,
  checkPhoto,
  checkSheet,
  cleanNote,
  createReplicate,
  cutCells,
  download,
  findGlbUrl,
  isSettled,
  loadHarness,
  RENDER_CREDITS,
  SHEET_CREDITS,
  SHEET_MODEL,
  selectMaterials,
  selectSkillFrom,
  sheetOutputUrl,
  sheetRequest,
} from '@easyrender/harness';
import { config } from './config';
import { grantCredits, spendCredits } from './credits';
import { AppError, notFound } from './errors';
import { getFile, putFile } from './storage';

// Who is asking: a signed-in user, an anonymous visitor (cookie), or both.
export type Actor = { userId?: string | null; anonId?: string | null; ipHash?: string | null };

export type RenderSource = 'web' | 'mcp' | 'api';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DAY_MS = 24 * 60 * 60 * 1000;
// A sheet takes ~1 minute and a 3D build ~2: anything still running after this has been lost.
const STALE_MS = 45 * 60 * 1000;

const harness = () => loadHarness({ token: config.harnessToken() });
const replicate = () => createReplicate(config.replicateToken());
const extension = (contentType: string) =>
  contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin';

export function canAccess(render: Pick<Render, 'userId' | 'anonId'>, actor: Actor): boolean {
  if (render.userId) return render.userId === actor.userId;
  return Boolean(render.anonId && render.anonId === actor.anonId);
}

// Finished renders are in the public gallery unless their owner hid them.
export const isListed = (render: Pick<Render, 'isPublic' | 'status' | 'glbKey'>) =>
  render.isPublic && render.status === 'ready' && Boolean(render.glbKey);

export const canView = (render: Render, actor: Actor) =>
  canAccess(render, actor) || isListed(render);

// Turns a failed harness check into the API error the caller sees.
function enforce(check: Awaited<ReturnType<typeof checkPhoto>>, status = 422) {
  if (!check.ok) throw new AppError(check.message, status, check.code);
  return check.warnings;
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
  // Previews that failed produced nothing, so they do not use up the allowance: an upstream outage
  // must not lock visitors out for the day.
  const used = await db().render.count({
    where: {
      createdAt: { gte: since },
      status: { not: 'failed' },
      OR: paying ? [{ userId: actor.userId as string }] : or,
    },
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
  source?: RenderSource;
}): Promise<Render> {
  if (!IMAGE_TYPES.has(input.contentType)) {
    throw new AppError('Upload a JPEG, PNG or WebP photo', 415, 'bad_type');
  }
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new AppError('Photo is larger than 4 MB', 413, 'too_large');
  }
  // Guardrails first: a bad photo or note is refused before it uses an allowance or a generation.
  const warnings = enforce(await checkPhoto(input.bytes));
  enforce(checkNote(input.prompt), 400);
  if (warnings.length > 0) console.warn(`photo warnings: ${warnings.join(', ')}`);
  await assertPreviewAllowance(input.actor);

  const ext = extension(input.contentType);
  const sourceKey = await putFile(`sources/source.${ext}`, input.bytes, input.contentType);
  const prompt = cleanNote(input.prompt) || null;
  const render = await db().render.create({
    data: {
      userId: input.actor.userId ?? null,
      anonId: input.actor.anonId ?? null,
      ipHash: input.actor.ipHash ?? null,
      prompt,
      name: input.name?.trim().slice(0, 120) || null,
      source: input.source ?? 'web',
      sourceKey,
      status: config.sheetEnabled() ? 'drafting' : 'preview_ready',
    },
  });
  if (!config.sheetEnabled()) return render;

  try {
    const client = replicate();
    const sourceUrl = await client.upload(input.bytes, `source.${ext}`, input.contentType);
    const recipe = await harness();
    const request = sheetRequest(
      sourceUrl,
      prompt,
      selectSkillFrom(recipe.skills, render.name, prompt),
      recipe.sheet,
      recipe.sheetPrompt,
      selectMaterials(render.name, prompt),
    );
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

  const stale = Date.now() - render.updatedAt.getTime() > STALE_MS;

  try {
    // Never started (the request died between claiming the render and starting Replicate).
    if (stale && !render.sheetPredictionId && !render.buildPredictionId) {
      throw new Error('never started');
    }
    if (render.status === 'drafting' && render.sheetPredictionId) {
      const prediction = await replicate().get(render.sheetPredictionId);
      if (!isSettled(prediction.status)) {
        if (stale) throw new Error('angle sheet timed out');
        return render;
      }
      const url = prediction.status === 'succeeded' ? sheetOutputUrl(prediction.output) : null;
      if (!url) throw new Error(prediction.error ?? `sheet ${prediction.status}`);
      const sheet = await download(url);
      const quality = await checkSheet(sheet, (await harness()).limits);
      if (!quality.ok) throw new Error(`sheet rejected (${quality.code}): ${quality.message}`);
      const sheetKey = await putFile('sheets/sheet.png', sheet, 'image/png');
      const { count } = await db().render.updateMany({
        where: { id, status: 'drafting' },
        data: { status: 'preview_ready', sheetKey, costUsd: { increment: SHEET_MODEL.costUsd } },
      });
      if (count === 0) return db().render.findUnique({ where: { id } });
    }

    if (render.status === 'rendering' && render.buildPredictionId) {
      const prediction = await replicate().get(render.buildPredictionId);
      if (!isSettled(prediction.status)) {
        if (stale) throw new Error('3D render timed out');
        return render;
      }
      const url = prediction.status === 'succeeded' ? findGlbUrl(prediction.output) : null;
      if (!url) throw new Error(prediction.error ?? `${BUILD_MODEL.name} ${prediction.status}`);
      const glb = await download(url);
      const quality = checkGlb(glb);
      if (!quality.ok) throw new Error(`model rejected (${quality.code}): ${quality.message}`);
      const glbKey = await putFile('models/model.glb', glb, 'model/gltf-binary');
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

  // An angle sheet bought earlier already counts toward the price.
  const alreadyPaid = render.credits;
  const owed = Math.max(0, RENDER_CREDITS - alreadyPaid);

  // Claim the render first so a double click cannot spend twice.
  const { count } = await db().render.updateMany({
    where: { id, status: 'preview_ready' },
    data: { status: 'rendering', userId: actor.userId, credits: alreadyPaid + owed },
  });
  if (count === 0) return (await db().render.findUnique({ where: { id } })) as Render;

  try {
    await spendCredits({
      userId: actor.userId,
      amount: owed,
      key: `render:${id}`,
      reason: 'render',
      renderId: id,
    });
  } catch (error) {
    await db().render.update({
      where: { id },
      data: { status: 'preview_ready', credits: alreadyPaid },
    });
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
      buildRequest(images, (await harness()).build),
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

// The angle sheet on its own, for a render that has none yet. SHEET_ENABLED=false stops the free
// sheet at upload; this is the paid, on-demand way to get one, and its price counts toward the
// 3D render.
export async function startSheet(id: string, actor: Actor): Promise<Render> {
  if (!actor.userId) throw new AppError('Sign in to generate an angle sheet', 401, 'sign_in');
  const render = await db().render.findUnique({ where: { id } });
  if (!render || !canAccess(render, actor)) throw notFound();
  if (render.sheetKey || render.sheetPredictionId) return render;
  if (render.status !== 'preview_ready') {
    throw new AppError('This render cannot get an angle sheet', 409, 'bad_state');
  }

  // Claim first so a double click cannot spend twice. `credits` marks what is paid so far.
  const { count } = await db().render.updateMany({
    where: { id, status: 'preview_ready', sheetKey: null, sheetPredictionId: null },
    data: { status: 'drafting', userId: actor.userId, credits: SHEET_CREDITS },
  });
  if (count === 0) return (await db().render.findUnique({ where: { id } })) as Render;

  try {
    await spendCredits({
      userId: actor.userId,
      amount: SHEET_CREDITS,
      key: `sheet:${id}`,
      reason: 'angle_sheet',
      renderId: id,
    });
  } catch (error) {
    await db().render.update({
      where: { id },
      data: { status: 'preview_ready', credits: render.credits, userId: render.userId },
    });
    throw error;
  }

  try {
    const client = replicate();
    const bytes = await getFile(render.sourceKey);
    const contentType = render.sourceKey.endsWith('.png')
      ? 'image/png'
      : render.sourceKey.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
    const sourceUrl = await client.upload(bytes, `source.${extension(contentType)}`, contentType);
    const recipe = await harness();
    const request = sheetRequest(
      sourceUrl,
      render.prompt,
      selectSkillFrom(recipe.skills, render.name, render.prompt),
      recipe.sheet,
      recipe.sheetPrompt,
      selectMaterials(render.name, render.prompt),
    );
    const prediction = await client.start(
      request.path,
      request.body,
      config.webhookUrl(`/api/webhooks/replicate?render=${id}`),
    );
    return await db().render.update({
      where: { id },
      data: { sourceUrl, sheetPredictionId: prediction.id },
    });
  } catch (error) {
    await fail(id, error);
    throw new AppError(
      'Could not start the angle sheet. Your credits were refunded.',
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
  // True once the 3x3 angle sheet exists. Without it the preview is the plain photo.
  hasSheet: boolean;
  hasModel: boolean;
  credits: number;
  renderCredits: number;
  sheetCredits: number;
  isPublic: boolean;
  source: RenderSource;
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
    hasSheet: Boolean(render.sheetKey),
    hasModel: render.status === 'ready' && Boolean(render.glbKey),
    credits: render.credits,
    renderCredits: RENDER_CREDITS,
    sheetCredits: SHEET_CREDITS,
    isPublic: render.isPublic,
    source: render.source as RenderSource,
    createdAt: render.createdAt.toISOString(),
  };
}

// Reads a render the actor may see (their own, or a public one), nudging its pipeline forward
// when it is still running.
export async function getRender(id: string, actor: Actor): Promise<Render> {
  const render = await db().render.findUnique({ where: { id } });
  if (!render || !canView(render, actor)) throw notFound();
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

// Shows or hides a render in the public gallery. Only its owner can.
export async function setVisibility(id: string, actor: Actor, isPublic: boolean): Promise<Render> {
  const render = await db().render.findUnique({ where: { id } });
  if (!render || !canAccess(render, actor)) throw notFound();
  if (!actor.userId || render.userId !== actor.userId) {
    throw new AppError('Sign in to change who can see this render', 401, 'sign_in');
  }
  return db().render.update({ where: { id }, data: { isPublic } });
}

export function listPublicRenders(take = 12) {
  return db().render.findMany({
    where: { isPublic: true, status: 'ready', glbKey: { not: null } },
    orderBy: { createdAt: 'desc' },
    take,
  });
}

export function listRenders(userId: string, take = 24) {
  return db().render.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take });
}

export type DashboardStats = {
  total: number;
  ready: number;
  inFlight: number;
  byAgent: number;
};

// Counts for the dashboard overview. "By agent" covers both MCP and API-key renders.
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const groups = await db().render.groupBy({
    by: ['status', 'source'],
    where: { userId },
    _count: { _all: true },
  });
  const stats: DashboardStats = { total: 0, ready: 0, inFlight: 0, byAgent: 0 };
  for (const group of groups) {
    const count = group._count._all;
    stats.total += count;
    if (group.status === 'ready') stats.ready += count;
    if (IN_FLIGHT.includes(group.status)) stats.inFlight += count;
    if (group.source !== 'web') stats.byAgent += count;
  }
  return stats;
}
