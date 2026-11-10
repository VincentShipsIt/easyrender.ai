import { describe, expect, it } from 'vitest';
import { parseBlocks } from './markdown';

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
});
