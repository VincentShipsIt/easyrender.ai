'use client';

import { Bot, Check, Loader2, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ModelViewer } from '@/components/model-viewer';
import type { ShowcaseItem } from '@/lib/showcase';
import { cn } from '@/lib/utils';

const CALLS = ['create_render', 'get_render', 'render_3d'] as const;

// How long each beat of the loop stays on screen (ms).
const BEATS = [900, 1100, 1100, 1300, 8000];

// A looping mock of an agent session that uses the easyrender MCP server.
export function AgentDemo({ item }: { item: ShowcaseItem }) {
  const t = useTranslations('AgentDemo');
  const showcase = useTranslations('Showcase');
  const [beat, setBeat] = useState(BEATS.length - 1);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setBeat(0);
    let current = 0;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(() => {
        current = (current + 1) % BEATS.length;
        setBeat(current);
        next();
      }, BEATS[current]);
    };
    next();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-md lg:max-w-none">
      <div className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-tr from-zinc-300/60 via-zinc-100/40 to-transparent blur-3xl dark:from-zinc-700/50 dark:via-zinc-800/30" />
      <div className="relative overflow-hidden rounded-2xl border bg-card text-left shadow-xl shadow-black/5">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="ml-2 text-xs text-muted-foreground">{t('window')}</span>
        </div>
        <div className="space-y-3 p-4 text-sm">
          <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-primary-foreground">
            {t('ask')}
          </div>

          <div className="space-y-1.5">
            {CALLS.map((tool, index) => {
              const shown = beat >= index;
              const done = beat > index;
              return (
                <div
                  key={tool}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 font-mono text-xs transition-all duration-500',
                    shown ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
                  )}
                >
                  <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="shrink-0 font-medium">easyrender.{tool}</span>
                  <span className="min-w-0 truncate text-muted-foreground max-sm:hidden">
                    {t(`calls.${tool}`)}
                  </span>
                  <span className="ml-auto">
                    {done ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            className={cn(
              'flex gap-3 transition-all duration-500',
              beat >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
            )}
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted">
              <Bot className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p>{t('done')}</p>
              <div className="grid grid-cols-[auto_1fr] items-stretch gap-2 rounded-xl border bg-gradient-to-b from-muted/20 to-muted/60 p-2">
                {/* biome-ignore lint/performance/noImgElement: small static thumbnail */}
                <img
                  src={item.photo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-20 self-center rounded-lg border object-cover sm:size-24"
                />
                <div className="relative h-32 sm:h-36">
                  <ModelViewer
                    src={item.model}
                    alt={t('modelAlt', { title: showcase(`items.${item.slug}.title`) })}
                    lazy={false}
                    rotationSpeed="30deg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
