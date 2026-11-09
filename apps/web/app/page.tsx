import { RENDER_CREDITS } from '@easyrender/harness';
import { UploadForm } from '@/components/upload-form';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          One photo. A real 3D model.
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload a listing photo of furniture, an object or a building exterior. Get a free preview
          of every angle, then a 3D model you can spin, embed and open in AR.
        </p>
      </div>
      <UploadForm />
      <p className="text-center text-xs text-muted-foreground">
        Previews are free. A 3D render costs {RENDER_CREDITS} credits ($
        {(RENDER_CREDITS / 100).toFixed(2)}).
      </p>
    </div>
  );
}
