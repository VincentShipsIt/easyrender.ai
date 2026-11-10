'use client';

import type { RenderView } from '@easyrender/core';
import { AlertCircle, Box, ImageUp, Loader2, Sparkles, Upload } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { prepare } from '@/components/prompt-bar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const UPLOAD_CONCURRENCY = 2;
const BUILD_CONCURRENCY = 3;
const POLL_MS = 4000;

type QueuedUpload = { key: string; name: string; url: string; error: string | null };
type View = 'photo' | '3d' | 'both';
type Filter = 'all' | 'needs' | 'working' | 'done' | 'failed';

const FILTERS: { id: Filter; label: string; match: (item: RenderView) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'needs', label: 'Needs 3D', match: (item) => item.status === 'preview_ready' },
  {
    id: 'working',
    label: 'In progress',
    match: (item) => item.status === 'drafting' || item.status === 'rendering',
  },
  { id: 'done', label: '3D ready', match: (item) => item.status === 'ready' },
  { id: 'failed', label: 'Failed', match: (item) => item.status === 'failed' },
];

const VIEWS: { id: View; label: string }[] = [
  { id: 'photo', label: 'Photo' },
  { id: '3d', label: '3D' },
  { id: 'both', label: 'Side by side' },
];

const STATUS_LABEL: Record<RenderView['status'], string> = {
  drafting: 'Preparing preview',
  preview_ready: 'Ready for 3D',
  rendering: 'Building 3D',
  ready: '3D ready',
  failed: 'Failed',
};

const baseName = (file: File) => file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');

