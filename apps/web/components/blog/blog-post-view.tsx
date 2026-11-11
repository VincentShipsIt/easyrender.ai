import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/lib/blog/markdown';
import { type BlogPost, isLiveBlogLink, modifiedDate } from '@/lib/blog/posts';
import { ROUTES } from '@/lib/seo/routes';
import { DATE_FORMAT } from './blog-index-view';

/** One guide. The same template in every language: the words come from the content file. */
export async function BlogPostView({ post }: { post: BlogPost }) {
  const [t, format] = await Promise.all([getTranslations('Blog'), getFormatter()]);
  const hub = ROUTES.blog.paths[post.locale];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href={ROUTES.home.paths[post.locale]}
              className="hover:underline underline-offset-4"
            >
              {t('breadcrumb.home')}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={hub} className="hover:underline underline-offset-4">
              {t('index.title')}
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mt-6 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">{post.description}</p>
        <p className="text-sm text-muted-foreground">
          {t('post.by', { author: post.author.name })}
          {' · '}
          <time dateTime={post.date}>
            {t('post.published', { date: format.dateTime(new Date(post.date), DATE_FORMAT) })}
          </time>
          {modifiedDate(post) !== post.date && (
            <>
              {' · '}
              <time dateTime={modifiedDate(post)}>
                {t('post.updated', {
                  date: format.dateTime(new Date(modifiedDate(post)), DATE_FORMAT),
                })}
              </time>
            </>
          )}
        </p>
      </header>

      <div className="mt-10">
        <Markdown
          source={post.body}
          isLive={isLiveBlogLink(post.locale)}
          locale={post.locale}
          modelHint={t('post.modelHint')}
        />
      </div>

      <footer className="mt-16 space-y-6 border-t pt-8">
        <div className="space-y-3">
          <p className="text-xl font-medium tracking-tight">{t('post.cta.title')}</p>
          {post.cta && <p className="text-muted-foreground text-pretty">{post.cta}</p>}
          <Button asChild>
            <Link href={`${ROUTES.home.paths[post.locale]}#try`}>
              {t('post.cta.button')}
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <Link
          href={hub}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          {t('post.backToIndex')}
        </Link>
      </footer>
    </article>
  );
}
