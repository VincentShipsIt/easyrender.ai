import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BrandMark } from '@/components/brand-mark';

// Formats the models ship in, and tools that open them.
const WORKS_WITH = ['GLB', 'USDZ', 'Blender', 'SketchUp', 'three.js', 'Shopify', 'ARKit', 'ARCore'];

// Why the hub exists, what it starts from, and where the models work.
export async function StudioProof() {
  const t = await getTranslations('Studio.proof');
  return (
    <section className="sec proof" aria-labelledby="studio-proof-title">
      <h2 className="proof__title reveal" id="studio-proof-title">
        {t('title')}
      </h2>
      <div className="proof__grid">
        <blockquote className="proof__quote reveal">
          <p>{t('quote')}</p>
          <footer>
            <BrandMark />
            <span>
              <b>{t('by')}</b>
              <i>{t('byline')}</i>
            </span>
          </footer>
        </blockquote>
        <div className="proof__stat reveal">
          <p className="proof__num">{t('stat')}</p>
          <p className="proof__cap">{t('statBody')}</p>
        </div>
      </div>

      <div className="marquee">
        <ul className="marquee__row" aria-label={t('marquee')}>
          {WORKS_WITH.map((name) => (
            <li key={name}>{name}</li>
          ))}
          {/* The row is doubled so the loop has no seam. */}
          {WORKS_WITH.map((name) => (
            <li key={`${name}-copy`} aria-hidden="true">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// The closing bar: one line and one very large button.
export function StudioClosing({
  title,
  label,
  href,
}: {
  title: string;
  label: string;
  href: string;
}) {
  return (
    <section className="cta" aria-labelledby="studio-cta-title">
      <h2 className="cta__title reveal" id="studio-cta-title">
        {title}
      </h2>
      <Link className="cta__bar" href={href}>
        <span>{label}</span>
      </Link>
    </section>
  );
}
