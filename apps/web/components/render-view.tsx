'use client';

import type { RenderView as View } from '@easyrender/core';
import { Box, Globe, Grid3x3, Loader2, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ModelView } from '@/components/model-view';
import { DATE_FORMAT, RenderDetail } from '@/components/render-detail';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { observeRender } from '@/lib/analytics/browser';

const RUNNING = new Set(['drafting', 'rendering']);

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
  const t = useTranslations('Render');
  const format = useFormatter();
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

  useEffect(() => {
    if (owner) observeRender(render);
  }, [render, owner]);

  async function build() {
    setStarting(true);
    setError(null);
    const response = await fetch(`/api/renders/${render.id}/render`, { method: 'POST' });
    const data = await response.json();
    if (response.ok) setRender(data);
    else setError(data.error ?? t('errors.start'));
    setStarting(false);
  }

  async function makeSheet() {
    setStarting(true);
    setError(null);
    const response = await fetch(`/api/renders/${render.id}/sheet`, { method: 'POST' });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setRender(data);
    else setError(data.error ?? t('errors.sheet'));
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

  // An angle sheet bought earlier already counts toward the price.
  const owed = Math.max(0, render.renderCredits - render.credits);
  const base = `/api/renders/${render.id}`;
  const next = encodeURIComponent(`/r/${render.id}`);
  const title = render.prompt || t('untitled');

  const viewer =
    render.status === 'ready' ? (
      <ModelView
        src={`${base}/model?v=${render.modelVersion}`}
        name={render.id}
        downloadUrl={owner ? `${base}/model?download=1` : null}
        editableRenderId={owner ? render.id : undefined}
      />
    ) : (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-xl border bg-muted/40 p-6 text-center text-muted-foreground sm:aspect-[4/3]">
        {render.status === 'failed' ? (
          <p className="text-sm">{render.error}</p>
        ) : RUNNING.has(render.status) ? (
          <>
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">
              {render.status === 'drafting' ? t('drafting') : t('rendering')}
            </p>
          </>
        ) : (
          <>
            <Box className="size-8" />
            <p className="max-w-sm text-sm">{t('previewReady')}</p>
          </>
        )}
      </div>
    );

  const angles = render.hasPreview ? (
    // biome-ignore lint/performance/noImgElement: watermarked preview served by our own API
    <img
      src={`${base}/preview?s=${render.status}`}
      alt={t('previewAlt')}
      className="w-full rounded-lg border bg-white"
    />
  ) : (
    <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
      {render.status === 'failed' ? (
        <span className="text-sm">{t('noPreview')}</span>
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
              {t('signUpToRender')}
            </Link>
          </Button>
        ) : balance < owed ? (
          <Button size="lg" className="w-full" asChild>
            <Link href={`/credits?next=${next}`}>{t('buyToRender')}</Link>
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={build} disabled={starting}>
            {starting ? <Loader2 className="animate-spin" /> : <Box />}
            {t('render3d', { credits: owed })}
          </Button>
        ))}
      {render.status === 'preview_ready' &&
        signedIn &&
        !render.hasSheet &&
        balance >= render.sheetCredits && (
          <Button variant="outline" className="w-full" onClick={makeSheet} disabled={starting}>
            {starting ? <Loader2 className="animate-spin" /> : <Grid3x3 />}
            {t('generateSheet', { credits: render.sheetCredits })}
          </Button>
        )}
      {render.status === 'failed' && (
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">{t('tryAnother')}</Link>
        </Button>
      )}
      {signedIn && render.status !== 'failed' && (
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <Label htmlFor="public" className="flex-col items-start gap-1">
            <span>{t('showInGallery')}</span>
            <span className="text-xs font-normal text-muted-foreground">{t('finishedOnly')}</span>
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
        {t('makeYourOwn')}
      </Link>
    </Button>
  );

  return (
    <RenderDetail
      title={title}
      prompt={render.prompt}
      badges={[t(`status.${render.status}`)]}
      viewer={viewer}
      input={`${base}/source`}
      angles={angles}
      meta={[
        {
          label: t('meta.status'),
          value: (
            <span className="inline-flex items-center gap-1.5">
              {RUNNING.has(render.status) && <Loader2 className="size-3.5 animate-spin" />}
              {t(`status.${render.status}`)}
            </span>
          ),
        },
        { label: t('meta.engine'), value: 'TRELLIS + angle sheet' },
        { label: t('meta.formats'), value: 'GLB · USDZ' },
        ...(owner ? [{ label: t('meta.creditsUsed'), value: format.number(render.credits) }] : []),
        {
          label: t('meta.visibility'),
          value: (
            <span className="inline-flex items-center gap-1.5">
              {render.isPublic ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
              {render.isPublic ? t('public') : t('private')}
            </span>
          ),
        },
        {
          label: t('meta.created'),
          value: format.dateTime(new Date(render.createdAt), DATE_FORMAT),
        },
      ]}
      actions={actions}
    />
  );
}
