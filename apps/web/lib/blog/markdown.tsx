import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';
import { parseImage } from './images';

// Renders the markdown subset the guides are written in: headings, paragraphs, lists, quotes,
// rules, images from the closed list in images.ts, and inline emphasis, code and links. It returns React elements rather than HTML, so no
// post can inject markup into the page, and there is no markdown dependency to keep current.
//
// Anything outside the subset is shown as plain text instead of being dropped, which makes an
// unsupported construct obvious in review rather than silently invisible.

type Block =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'image'; alt: string; src: string; caption?: string; width: number; height: number }
  | { kind: 'rule' };

const HEADING = /^(#{2,4})\s+(.*)$/;
const UNORDERED = /^[-*]\s+(.*)$/;
const ORDERED = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const RULE = /^(-{3,}|\*{3,}|_{3,})$/;

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

    const image = parseImage(line);
    if (image?.size) {
      blocks.push({
        kind: 'image',
        alt: image.alt,
        src: image.src,
        ...(image.caption ? { caption: image.caption } : {}),
        width: image.size.width,
        height: image.size.height,
      });
      index += 1;
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

/** The article body of a post, as prose. */
export function Markdown({ source, isLive = ALWAYS }: { source: string; isLive?: LinkGate }) {
  return (
    <>
      {parseBlocks(source).map((block, index) => {
        const key = `${block.kind}-${index}`;
        switch (block.kind) {
          case 'rule':
            return <Separator key={key} className="my-10" />;
          case 'image':
            // Below the fold in every guide, so next/image's default lazy loading applies. The
            // width and height reserve the space, so the text never jumps while it loads.
            return (
              <figure key={key} className="mt-8">
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={block.width}
                  height={block.height}
                  sizes="(min-width: 768px) 720px, 100vw"
                  className="h-auto w-full rounded-lg border bg-muted"
                />
                {block.caption && (
                  <figcaption className="mt-2 text-sm text-muted-foreground">
                    {renderInline(block.caption, isLive)}
                  </figcaption>
                )}
              </figure>
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
