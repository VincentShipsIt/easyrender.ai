import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getFormatter, getTranslations } from 'next-intl/server';
import { schemaImage } from '@/lib/blog/images';
import { type BlogPost, readingMinutes } from '@/lib/blog/posts';
import { cn } from '@/lib/utils';

export const DATE_FORMAT = { year: 'numeric', month: 'long', day: 'numeric' } as const;

/** Date and reading time, the two facts every guide has. Nothing here is typed by hand. */
export async function PostMeta({ post, className }: { post: BlogPost; className?: string }) {
  const [t, format] = await Promise.all([getTranslations('Blog'), getFormatter()]);
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground tabular-nums',
        className,
      )}
    >
      <time dateTime={post.date}>{format.dateTime(new Date(post.date), DATE_FORMAT)}</time>
      <span aria-hidden>·</span>
      <span>{t('post.readingTime', { minutes: readingMinutes(post.body) })}</span>
    </p>
  );
}

/**
 * The cover of a guide: its own illustration, the picture under its first paragraph that is also
 * its Open Graph image. The frame has a fixed ratio, so the grid never moves while it loads.
 */
function Cover({
  post,
  sizes,
  isPriority = false,
  className,
}: {
  post: BlogPost;
  sizes: string;
  isPriority?: boolean;
  className?: string;
}) {
  const cover = schemaImage(post.body);
  return (
    <div
      className={cn('relative aspect-3/2 overflow-hidden rounded-xl border bg-muted', className)}
    >
      {cover && (
        <Image
          src={cover.src}
          alt=""
          fill
          sizes={sizes}
          {...(isPriority ? { preload: true } : {})}
          className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
    </div>
  );
}

/**
 * The newest guide, big: cover on one side, the words on the other. The whole card is the link
 * (the title's link is stretched over it), so there is one tab stop and one accessible name.
 */
export async function FeaturedPostCard({ post, label }: { post: BlogPost; label: string }) {
  const t = await getTranslations('Blog');
  return (
    <article className="group relative grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12">
      <Cover
        post={post}
        sizes="(min-width: 1152px) 620px, (min-width: 1024px) 55vw, 100vw"
        isPriority
      />
      <div className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl">
          <Link
            href={post.path}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-4"
          >
            {post.title}
          </Link>
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
          {post.description}
        </p>
        <PostMeta post={post} />
        <p className="inline-flex items-center gap-1.5 text-sm font-medium">
          {t('index.readMore')}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </p>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-2xl ring-ring/50 group-has-focus-visible:ring-[3px]"
      />
    </article>
  );
}

/** One guide in a grid: cover, title, the first lines of its description, date and reading time. */
export function PostCard({
  post,
  headingLevel = 'h3',
}: {
  post: BlogPost;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex w-full flex-col gap-4">
      <Cover post={post} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
      <div className="space-y-2">
        <Heading className="text-lg font-semibold leading-snug tracking-tight text-balance">
          <Link
            href={post.path}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-4"
          >
            {post.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          {post.description}
        </p>
      </div>
      <PostMeta post={post} className="mt-auto" />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-2xl ring-ring/50 group-has-focus-visible:ring-[3px]"
      />
    </article>
  );
}
