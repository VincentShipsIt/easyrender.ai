'use client';

import { Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ModelViewer } from '@/components/model-viewer';
import { Button } from '@/components/ui/button';

type ArElement = HTMLElement & { canActivateAR?: boolean; activateAR?: () => Promise<void> };

// The page a shopper lands on after scanning a product's QR code: the model, and one button that
// opens the phone's own AR (Scene Viewer on Android, Quick Look on iPhone). On a computer the QR
// code is shown instead, to carry the model to a phone.
export function ArView({ src, name, qrUrl }: { src: string; name: string; qrUrl: string }) {
  const t = useTranslations('Ar');
  const [viewer, setViewer] = useState<ArElement | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  async function openAr() {
    if (!viewer?.canActivateAR || !viewer.activateAR) {
      setIsUnavailable(true);
      return;
    }
    await viewer.activateAR();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[1fr_18rem] md:py-10">
      <div className="space-y-4">
        <div className="aspect-square w-full overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 to-muted sm:aspect-[4/3]">
          <ModelViewer
            src={src}
            alt={t('modelAlt', { name })}
            interactive
            ar
            lazy={false}
            onLoad={(element) => setViewer(element as ArElement)}
          />
        </div>
        <Button size="lg" className="h-11 w-full" onClick={openAr} disabled={!viewer}>
          <Smartphone />
          {t('viewInRoom')}
        </Button>
        {isUnavailable ? (
          <p className="text-sm text-muted-foreground">{t('arUnavailable')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t('tapHint')}</p>
        )}
      </div>
      <div className="hidden flex-col items-center gap-3 self-start rounded-xl border p-4 text-center pointer-fine:flex">
        <h2 className="text-sm font-medium">{t('scanTitle')}</h2>
        {/* biome-ignore lint/performance/noImgElement: SVG QR code from our own route */}
        <img src={qrUrl} alt={t('scanAlt')} className="size-48 rounded-md bg-white p-1" />
        <p className="text-sm text-muted-foreground">{t('scanBody')}</p>
      </div>
    </div>
  );
}
