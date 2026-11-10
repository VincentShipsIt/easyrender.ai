// The images a guide may show, with their real pixel size. next/image needs width and height to
// reserve the space before the file loads, and a guide must never show a picture that is not real
// easyrender output or a real screenshot (decisiones/claims.md). So the list is closed: a path
// that is not here is rendered as plain text, which makes it obvious in review, and a test fails.
//
// All of these come from public/showcase (see lib/showcase.ts): the input photos of the demo
// renders and the free angle sheets the easyrender harness drew from them, unretouched.

export type BlogImage = { width: number; height: number };

export const BLOG_IMAGES: Record<string, BlogImage> = {
  '/showcase/armchair.jpg': { width: 720, height: 720 },
  '/showcase/armchair-angles.jpg': { width: 1200, height: 1200 },
  '/showcase/vase.jpg': { width: 720, height: 720 },
  '/showcase/swivel-chair.jpg': { width: 720, height: 720 },
  '/showcase/bedside-table.jpg': { width: 720, height: 720 },
  '/showcase/vase-angles.jpg': { width: 1200, height: 1200 },
};

// The 3D models a guide may embed, from the same closed source: the GLBs in public/showcase are
// easyrender output from one photo (see lib/showcase.ts), with their textures compressed to WebP
// by glTF Transform for the web. Each one has a poster: a still of that same GLB in model-viewer,
// with the camera at `orbit`, captured in headless Chromium and not edited. The poster is in the
// server HTML, so a crawler or a reader without JavaScript sees the model and its caption; the
// viewer replaces it once it has loaded, from the same starting camera, so nothing jumps.
export type BlogModel = { poster: string; width: number; height: number; orbit: string };

export const BLOG_MODELS: Record<string, BlogModel> = {
  '/showcase/armchair.glb': {
    poster: '/blog/models/armchair.webp',
    width: 960,
    height: 960,
    orbit: '30deg 75deg auto',
  },
  '/showcase/swivel-chair.glb': {
    poster: '/blog/models/swivel-chair.webp',
    width: 960,
    height: 960,
    orbit: '30deg 75deg auto',
  },
  '/showcase/bedside-table.glb': {
    poster: '/blog/models/bedside-table.webp',
    width: 960,
    height: 960,
    orbit: '-60deg 75deg auto',
  },
  '/showcase/clay-vase.glb': {
    poster: '/blog/models/clay-vase.webp',
    width: 960,
    height: 960,
    orbit: '30deg 75deg auto',
  },
  '/showcase/coffee-table.glb': {
    poster: '/blog/models/coffee-table.webp',
    width: 960,
    height: 960,
    orbit: '30deg 75deg auto',
  },
};

const IMAGE = /!\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/;

/**
 * `![alt](/path "caption")`, or null when the line is not exactly one image. A path in BLOG_MODELS
 * is a 3D model: `model` holds its poster and `size` the poster's size.
 */
export function parseImage(line: string): {
  alt: string;
  src: string;
  caption?: string;
  size: BlogImage | null;
  model?: BlogModel;
} | null {
  const match = new RegExp(`^${IMAGE.source}$`).exec(line.trim());
  if (!match) return null;
  const src = match[2] as string;
  const model = BLOG_MODELS[src];
  return {
    alt: match[1] as string,
    src,
    ...(match[3] ? { caption: match[3] } : {}),
    size: model ? { width: model.width, height: model.height } : (BLOG_IMAGES[src] ?? null),
    ...(model ? { model } : {}),
  };
}

// Google asks for article images at least 1200 pixels wide, so smaller ones stay in the body only.
const MIN_SCHEMA_WIDTH = 1200;

/** The first known image of a post body wide enough for the BlogPosting image, or null. */
export function schemaImage(body: string): { src: string; width: number; height: number } | null {
  for (const line of body.split('\n')) {
    const image = parseImage(line);
    if (image?.size && !image.model && image.size.width >= MIN_SCHEMA_WIDTH)
      return { src: image.src, ...image.size };
  }
  return null;
}
