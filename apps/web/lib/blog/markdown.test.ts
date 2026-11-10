import { describe, expect, it } from 'vitest';
import { parseBlocks, renderInline } from './markdown';

describe('the markdown subset the guides are written in', () => {
  it('reads headings, paragraphs, lists, quotes and rules', () => {
    const blocks = parseBlocks(
      [
        '## What you get',
        '',
        'A textured GLB.',
        'And a USDZ.',
        '',
        '1. Upload one photo.',
        '2. Check every angle.',
        '',
        '- GLB',
        '- USDZ',
        '',
        '> Previews are free.',
        '',
        '---',
        '',
        '### Fine print',
      ].join('\n'),
    );

    expect(blocks).toEqual([
      { kind: 'heading', level: 2, text: 'What you get' },
      // Soft-wrapped lines join into one paragraph, as markdown does.
      { kind: 'paragraph', text: 'A textured GLB. And a USDZ.' },
      { kind: 'list', ordered: true, items: ['Upload one photo.', 'Check every angle.'] },
      { kind: 'list', ordered: false, items: ['GLB', 'USDZ'] },
      { kind: 'quote', text: 'Previews are free.' },
      { kind: 'rule' },
      { kind: 'heading', level: 3, text: 'Fine print' },
    ]);
  });

  it('starts a new block as soon as one begins, without a blank line', () => {
    expect(parseBlocks('Some words.\n## A heading')).toEqual([
      { kind: 'paragraph', text: 'Some words.' },
      { kind: 'heading', level: 2, text: 'A heading' },
    ]);
  });

  it('has nothing to render for an empty body', () => {
    expect(parseBlocks('\n\n   \n')).toEqual([]);
  });

  it('shows a known image with its real size and caption, and leaves an unknown one as text', () => {
    expect(parseBlocks('![The input photo](/showcase/armchair.jpg "One photo")')).toEqual([
      {
        kind: 'image',
        alt: 'The input photo',
        src: '/showcase/armchair.jpg',
        caption: 'One photo',
        width: 720,
        height: 720,
      },
    ]);
    expect(parseBlocks('![Invented](/made-up.jpg)')).toEqual([
      { kind: 'paragraph', text: '![Invented](/made-up.jpg)' },
    ]);
  });

  it('shows a link to a guide that is not out yet as its text, and other links as links', () => {
    const isLive = (href: string) => href !== '/learn/later';
    const nodes = renderInline('See [the later guide](/learn/later) or [the home](/).', isLive);
    expect(nodes[1]).toBe('the later guide');
    expect(typeof nodes[3]).toBe('object');
  });
});
