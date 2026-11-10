import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * The opening copy of the home, server rendered so it is in the HTML a crawler reads: what the
 * product does, and the two things it does not do. Says "no whole rooms" and "no measurements"
 * out loud, because the keyword research brings in 3D-printing and virtual-staging searches that
 * easyrender is not for (decisiones/claims.md).
 */
export async function HomeIntro() {
  const t = await getTranslations('Home.intro');
  return (
    <section className="sec sec--center" id="what-it-does">
      <div className="sec__column space-y-5">
        <Badge variant="outline">{t('eyebrow')}</Badge>
        <p className="text-lg leading-relaxed text-pretty">{t('body')}</p>
        <p className="leading-relaxed text-muted-foreground text-pretty">{t('scope')}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button size="lg" asChild>
            <Link href="/#try">
              {t('primaryCta')}
              <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/explore">{t('secondaryCta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
