// The images a guide may show, with their real pixel size. next/image needs width and height to
// reserve the space before the file loads, and a guide must never show a picture that is not real
// easyrender output or a real screenshot (decisiones/claims.md). So the list is closed: a path
// that is not here is rendered as plain text, which makes it obvious in review, and a test fails.
//
// All of these are unretouched output of the easyrender harness, from public/showcase (see
// lib/showcase.ts): the input photo and the free angle sheet drawn from it.

export type BlogImage = { width: number; height: number };

export const BLOG_IMAGES: Record<string, BlogImage> = {
  '/showcase/armchair.jpg': { width: 720, height: 720 },
  '/showcase/armchair-angles.jpg': { width: 1200, height: 1200 },
  '/showcase/vase.jpg': { width: 720, height: 720 },
  '/showcase/vase-angles.jpg': { width: 1200, height: 1200 },
};

const IMAGE = /!\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/;

/** `![alt](/path "caption")`, or null when the line is not exactly one image. */
export function parseImage(
  line: string,
): { alt: string; src: string; caption?: string; size: BlogImage | null } | null {
  const match = new RegExp(`^${IMAGE.source}$`).exec(line.trim());
  if (!match) return null;
  const src = match[2] as string;
  return {
    alt: match[1] as string,
    src,
    ...(match[3] ? { caption: match[3] } : {}),
    size: BLOG_IMAGES[src] ?? null,
  };
}

// Google asks for article images at least 1200 pixels wide, so smaller ones stay in the body only.
const MIN_SCHEMA_WIDTH = 1200;

/** The first known image of a post body wide enough for the BlogPosting image, or null. */
export function schemaImage(body: string): { src: string; width: number; height: number } | null {
  for (const line of body.split('\n')) {
    const image = parseImage(line);
    if (image?.size && image.size.width >= MIN_SCHEMA_WIDTH)
      return { src: image.src, ...image.size };
  }
  return null;
}
