'use client';

import type { RenderView as View } from '@easyrender/core';
import { Box, Globe, Loader2, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ModelView } from '@/components/model-view';
import { formatDate, RenderDetail } from '@/components/render-detail';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const RUNNING = new Set(['drafting', 'rendering']);

const STATUS: Record<View['status'], string> = {
  drafting: 'Drawing every angle',
  preview_ready: 'Preview ready',
  rendering: 'Building 3D model',
  ready: 'Ready',
  failed: 'Failed',
};

export function RenderView({
  initial,
  signedIn,
  balance,
  owner,
}: {
  initial: View;
  signedIn: boolean;
  balance: number;
  owner: boolean;
}) {
  const [render, setRender] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!RUNNING.has(render.status)) return;
    const timer = setInterval(async () => {
      const response = await fetch(`/api/renders/${render.id}`, { cache: 'no-store' });
      if (response.ok) setRender(await response.json());
    }, 3000);
    return () => clearInterval(timer);
  }, [render.id, render.status]);

  async function build() {
    setStarting(true);
    setError(null);
    const response = await fetch(`/api/renders/${render.id}/render`, { method: 'POST' });
    const data = await response.json();
    if (response.ok) setRender(data);
    else setError(data.error ?? 'Could not start the render');
    setStarting(false);
  }

  async function setPublic(isPublic: boolean) {
    setSaving(true);
    const response = await fetch(`/api/renders/${render.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ isPublic }),
    });
    if (response.ok) setRender(await response.json());
    setSaving(false);
  }

  const base = `/api/renders/${render.id}`;
  const next = encodeURIComponent(`/r/${render.id}`);
  const title = render.prompt || 'Untitled render';

  const viewer =
    render.status === 'ready' ? (
      <ModelView
        src={`${base}/model`}
        name={render.id}
        downloadUrl={owner ? `${base}/model?download=1` : null}
      />
    ) : (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-xl border bg-muted/40 p-6 text-center text-muted-foreground sm:aspect-[4/3]">
        {render.status === 'failed' ? (
          <p className="text-sm">{render.error}</p>
        ) : RUNNING.has(render.status) ? (
          <>
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">
              {render.status === 'drafting'
                ? 'Drawing every angle of your object. This takes about a minute.'
                : 'Building the 3D model. This takes about two minutes.'}
            </p>
          </>
        ) : (
          <>
            <Box className="size-8" />
            <p className="max-w-sm text-sm">
              Your preview is ready below. Check every angle, then render the 3D model.
            </p>
          </>
        )}
      </div>
    );

  const angles = render.hasPreview ? (
    // biome-ignore lint/performance/noImgElement: watermarked preview served by our own API
    <img
      src={`${base}/preview?s=${render.status}`}
      alt="Preview of every angle"
      className="w-full rounded-lg border bg-white"
    />
  ) : (
    <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
      {render.status === 'failed' ? (
        <span className="text-sm">No preview</span>
      ) : (
        <Loader2 className="size-5 animate-spin" />
      )}
    </div>
  );

  const actions = owner ? (
    <>
      {render.status === 'preview_ready' &&
        (!signedIn ? (
          <Button size="lg" className="w-full" asChild>
            <Link href={`/sign-up?next=${next}`}>
              <Sparkles />
              Sign up to render in 3D
            </Link>
          </Button>
        ) : balance < render.renderCredits ? (
          <Button size="lg" className="w-full" asChild>
            <Link href={`/credits?next=${next}`}>Buy credits to render in 3D</Link>
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={build} disabled={starting}>
            {starting ? <Loader2 className="animate-spin" /> : <Box />}
            Render 3D ({render.renderCredits} credits)
          </Button>
        ))}
      {render.status === 'failed' && (
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">Try another photo</Link>
        </Button>
      )}
      {signedIn && render.status !== 'failed' && (
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <Label htmlFor="public" className="flex-col items-start gap-1">
            <span>Show in public gallery</span>
            <span className="text-xs font-normal text-muted-foreground">Finished models only</span>
          </Label>
          <Switch
            id="public"
            checked={render.isPublic}
            disabled={saving}
            onCheckedChange={setPublic}
          />
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  ) : (
    <Button className="w-full" asChild>
      <Link href="/#top">
        <Sparkles />
        Make your own
      </Link>
    </Button>
  );

  return (
    <RenderDetail
      title={title}
      prompt={render.prompt}
      badges={[STATUS[render.status]]}
      viewer={viewer}
      input={`${base}/source`}
      angles={angles}
      meta={[
        {
          label: 'Status',
          value: (
            <span className="inline-flex items-center gap-1.5">
              {RUNNING.has(render.status) && <Loader2 className="size-3.5 animate-spin" />}
              {STATUS[render.status]}
            </span>
          ),
        },
        { label: 'Engine', value: 'TRELLIS + angle sheet' },
        { label: 'Formats', value: 'GLB · USDZ' },
        ...(owner ? [{ label: 'Credits used', value: String(render.credits) }] : []),
        {
          label: 'Visibility',
          value: (
            <span className="inline-flex items-center gap-1.5">
              {render.isPublic ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
              {render.isPublic ? 'Public' : 'Private'}
            </span>
          ),
        },
        { label: 'Created', value: formatDate(render.createdAt) },
      ]}
      actions={actions}
    />
  );
}
