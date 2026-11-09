import {
  type Actor,
  AppError,
  config,
  createDraft,
  getBalance,
  getRender,
  MAX_UPLOAD_BYTES,
  startBuild,
  toView,
} from '@easyrender/core';
import { CREDIT_PACKS, RENDER_CREDITS } from '@easyrender/harness';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

const ok = (data: unknown): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
});

async function run(fn: () => Promise<unknown>): Promise<ToolResult> {
  try {
    return ok(await fn());
  } catch (error) {
    const message = error instanceof AppError ? error.message : 'Unexpected error';
    if (!(error instanceof AppError)) console.error('mcp tool failed:', error);
    return { content: [{ type: 'text', text: message }], isError: true };
  }
}

function links(id: string) {
  const base = config.appUrl();
  return {
    page: `${base}/r/${id}`,
    preview: `${base}/api/renders/${id}/preview`,
    model_glb: `${base}/api/renders/${id}/model`,
  };
}

async function fetchImage(url: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  if (!url.startsWith('https://')) throw new AppError('image_url must be https', 400, 'bad_url');
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new AppError(`Could not fetch image: ${response.status}`, 400, 'bad_url');
  const contentType = response.headers.get('content-type')?.split(';')[0] ?? '';
  const length = Number(response.headers.get('content-length') ?? 0);
  if (length > MAX_UPLOAD_BYTES) throw new AppError('Photo is larger than 4 MB', 413, 'too_large');
  return { bytes: new Uint8Array(await response.arrayBuffer()), contentType };
}

// One server per request: the actor comes from the caller's API key.
export function createMcpServer(actor: Actor & { userId: string }) {
  const server = new McpServer({ name: 'easyrender', version: '0.1.0' });

  server.registerTool(
    'create_render',
    {
      title: 'Create render preview',
      description:
        'Upload a photo of an object or building exterior and start a preview: a 9-view turnaround sheet. ' +
        'Poll get_render until status is preview_ready, then call render_3d to build the 3D model.',
      inputSchema: {
        image_url: z
          .string()
          .url()
          .optional()
          .describe('Public https URL of a JPEG, PNG or WebP photo'),
        image_base64: z
          .string()
          .optional()
          .describe('Base64 photo, used when image_url is not given'),
        content_type: z
          .enum(['image/jpeg', 'image/png', 'image/webp'])
          .optional()
          .describe('Type of image_base64'),
        prompt: z.string().max(500).optional().describe('Optional notes about the object'),
      },
    },
    ({ image_url, image_base64, content_type, prompt }) =>
      run(async () => {
        const image = image_url
          ? await fetchImage(image_url)
          : image_base64
            ? {
                bytes: new Uint8Array(Buffer.from(image_base64, 'base64')),
                contentType: content_type ?? 'image/jpeg',
              }
            : null;
        if (!image) throw new AppError('Pass image_url or image_base64', 400, 'no_image');
        const render = await createDraft({ actor, prompt, ...image });
        return { ...toView(render), links: links(render.id) };
      }),
  );

  server.registerTool(
    'get_render',
    {
      title: 'Get render',
      description: 'Status of a render: drafting, preview_ready, rendering, ready or failed.',
      inputSchema: { id: z.string() },
    },
    ({ id }) =>
      run(async () => {
        const render = await getRender(id, actor);
        return { ...toView(render), links: links(render.id) };
      }),
  );

  server.registerTool(
    'render_3d',
    {
      title: 'Render in 3D',
      description: `Spend ${RENDER_CREDITS} credits to build the 3D model (GLB) of a preview_ready render. Takes about two minutes.`,
      inputSchema: { id: z.string() },
    },
    ({ id }) =>
      run(async () => {
        const render = await startBuild(id, actor);
        return { ...toView(render), links: links(render.id) };
      }),
  );

  server.registerTool(
    'get_credits',
    {
      title: 'Get credits',
      description: 'Credit balance, the cost of one 3D render and the packs for sale.',
      inputSchema: {},
    },
    () =>
      run(async () => ({
        balance: await getBalance(actor.userId),
        render_credits: RENDER_CREDITS,
        packs: CREDIT_PACKS,
        buy: `${config.appUrl()}/credits`,
      })),
  );

  return server;
}
