import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BlogModel } from '@/components/blog/blog-model';
import { DIAGRAMS } from '@/components/blog/diagrams';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { parseImage } from './images';

// Renders the markdown subset the guides are written in: headings, paragraphs, lists, quotes,
// rules, tables, images, 3D models and drawn diagrams from the closed lists in images.ts, and
// inline emphasis, code and links. It returns React elements rather than HTML, so no
// post can inject markup into the page, and there is no markdown dependency to keep current.
//
// Anything outside the subset is shown as plain text instead of being dropped, which makes an
// unsupported construct obvious in review rather than silently invisible.

type Block =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'media'; items: Media[] }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'rule' };

/** A picture or a 3D model. Image lines with no blank line between them form one media block,
 * shown side by side, for a comparison such as a photo next to the model built from it. */
export type Media = {
  alt: string;
  src: string;
  caption?: string;
  width: number;
  height: number;
} & (
  | { type: 'image' }
  | { type: 'model'; poster: string; orbit: string }
  | { type: 'diagram'; name: string }
);

const HEADING = /^(#{2,4})\s+(.*)$/;
const UNORDERED = /^[-*]\s+(.*)$/;
const ORDERED = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const RULE = /^(-{3,}|\*{3,}|_{3,})$/;
const TABLE_ROW = /^\|.*\|$/;
const TABLE_DIVIDER = /^\|(\s*:?-{3,}:?\s*\|)+$/;

const cells = (row: string) =>
  row
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());

function toMedia(line: string): Media | null {
  const image = parseImage(line);
  if (!image?.size) return null;
  const base = {
    alt: image.alt,
    src: image.src,
    ...(image.caption ? { caption: image.caption } : {}),
    width: image.size.width,
    height: image.size.height,
  };
  if (image.diagram) return { ...base, type: 'diagram', name: image.diagram };
  return image.model
    ? { ...base, type: 'model', poster: image.model.poster, orbit: image.model.orbit }
    : { ...base, type: 'image' };
}

/** Splits markdown into blocks. Exported for tests. */
export function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = (lines[index] as string).trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ kind: 'rule' });
      index += 1;
      continue;
    }

    if (toMedia(line)) {
      const items: Media[] = [];
      while (index < lines.length) {
        const media = toMedia((lines[index] as string).trim());
        if (!media) break;
        items.push(media);
        index += 1;
      }
      blocks.push({ kind: 'media', items });
      continue;
    }

    // A table needs its header row and the |---| divider under it; anything else stays text.
    const divider = (lines[index + 1] ?? '').trim();
    if (TABLE_ROW.test(line) && TABLE_DIVIDER.test(divider)) {
      const header = cells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && TABLE_ROW.test((lines[index] as string).trim())) {
        rows.push(cells((lines[index] as string).trim()));
        index += 1;
      }
      blocks.push({ kind: 'table', header, rows });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        kind: 'heading',
        level: (heading[1] as string).length as 2 | 3 | 4,
        text: heading[2] as string,
      });
      index += 1;
      continue;
    }

    const listKind = UNORDERED.test(line) ? 'unordered' : ORDERED.test(line) ? 'ordered' : null;
    if (listKind) {
      const items: string[] = [];
      const pattern = listKind === 'unordered' ? UNORDERED : ORDERED;
      while (index < lines.length) {
        const match = pattern.exec((lines[index] as string).trim());
        if (!match) break;
        items.push(match[1] as string);
        index += 1;
      }
      blocks.push({ kind: 'list', ordered: listKind === 'ordered', items });
      continue;
    }

    if (QUOTE.test(line)) {
      const parts: string[] = [];
      while (index < lines.length) {
        const match = QUOTE.exec((lines[index] as string).trim());
        if (!match) break;
        parts.push(match[1] as string);
        index += 1;
      }
      blocks.push({ kind: 'quote', text: parts.join(' ').trim() });
      continue;
    }

    // A paragraph runs until a blank line or the start of another block.
    const parts: string[] = [];
    while (index < lines.length) {
      const next = (lines[index] as string).trim();
      if (!next || RULE.test(next) || HEADING.test(next) || QUOTE.test(next)) break;
      if (parts.length && parseImage(next)?.size) break;
      if (UNORDERED.test(next) || ORDERED.test(next)) break;
      parts.push(next);
      index += 1;
    }
    blocks.push({ kind: 'paragraph', text: parts.join(' ') });
  }

  return blocks;
}

// `**bold**`, `*italic*`, `` `code` `` and `[text](href)`, in one pass so nesting cannot loop.
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

/**
 * Decides whether a site-relative link is shown as a link. Guides are written a week ahead and
 * link to each other, so a link to a guide that is not published yet is shown as plain text and
 * becomes a link on that guide's day, with no deploy and no 404 in between.
 */
export type LinkGate = (href: string) => boolean;
const ALWAYS: LinkGate = () => true;

