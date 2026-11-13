import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { BLOG_IMAGES } from './images';
import { Markdown } from './markdown';

describe.each(LOCALES)('blog image layout in %s', (locale) => {
  it.each(Object.entries(BLOG_IMAGES))('sizes %s from its registered dimensions', (src, size) => {
    const html = renderToStaticMarkup(
      createElement(Markdown, { source: `![Image](${src})`, locale }),
    );
    const image = html.match(/<img\b[^>]+>/)?.[0] || '';
    expect(image).toContain(`width="${size.width}"`);
    expect(image).toContain(`height="${size.height}"`);
    expect(image).toContain('mx-auto');
    expect(image).toContain('h-auto w-full');
    if (size.width < 1440) {
      expect(image).toContain(`max-width:${size.width / 2}px`);
    } else {
      expect(image).not.toContain('max-width:');
    }
  });

  it('describes a grid cell rather than the whole article in sizes', () => {
    const html = renderToStaticMarkup(
      createElement(Markdown, {
        source:
          '![Front](/blog/figures/product-photography-for-ecommerce/armchair-front.jpg)\n' +
          '![Side](/blog/figures/product-photography-for-ecommerce/armchair-three-quarter.jpg)',
        locale,
      }),
    );
    const images = html.match(/<img\b[^>]+>/g) || [];
    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image).toContain('max-width:194px');
      expect(image).toContain('min(194px, calc(50vw - 22px))');
    }
  });
});