// Runs `task` over `items` with at most `limit` in flight. Stops starting new ones once
// `task` returns false (out of credits, daily limit reached).
async function pool<T>(items: T[], limit: number, task: (item: T) => Promise<boolean>) {
  let next = 0;
  let stopped = false;
  const worker = async () => {
    while (!stopped && next < items.length) {
      const item = items[next++];
      if (!(await task(item))) stopped = true;
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return items.slice(next);
}

export function CatalogLibrary({
  initial,
  initialBalance,
  renderCredits,
}: {
  initial: RenderView[];
  initialBalance: number;
  renderCredits: number;
}) {
  const [items, setItems] = useState(initial);
  const [balance, setBalance] = useState(initialBalance);
  const [uploads, setUploads] = useState<QueuedUpload[]>([]);
  const [view, setView] = useState<View>('both');
  const [filter, setFilter] = useState<Filter>('all');
  const [building, setBuilding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    import('@google/model-viewer').then(() => setViewerReady(true));
  }, []);

  // One poll at a time. A poll that started before a local change (an upload or a build
  // response) is dropped, so it cannot roll the grid or the balance back.
  const polling = useRef<Promise<void> | null>(null);
  const localVersion = useRef(0);
  const refresh = useCallback(async (force = false) => {
    if (polling.current) {
      if (!force) return;
      await polling.current;
    }
    const startedAt = localVersion.current;
    const run = (async () => {
      try {
        const response = await fetch('/api/renders', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as { renders: RenderView[]; balance: number };
        if (localVersion.current !== startedAt) return;
        setItems(data.renders);
        setBalance(data.balance);
      } catch {
        // The next poll retries.
      }
    })();
    polling.current = run;
    await run;
    polling.current = null;
  }, []);

  const inFlight = items.some((item) => item.status === 'drafting' || item.status === 'rendering');
  useEffect(() => {
    if (!inFlight && !building) return;
    const timer = setInterval(() => refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [inFlight, building, refresh]);

  const upsert = (next: RenderView) => {
    localVersion.current += 1;
    setItems((current) => {
      const index = current.findIndex((item) => item.id === next.id);
      if (index === -1) return [next, ...current];
      return current.map((item) => (item.id === next.id ? next : item));
    });
  };

  async function addFiles(list: FileList | File[] | null) {
    const files = Array.from(list ?? []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;
    setNotice(null);
    const queued: (QueuedUpload & { file: File })[] = files.map((file) => ({
      key: crypto.randomUUID(),
      name: baseName(file),
      url: URL.createObjectURL(file),
      error: null,
      file,
    }));
    setUploads((current) => [...queued, ...current]);
    const done = (key: string) => {
      setUploads((current) => {
        const upload = current.find((item) => item.key === key);
        if (upload) URL.revokeObjectURL(upload.url);
        return current.filter((item) => item.key !== key);
      });
    };
    const failed = (key: string, error: string) =>
      setUploads((current) =>
        current.map((item) => (item.key === key ? { ...item, error } : item)),
      );

    const skipped = await pool(queued, UPLOAD_CONCURRENCY, async (upload) => {
      try {
        const body = new FormData();
        body.append('image', await prepare(upload.file), 'source.jpg');
        body.append('name', upload.name);
        const response = await fetch('/api/renders', { method: 'POST', body });
        const data = await response.json();
        if (!response.ok) {
          failed(upload.key, data.error ?? 'Upload failed');
          if (data.code === 'preview_limit') {
            setNotice(data.error);
            return false;
          }
          return true;
        }
        upsert(data as RenderView);
        done(upload.key);
      } catch {
        failed(upload.key, 'Upload failed');
      }
      return true;
    });
    for (const upload of skipped) failed(upload.key, 'Not uploaded: daily limit reached');
  }

  const pending = items.filter((item) => item.status === 'preview_ready');
  const affordable = Math.min(pending.length, Math.floor(balance / renderCredits));

  async function build(targets: RenderView[]) {
    if (targets.length === 0) return;
    setBuilding(true);
    setNotice(null);
    let stoppedFor: string | null = null;
    try {
      const left = await pool(targets, BUILD_CONCURRENCY, async (item) => {
        try {
          const response = await fetch(`/api/renders/${item.id}/render`, { method: 'POST' });
          const data = await response.json().catch(() => ({}));
          if (response.ok) {
            upsert(data as RenderView);
            setBalance((current) => Math.max(0, current - renderCredits));
            return true;
          }
          if (data.code === 'insufficient_credits') {
            stoppedFor = 'Out of credits. Buy more to generate the rest.';
            return false;
          }
          setNotice(data.error ?? 'Some items could not start');
        } catch {
          setNotice('Some items could not start. Check your connection and try again.');
        }
        return true;
      });
      if (left.length > 0) setNotice(stoppedFor ?? `${left.length} items are still waiting.`);
      // Bump past the optimistic updates so the final read always lands.
      localVersion.current += 1;
      await refresh(true);
    } finally {
      setBuilding(false);
    }
  }

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.id, items.filter(f.match).length])),
    [items],
  ) as Record<Filter, number>;
  const visible = items.filter(FILTERS.find((f) => f.id === filter)?.match ?? (() => true));
  const total = items.length + uploads.length;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: page-wide drop target; the Upload button is the accessible path
    <div
      className="space-y-6"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        addFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {total === 1 ? 'item' : 'items'} · {counts.done} in 3D ·{' '}
            {balance.toLocaleString('en-US')} credits
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => input.current?.click()}>
            <Upload className="size-4" />
            Upload photos
          </Button>
          {pending.length > 0 && affordable === 0 ? (
            <Button asChild>
              <Link href="/credits">
                <Sparkles className="size-4" />
                Buy credits to generate {pending.length}
              </Link>
            </Button>
          ) : (
            <Button
              disabled={building || affordable === 0}
              onClick={() => build(pending.slice(0, affordable))}
            >
              {building ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Generate all
              {affordable > 0 &&
                ` (${affordable} · ${(affordable * renderCredits).toLocaleString('en-US')} credits)`}
            </Button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {notice && (
        <p className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {notice}
          {pending.length > affordable && (
            <Link href="/credits" className="underline">
              Buy credits
            </Link>
          )}
        </p>
      )}

      {total === 0 ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn(
            'flex min-h-80 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/40 text-muted-foreground transition-colors hover:bg-muted',
            dragging && 'bg-muted',
          )}
        >
          <ImageUp className="size-8" />
          <span className="font-medium text-foreground">Drop your catalog photos here</span>
          <span className="max-w-sm text-center text-sm">
            One photo per product. Each one gets a free preview, then generate them all in 3D at
            once.
          </span>
        </button>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              value={filter}
              onChange={setFilter}
              options={FILTERS.map((f) => ({ id: f.id, label: `${f.label} ${counts[f.id]}` }))}
            />
            <Segmented value={view} onChange={setView} options={VIEWS} />
          </div>

          <div
            className={cn(
              'gap-4',
              view === 'both'
                ? 'columns-1 md:columns-2 xl:columns-3'
                : 'columns-2 md:columns-3 xl:columns-4',
              dragging && 'opacity-60',
            )}
          >
            {filter === 'all' &&
              uploads.map((upload) => (
                <Tile
                  key={upload.key}
                  view={view}
                  photo={upload.url}
                  title={upload.name}
                  status={upload.error ? 'Upload failed' : 'Uploading'}
                  pane={
                    upload.error ? (
                      <Pane icon={<AlertCircle className="size-5" />} text={upload.error} />
                    ) : (
                      <Pane icon={<Loader2 className="size-5 animate-spin" />} text="Uploading" />
                    )
                  }
                />
              ))}
            {visible.map((item) => (
              <Tile
                key={item.id}
                view={view}
                href={`/r/${item.id}`}
                photo={`/api/renders/${item.id}/source`}
                title={item.name || item.prompt || 'Untitled'}
                status={STATUS_LABEL[item.status]}
                pane={
                  <ModelPane
                    item={item}
                    viewerReady={viewerReady}
                    canBuild={!building && balance >= renderCredits}
                    renderCredits={renderCredits}
                    onBuild={() => build([item])}
                  />
                }
              />
            ))}
          </div>
          {visible.length === 0 && uploads.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">Nothing in this view.</p>
          )}
        </>
      )}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors',
            value === option.id && 'bg-background text-foreground shadow-xs',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// A catalog card. The photo sets the card's height (that's what makes the grid masonry);
// the 3D pane sits beside it, or on top of it in 3D view.
function Tile({
  view,
  photo,
  title,
  status,
  pane,
  href,
}: {
  view: View;
  photo: string;
  title: string;
  status: string;
  pane: ReactNode;
  href?: string;
}) {
  const image = (
    // biome-ignore lint/performance/noImgElement: authenticated API image, not optimizable
    <img src={photo} alt={title} loading="lazy" className="block h-auto w-full" />
  );
  return (
    <figure className="mb-4 break-inside-avoid overflow-hidden rounded-lg border bg-card shadow-xs">
      {view === 'both' ? (
        <div className="grid grid-cols-2 gap-px bg-border">
          <div className="bg-muted/40">{image}</div>
          <div className="relative bg-muted/40">{pane}</div>
        </div>
      ) : (
        <div className="relative bg-muted/40">
          {image}
          {/* Translucent so items without a model still show which product they are. */}
          {view === '3d' && (
            <div className="absolute inset-0 bg-muted/85 backdrop-blur-sm">{pane}</div>
          )}
        </div>
      )}
      <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
        {href ? (
          <Link href={href} className="truncate font-medium capitalize hover:underline">
            {title}
          </Link>
        ) : (
          <span className="truncate font-medium capitalize">{title}</span>
        )}
        <span className="shrink-0 text-xs text-muted-foreground">{status}</span>
      </figcaption>
    </figure>
  );
}

function Pane({ icon, text, children }: { icon: ReactNode; text: string; children?: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center text-xs text-muted-foreground">
      {icon}
      <span>{text}</span>
      {children}
    </div>
  );
}

function ModelPane({
  item,
  viewerReady,
  canBuild,
  renderCredits,
  onBuild,
}: {
  item: RenderView;
  viewerReady: boolean;
  canBuild: boolean;
  renderCredits: number;
  onBuild: () => void;
}) {
  if (item.hasModel) {
    return viewerReady ? (
      <div className="absolute inset-0 bg-muted">
        <model-viewer
          src={`/api/renders/${item.id}/model`}
          alt={`3D model of ${item.name ?? 'item'}`}
          loading="lazy"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    ) : (
      <Pane icon={<Loader2 className="size-5 animate-spin" />} text="Loading 3D" />
    );
  }
  switch (item.status) {
    case 'drafting':
      return <Pane icon={<Loader2 className="size-5 animate-spin" />} text="Preparing preview" />;
    case 'rendering':
      return <Pane icon={<Loader2 className="size-5 animate-spin" />} text="Building 3D model" />;
    case 'failed':
      return (
        <Pane icon={<AlertCircle className="size-5" />} text="Failed. Credits were refunded." />
      );
    default:
      return (
        <Pane icon={<Box className="size-5" />} text="Ready for 3D">
          <Button size="sm" variant="outline" disabled={!canBuild} onClick={onBuild}>
            Generate · {renderCredits}
          </Button>
        </Pane>
      );
  }
}
