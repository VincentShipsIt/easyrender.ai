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
  DEFAULT_FINAL_SHEET_SETTINGS,
  download,
  FINAL_SHEET_MODEL,
  findGlbUrl,
  isSettled,
  loadHarness,
  RENDER_CREDITS,
  SHEET_CREDITS,
  SHEET_MODEL,
  selectMaterialsFrom,
  selectSkillFrom,
  sheetOutputUrl,
  sheetRequest,
} from '@easyrender/harness';
import { captureRender, deferAnalytics } from './analytics';
import { type Attribution, classifyCountry, normalizeAttribution } from './attribution';
import { config } from './config';
import { grantCredits, spendCredits } from './credits';
import { AppError, notFound } from './errors';
import { reportError } from './report';
import { getFile, putFile } from './storage';

// Who is asking: a signed-in user, an anonymous visitor (cookie), or both.
export type Actor = {
  userId?: string | null;
  anonId?: string | null;
  ipHash?: string | null;
  geoCountry?: string | null;
};

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

// A store's product page embeds its models by link, so a finished link-shared render is viewable
// by anyone who has the link even though it is not in the gallery.
export const isShared = (render: Pick<Render, 'isLinkShared' | 'status' | 'glbKey'>) =>
  render.isLinkShared && render.status === 'ready' && Boolean(render.glbKey);

