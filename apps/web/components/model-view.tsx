'use client';

import { Download, Loader2 } from 'lucide-react';
import { type DetailedHTMLProps, type HTMLAttributes, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'shadow-intensity'?: string;
        exposure?: string;
      };
    }
  }
}

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

export function ModelView({ id }: { id: string }) {
  const src = `/api/renders/${id}/model`;
  const [loaded, setLoaded] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    import('@google/model-viewer').then(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-4">
      <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted/40 sm:aspect-[4/3]">
        {loaded && (
          <model-viewer
            src={src}
            alt="3D model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            exposure="1"
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={`${src}?download=1`} className="contents">
          <Button variant="outline">
            <Download className="size-4" />
            GLB
          </Button>
        </a>
        <Button
          variant="outline"
          disabled={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              save(await exportUsdz(src), `easyrender-${id}.usdz`);
            } finally {
              setExporting(false);
            }
          }}
        >
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          USDZ
        </Button>
      </div>
    </div>
  );
}
