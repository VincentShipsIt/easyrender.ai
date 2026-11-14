import { displayPricing } from '@easyrender/harness';
import { createTranslator } from 'next-intl';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { IntegrationCosts } from '@/components/integrations/costs';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

const state = vi.hoisted(() => ({ variant: 'control', currency: 'usd' }));
vi.mock('@/lib/pricing', () => ({
  currentPricing: async () =>
    displayPricing(state.variant as 'control' | 'test', state.currency as 'usd' | 'eur'),
}));
vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale }: { locale: 'en' | 'es' }) =>
    createTranslator({
      locale,
      messages: locale === 'es' ? es : en,
      namespace: 'IntegrationLanding.costs',
    }),
}));
vi.mock('@/components/landing', () => ({
  Section: ({ children }: { children: ReactNode }) => createElement('section', null, children),
}));

describe('integration cost disclosure', () => {
  it.each([
    ['control', 'usd', '$0.64', '$64.00', '$5.00'],
    ['test', 'usd', '$1.28', '$128.00', '$10.00'],
    ['control', 'eur', '€0.64', '€64.00', '€5.00'],
    ['test', 'eur', '€1.28', '€128.00', '€10.00'],
  ])(
    'uses the checkout offer %s in %s for either integration',
    async (variant, currency, build, batch, minimum) => {
      Object.assign(state, { variant, currency });
      for (const kind of ['api', 'mcp'] as const) {
        const html = renderToStaticMarkup(await IntegrationCosts({ locale: 'en', kind }));
        expect(html).toContain(build);
        expect(html).toContain(batch);
        expect(html).toContain(minimum);
        expect(html).toContain('64 credits for the final angle sheet');
        expect(html).toContain('Failed 3D builds refund their credits');
        expect(html).toContain(
          kind === 'api'
            ? 'renderCredits'
            : 'Your AI client or model provider may charge separately',
        );
      }
    },
  );

  it('shows Spanish credit and currency amounts without untranslated placeholders', async () => {
    Object.assign(state, { variant: 'test', currency: 'eur' });
    const html = renderToStaticMarkup(await IntegrationCosts({ locale: 'es', kind: 'mcp' }));
    expect(html).toContain('1,28');
    expect(html).toContain('128,00');
    expect(html).toContain('64 créditos por la hoja final');
    expect(html).toContain('no están incluidas aquí');
    expect(html).not.toMatch(/\{(?:price|credits|unit|count)\}/);
  });
});
