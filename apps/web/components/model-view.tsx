'use client';

import { Download, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ModelViewer } from '@/components/model-viewer';
import { Button } from '@/components/ui/button';

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// USDZ (for iOS Quick Look) is converted in the browser from the GLB, so we only store one file.
async function exportUsdz(glbUrl: string): Promise<Blob> {
  const [{ GLTFLoader }, { USDZExporter }] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/exporters/USDZExporter.js'),
  ]);
  const data = await (await fetch(glbUrl)).arrayBuffer();
  const gltf = await new GLTFLoader().parseAsync(data, '');
  const bytes = await new USDZExporter().parseAsync(gltf.scene);
  return new Blob([bytes as BlobPart], { type: 'model/vnd.usdz+zip' });
}

// The interactive 3D viewer with AR, plus GLB and USDZ downloads when allowed.
export function ModelView({
  src,
  name,
  downloadUrl,
}: {
  src: string;
  name: string;
  downloadUrl?: string | null;
}) {
  const t = useTranslations('Render');
  const [exporting, setExporting] = useState(false);

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 to-muted sm:aspect-[4/3]">
        <ModelViewer src={src} alt={t('modelAlt', { name })} interactive ar lazy={false} />
      </div>
      {downloadUrl && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={downloadUrl} download>
              <Download />
              GLB
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                save(await exportUsdz(src), `easyrender-${name}.usdz`);
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            USDZ
          </Button>
        </div>
      )}
    </div>
  );
}
