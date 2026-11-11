import Link from 'next/link';
import { COMPARE_INDEX, listComparePages } from '@/lib/compare/pages';
import { ROUTES } from '@/lib/seo/routes';

/**
 * The English comparisons hub: a short intro and a list of the five pages, each with its
 * title and description. It exists so /compare is a real index, not a 404, once the pages
 * are published.
 */
export function CompareIndexView() {
  const pages = listComparePages();
  const home = ROUTES.home.paths.en;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 sm:pb-28">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li className="shrink-0">
            <Link href={home} className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">
            Comparisons
          </li>
        </ol>
      </nav>

      <header className="mt-10 max-w-4xl sm:mt-14">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Comparisons
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
          {COMPARE_INDEX.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl">
          {COMPARE_INDEX.description}
        </p>
      </header>

      <ul className="mt-12 max-w-3xl divide-y border-t sm:mt-16">
        {pages.map((page) => (
          <li key={page.slug} className="py-8">
            <h2 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
              <Link href={page.path} className="hover:underline">
                {page.title}
              </Link>
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
              {page.description}
            </p>
            <p className="mt-4">
              <Link href={page.path} className="text-sm font-medium hover:underline">
                Read the comparison
              </Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
