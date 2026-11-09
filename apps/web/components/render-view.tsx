'use client';

import type { RenderView as View } from '@easyrender/core';
import { Box, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ModelView } from '@/components/model-view';
import { Button, buttonClass } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const RUNNING = new Set(['drafting', 'rendering']);

export function RenderView({
  initial,
  signedIn,
  balance,
}: {
  initial: View;
  signedIn: boolean;
  balance: number;
}) {
  const [render, setRender] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

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

  const next = encodeURIComponent(`/r/${render.id}`);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        {render.status === 'ready' ? (
          <ModelView id={render.id} />
        ) : render.hasPreview ? (
          // biome-ignore lint/performance/noImgElement: watermarked preview served by our own API
          <img
            src={`/api/renders/${render.id}/preview?s=${render.status}`}
            alt="Preview of every angle"
            className="w-full rounded-lg border bg-white"
          />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-lg border bg-muted/40 text-muted-foreground">
            {render.status === 'failed' ? (
              <p className="text-sm">{render.error}</p>
            ) : (
              <>
                <Loader2 className="size-6 animate-spin" />
                <p className="text-sm">
                  Drawing every angle of your object. This takes about a minute.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <Card className="h-fit space-y-4">
        <div>
          <h1 className="font-semibold">Your render</h1>
          {render.prompt && <p className="mt-1 text-sm text-muted-foreground">{render.prompt}</p>}
        </div>
        <Status render={render} />
        {render.status === 'preview_ready' &&
          (!signedIn ? (
            <Link
              href={`/sign-up?next=${next}`}
              className={cn(buttonClass({ size: 'lg' }), 'w-full')}
            >
              Sign up to render in 3D
            </Link>
          ) : balance < render.renderCredits ? (
            <Link
              href={`/credits?next=${next}`}
              className={cn(buttonClass({ size: 'lg' }), 'w-full')}
            >
              Buy credits to render in 3D
            </Link>
          ) : (
            <Button size="lg" className="w-full" onClick={build} disabled={starting}>
              {starting ? <Loader2 className="size-4 animate-spin" /> : <Box className="size-4" />}
              Render 3D ({render.renderCredits} credits)
            </Button>
          ))}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {render.status === 'failed' && (
          <Link href="/" className={cn(buttonClass({ variant: 'outline' }), 'w-full')}>
            Try another photo
          </Link>
        )}
      </Card>
    </div>
  );
}

function Status({ render }: { render: View }) {
  const text = {
    drafting: 'Generating the free preview…',
    preview_ready: 'Preview ready. Check every angle, then render the 3D model.',
    rendering: 'Building the 3D model. This takes about two minutes.',
    ready: 'Done. Spin it, open it in AR or download it.',
    failed: 'Something went wrong.',
  }[render.status];
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      {RUNNING.has(render.status) && <Loader2 className="size-4 animate-spin" />}
      {text}
    </p>
  );
}
