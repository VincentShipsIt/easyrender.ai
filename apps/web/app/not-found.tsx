import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SiteChrome } from '@/components/site-chrome';
import { Button } from '@/components/ui/button';

// A path that matches no page. The root layout no longer draws the site header, so the 404 brings
// its own frame.
export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <SiteChrome>
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-24 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
        <Button asChild>
          <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </SiteChrome>
  );
}
