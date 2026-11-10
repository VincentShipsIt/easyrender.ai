'use client';

import { ArrowRight, Box, Plus } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { photoUrl } from '@/lib/studio/catalog';
import { createFormat } from '@/lib/studio/format';
import { DemoCursor } from './icons';
import { useCatalogText } from './use-catalog-text';
import { useSection } from './use-section';

const STEPS = ['angles', 'mesh', 'texture', 'ready'] as const;

// How it works, as a loop: a photo goes in, the prompt is typed, and the model is built from the
// floor up as points, then mesh, then texture.
export function StudioPipeline() {
  const t = useTranslations('Studio.pipeline');
  const locale = useLocale();
  const { prompts } = useCatalogText();

  const ref = useSection<HTMLDivElement>(async (panel, scope) => {
    const { initPipeline } = await import('@/lib/studio/sections/pipeline');
    if (scope.alive) await initPipeline(panel, { scope, fmt: createFormat(locale), prompts });
  }, locale);

  return (
    <section className="sec" id="how-it-works" aria-labelledby="studio-pipeline-title">
      <p className="statement reveal" id="studio-pipeline-title">
        <strong>{t('lead')}</strong>
        {t('body')}
      </p>

      <div className="split">
        <div ref={ref} className="panel panel--pipeline" aria-hidden="true">
          <div className="view" data-er="view" />

          <div className="pipe-photo" data-er="photo">
            {/* biome-ignore lint/performance/noImgElement: swapped by the 3D code on every loop */}
            <img
              data-er="photo-img"
              src={photoUrl('armchair')}
              alt=""
              width={720}
              height={720}
              loading="lazy"
              decoding="async"
            />
            <span className="tag tag--ink">{t('photo')}</span>
          </div>

          <div className="prompt">
            <Plus />
            <span className="prompt__text" data-er="text" data-placeholder={t('placeholder')} />
            <span className="prompt__btn" data-er="button">
              {t('generate')}
            </span>
          </div>

          <ol className="steps">
            {STEPS.map((step) => (
              <li key={step} data-er="step">
                {t(`steps.${step}`)}
              </li>
            ))}
          </ol>

          <div className="readout" data-er="readout" />
          <DemoCursor data-er="cursor" />
        </div>

        <aside className="note reveal">
          <Box className="note__icon" />
          <h2 className="note__title">{t('noteTitle')}</h2>
          <p>{t('noteBody')}</p>
          <Link className="link" href="#try">
            {t('noteLink')} <ArrowRight />
          </Link>
        </aside>
      </div>
    </section>
  );
}