export const canView = (render: Render, actor: Actor) =>
  canAccess(render, actor) || isListed(render) || isShared(render);

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
  attribution?: Attribution;
  // Viewable by link from a store's product page, without being in the gallery.
  isLinkShared?: boolean;
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
      ...(input.attribution ??
        normalizeAttribution(null, config.appUrl(), classifyCountry(input.actor.geoCountry))),
      userId: input.actor.userId ?? null,
      anonId: input.actor.anonId ?? null,
      ipHash: input.actor.ipHash ?? null,
      prompt,
      name: input.name?.trim().slice(0, 120) || null,
      source: input.source ?? 'web',
      isLinkShared: input.isLinkShared ?? false,
      isPublic: input.isLinkShared ? false : undefined,
      sourceKey,
      status: config.sheetEnabled() ? 'drafting' : 'preview_ready',
    },
  });
  if (!config.sheetEnabled()) return render;
  captureRender('preview_start', render, {
    input_type: render.source === 'web' ? 'upload' : 'api',
    entry_path: render.landing_path,
    is_logged_in: Boolean(render.userId),
  });

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
      selectMaterialsFrom(recipe.materials, render.name, prompt),
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
  reportError(error, { renderId: id, stage: 'render' });
  const render = await db().render.findUnique({ where: { id } });
  if (!render || !['drafting', 'rendering'].includes(render.status)) return;
  const { count } = await db().render.updateMany({
    where: { id, status: render.status },
    data: { status: 'failed', error: message.slice(0, 500) },
  });
  if (!count) return;
  if (render.userId && render.credits > 0) {
    await grantCredits({
      userId: render.userId,
      amount: render.credits,
      key: `refund:${render.id}`,
      reason: 'render_failed',
      renderId: render.id,
    });
  }
  captureRender(
    render.status === 'drafting' ? 'preview_failed' : 'render_failed',
    render,
    render.status === 'drafting'
      ? {
          failure_reason: 'generation_failed',
          duration_ms: Date.now() - render.createdAt.getTime(),
          input_type: render.source === 'web' ? 'upload' : 'api',
          free_preview_consumed: false,
        }
      : {
          model_id: render.id,
          failure_reason: 'generation_failed',
          duration_ms: Date.now() - render.updatedAt.getTime(),
          credits_spent: render.credits,
          credits_refunded: render.userId ? render.credits : 0,
        },
  );
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
    // The final sheet was drawn but the 3D build never started (the worker died in between).
    if (
      stale &&
      render.status === 'rendering' &&
      render.buildClaimedAt &&
      !render.buildPredictionId
    ) {
      throw new Error('3D render never started');
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
      const duration = Date.now() - render.createdAt.getTime();
      deferAnalytics(async () => {
        const used = await db().render.count({
          where: {
            createdAt: { gte: new Date(Date.now() - DAY_MS) },
            status: { not: 'failed' },
            OR: [
              ...(render.userId ? [{ userId: render.userId }] : []),
              ...(render.anonId ? [{ anonId: render.anonId }] : []),
              ...(render.ipHash ? [{ ipHash: render.ipHash }] : []),
            ],
          },
        });
        captureRender('preview_ready', render, {
          duration_ms: duration,
          free_previews_left_today: Math.max(0, config.freePreviewsPerDay() - used),
        });
      });
    }

    // A paid build redraws the sheet with the final model first; when it is done, the 3D build starts.
    if (
      render.status === 'rendering' &&
      render.finalSheetPredictionId &&
      !render.buildPredictionId
    ) {
      const prediction = await replicate().get(render.finalSheetPredictionId);
      if (!isSettled(prediction.status)) {
        if (stale) throw new Error('final angle sheet timed out');
        return render;
      }
      // A final sheet that failed or was rejected never fails the build: it carries on from the
      // draft the visitor already saw, and the problem is reported.
      let finalSheet: Uint8Array | null = null;
      try {
        const url = prediction.status === 'succeeded' ? sheetOutputUrl(prediction.output) : null;
        if (!url) throw new Error(prediction.error ?? `final sheet ${prediction.status}`);
        const bytes = await download(url);
        const quality = await checkSheet(bytes, (await harness()).limits);
        if (!quality.ok) throw new Error(`sheet rejected (${quality.code}): ${quality.message}`);
        finalSheet = bytes;
      } catch (error) {
        reportError(error, { renderId: id, stage: 'final_sheet' });
      }
      const finalKey = finalSheet
        ? await putFile('sheets/sheet.png', finalSheet, 'image/png')
        : null;
      // Only the call that wins this claim starts the build, so webhook and polling cannot both.
      const { count } = await db().render.updateMany({
        where: { id, status: 'rendering', buildPredictionId: null, buildClaimedAt: null },
        data: {
          buildClaimedAt: new Date(),
          ...(finalKey
            ? { sheetKey: finalKey, costUsd: { increment: FINAL_SHEET_MODEL.costUsd } }
            : {}),
        },
      });
      if (count === 0) return db().render.findUnique({ where: { id } });
      const sheetForBuild = finalSheet ?? (render.sheetKey ? await getFile(render.sheetKey) : null);
      const started = await startThreeD(id, render.sourceKey, sheetForBuild);
      await db().render.update({ where: { id }, data: { buildPredictionId: started.id } });
      return db().render.findUnique({ where: { id } });
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
      const { count } = await db().render.updateMany({
        where: { id, status: 'rendering' },
        data: {
          status: 'ready',
          glbKey,
          costUsd: { increment: buildCostUsd(prediction.metrics?.predict_time) },
        },
      });
      if (count)
        captureRender('render_ready', render, {
          model_id: id,
          duration_ms: Date.now() - (render.buildClaimedAt ?? render.updatedAt).getTime(),
          in_public_gallery: render.isPublic,
          formats: 'glb,usdz',
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

  captureRender(
    'render_start',
    { ...render, userId: actor.userId, credits: alreadyPaid + owed },
    { model_id: id, credits_spent: owed },
  );
  try {
    // A paid build draws the final sheet first (the visitor saw a cheaper draft); the 3D build
    // starts when it is done, in advance(). Without a draft the build runs from the photo alone.
    if (render.sheetKey) {
      const client = replicate();
      const source = await getFile(render.sourceKey);
      const sourceUrl = await client.upload(source, 'source.jpg', 'image/jpeg');
      const recipe = await harness();
      const request = sheetRequest(
        sourceUrl,
        render.prompt,
        selectSkillFrom(recipe.skills, render.name, render.prompt),
        DEFAULT_FINAL_SHEET_SETTINGS,
        recipe.sheetPrompt,
        selectMaterialsFrom(recipe.materials, render.name, render.prompt),
      );
      try {
        const prediction = await client.start(
          request.path,
          request.body,
          config.webhookUrl(`/api/webhooks/replicate?render=${id}`),
        );
        return await db().render.update({
          where: { id },
          data: { finalSheetPredictionId: prediction.id },
        });
      } catch (error) {
        // The final model could not be started: build from the draft rather than fail a paid job.
        reportError(error, { renderId: id, stage: 'final_sheet_start' });
      }
    }
    const sheet = render.sheetKey ? await getFile(render.sheetKey) : null;
    const prediction = await startThreeD(id, render.sourceKey, sheet);
    return await db().render.update({
      where: { id },
      data: { buildPredictionId: prediction.id, buildClaimedAt: new Date() },
    });
  } catch (error) {
    await fail(id, error);
    throw new AppError(
      'Could not start the 3D render. Your credits were refunded.',
      502,
      'upstream',
    );
  }
}

// Starts the 3D build from the photo and, when there is one, the sheet's nine views.
async function startThreeD(id: string, sourceKey: string, sheet: Uint8Array | null) {
  const client = replicate();
  const source = await getFile(sourceKey);
  const images = [await client.upload(source, 'source.jpg', 'image/jpeg')];
  if (sheet) {
    for (const [index, cell] of (await cutCells(sheet)).entries()) {
      images.push(await client.upload(cell, `view-${index}.png`, 'image/png'));
    }
  }
  return client.start(
    '/predictions',
    buildRequest(images, (await harness()).build),
    config.webhookUrl(`/api/webhooks/replicate?render=${id}`),
  );
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

  captureRender(
    'preview_start',
    { ...render, userId: actor.userId },
    {
      input_type: render.source === 'web' ? 'upload' : 'api',
      entry_path: render.landing_path,
      is_logged_in: true,
    },
  );
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
      selectMaterialsFrom(recipe.materials, render.name, render.prompt),
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
  // Changes when the render does, including its material edits: a viewer adds it to the model URL
  // so it never shows a cached copy of an older look.
  modelVersion: number;
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
    modelVersion: render.updatedAt.getTime(),
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