/** Turns inline markdown into React nodes. Exported for tests. */
export function renderInline(text: string, isLive: LinkGate = ALWAYS): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE)) {
    const token = match[0];
    const at = match.index;
    if (at > cursor) nodes.push(text.slice(cursor, at));
    cursor = at + token.length;
    key += 1;

    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      if (!link) {
        nodes.push(token);
      } else {
        const href = link[2] as string;
        const label = link[1] as string;
        nodes.push(
          href.startsWith('/') && !isLive(href) ? (
            label
          ) : href.startsWith('/') ? (
            <Link key={key} href={href} className="underline underline-offset-4">
              {label}
            </Link>
          ) : (
            <a
              key={key}
              href={href}
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              {label}
            </a>
          ),
        );
      }
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function Figure({
  media,
  hint,
  isLive,
  locale,
}: {
  media: Media;
  hint: string;
  isLive: LinkGate;
  locale: string;
}) {
  return (
    <figure>
      {media.type === 'diagram' ? (
        // Drawn on the server from the site's tokens: the words are in the HTML, it needs no
        // JavaScript, and it follows the light or dark scheme. The alt text names the picture.
        <div
          role="img"
          aria-label={media.alt}
          className="rounded-lg border bg-card p-4 text-card-foreground sm:p-6"
        >
          {DIAGRAMS[media.name]?.render(locale)}
        </div>
      ) : media.type === 'model' ? (
        <BlogModel
          src={media.src}
          alt={media.alt}
          poster={{ src: media.poster, width: media.width, height: media.height }}
          orbit={media.orbit}
          hint={hint}
        />
      ) : (
        // Below the fold in every guide, so next/image's default lazy loading applies. The width
        // and height reserve the space, so the text never jumps while it loads.
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes="(min-width: 768px) 720px, 100vw"
          className="h-auto w-full rounded-lg border bg-muted"
        />
      )}
      {media.caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground">
          {renderInline(media.caption, isLive)}
        </figcaption>
      )}
    </figure>
  );
}

/** The article body of a post, as prose. `modelHint` labels a 3D model once it can be turned. */
export function Markdown({
  source,
  isLive = ALWAYS,
  modelHint = '',
  locale = 'en',
}: {
  source: string;
  isLive?: LinkGate;
  modelHint?: string;
  /** The guide's language, for the words inside diagrams. */
  locale?: string;
}) {
  return (
    <>
      {parseBlocks(source).map((block, index) => {
        const key = `${block.kind}-${index}`;
        switch (block.kind) {
          case 'rule':
            return <Separator key={key} className="my-10" />;
          case 'media':
            return block.items.length === 1 ? (
              <div key={key} className="mt-8">
                <Figure
                  media={block.items[0] as Media}
                  hint={modelHint}
                  isLive={isLive}
                  locale={locale}
                />
              </div>
            ) : (
              <div key={key} className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                {block.items.map((media) => (
                  <Figure
                    key={media.src}
                    media={media}
                    hint={modelHint}
                    isLive={isLive}
                    locale={locale}
                  />
                ))}
              </div>
            );
          case 'table':
            return (
              <div key={key} className="mt-8 rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {block.header.map((cell) => (
                        <TableHead key={cell} scope="col" className="whitespace-normal">
                          {renderInline(cell, isLive)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {block.rows.map((row) => (
                      <TableRow key={row.join('|')}>
                        {row.map((cell, column) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: static content, never reordered
                          <TableCell key={column} className="whitespace-normal align-top">
                            {renderInline(cell, isLive)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          case 'heading': {
            if (block.level === 2) {
              return (
                <h2 key={key} className="mt-12 text-2xl font-semibold tracking-tight">
                  {renderInline(block.text, isLive)}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3 key={key} className="mt-8 text-xl font-semibold tracking-tight">
                  {renderInline(block.text, isLive)}
                </h3>
              );
            }
            return (
              <h4 key={key} className="mt-6 text-lg font-semibold tracking-tight">
                {renderInline(block.text, isLive)}
              </h4>
            );
          }
          case 'list':
            return block.ordered ? (
              <ol key={key} className="mt-5 list-decimal space-y-2 pl-6">
                {block.items.map((item, position) => (
                  // A rendered post never reorders: the list comes from the file, in file order,
                  // so the position is the item's identity.
                  // biome-ignore lint/suspicious/noArrayIndexKey: static content, never reordered
                  <li key={`${key}-${position}`}>{renderInline(item, isLive)}</li>
                ))}
              </ol>
            ) : (
              <ul key={key} className="mt-5 list-disc space-y-2 pl-6">
                {block.items.map((item, position) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static content, never reordered
                  <li key={`${key}-${position}`}>{renderInline(item, isLive)}</li>
                ))}
              </ul>
            );
          case 'quote':
            return (
              <blockquote key={key} className="mt-6 border-l-2 pl-5 text-muted-foreground italic">
                {renderInline(block.text, isLive)}
              </blockquote>
            );
          default:
            return (
              <p key={key} className="mt-5 leading-relaxed">
                {renderInline(block.text, isLive)}
              </p>
            );
        }
      })}
    </>
  );
}
