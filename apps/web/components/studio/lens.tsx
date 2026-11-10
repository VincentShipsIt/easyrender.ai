'use client';

import { useLocale, useTranslations } from 'next-intl';
import { itemOf } from '@/lib/studio/catalog';
import { createFormat } from '@/lib/studio/format';
import { useSection } from './use-section';
import './lens.css';

const ITEM = itemOf('armchair');
// From the pointer outwards. The 3D code places them in this order.
const LAYERS = ['texture', 'normals', 'physics', 'mesh'] as const;

// The stage beside the sign-in form: one element in four readings, with the finished render
// following the pointer and the earlier readings in rings around it.
export function StudioLens() {
  const t = useTranslations('Studio.lens');
  const catalog = useTranslations('Catalog');
  const fmt = createFormat(useLocale());
  const name = catalog(`items.${ITEM.id}.name`);

  const ref = useSection<HTMLDivElement>(
    async (root, scope) => {
      const { initLens } = await import('@/lib/studio/sections/lens');
      if (scope.alive) await initLens(root, { scope, id: ITEM.id });
    },
    'lens',
    '0px',
  );

  return (
    <div ref={ref} className="panel lens" role="img" aria-label={t('label', { name })}>
      <div className="view" data-er="view" />
      <div className="lens__tags" aria-hidden="true">
        {LAYERS.map((layer) => (
          <span key={layer} className="lens__tag" data-er="tag" data-layer={layer}>
            {t(`layers.${layer}`)}
          </span>
        ))}
      </div>
      <p className="lens__caption" aria-hidden="true">
        <b>{name}</b>
        <span>
          {fmt.dims(ITEM)} · {fmt.kg(ITEM.mass)}
        </span>
      </p>
      <p className="lens__hint" aria-hidden="true">
        <span className="lens__hint-mouse">{t('hint')}</span>
        <span className="lens__hint-touch">{t('hintTouch')}</span>
      </p>
    </div>
  );
}
