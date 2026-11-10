import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import type { Locale } from '@/i18n/config';
import { listPosts } from '@/lib/blog/posts';
import { ROUTES } from '@/lib/seo/routes';

export const DATE_FORMAT = { year: 'numeric', month: 'long', day: 'numeric' } as const;

/** The guides hub of one language: every post published today, newest first. */
export async function BlogIndexView({ locale }: { locale: Locale }) {
  const [t, format] = await Promise.all([getTranslations('Blog'), getFormatter()]);
  const posts = listPosts(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <Badge variant="outline">easyrender</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('index.title')}</h1>
        <p className="text-lg text-muted-foreground text-pretty">{t('index.description')}</p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-12 rounded-lg border bg-muted/30 p-6 text-muted-foreground">
          {t('index.empty')}
        </p>
      ) : (
        <ul className="mt-12 divide-y border-t">
          {posts.map((post) => (
            <li key={post.slug} className="py-6">
              <article className="space-y-2">
                <h2 className="text-xl font-medium tracking-tight">
                  <Link href={post.path} className="hover:underline underline-offset-4">
                    {post.title}
                  </Link>
                </h2>
                <p className="leading-relaxed text-muted-foreground text-pretty">
                  {post.description}
                </p>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <time dateTime={post.date}>
                    {format.dateTime(new Date(post.date), DATE_FORMAT)}
                  </time>
                  <Link href={post.path} className="inline-flex items-center gap-1 hover:underline">
                    {t('index.readMore')}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12 text-sm text-muted-foreground">
        <Link href={ROUTES.home.paths[locale]} className="hover:underline underline-offset-4">
          {t('breadcrumb.home')}
        </Link>
      </p>
    </div>
  );
}
