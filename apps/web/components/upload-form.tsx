'use client';

import { ImageUp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fieldClass } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MAX_SIDE = 2048;

// Downscales on the client so uploads stay under the 4 MB request limit.
async function prepare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))),
      'image/jpeg',
      0.9,
    ),
  );
}

export function UploadForm() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(next: File | undefined) {
    if (!next) return;
    if (!next.type.startsWith('image/')) return setError('Choose a photo (JPEG, PNG or WebP).');
    setError(null);
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return setError('Add a photo first.');
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('image', await prepare(file), 'source.jpg');
      body.append('prompt', prompt);
      const response = await fetch('/api/renders', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Upload failed');
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Optional: describe the object, e.g. walnut sideboard with brass handles"
        className={cn(fieldClass, 'resize-none text-base')}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          pick(event.dataTransfer.files[0]);
        }}
        className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-dashed bg-muted/40 text-muted-foreground transition-colors hover:bg-muted"
      >
        {preview ? (
          // biome-ignore lint/performance/noImgElement: local object URL preview
          <img src={preview} alt="Selected source" className="h-full w-full object-contain" />
        ) : (
          <>
            <ImageUp className="size-8" />
            <span className="text-sm">Drop a photo here or click to upload</span>
            <span className="text-xs">
              One clear photo of a piece of furniture, an object or a building exterior
            </span>
          </>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => pick(event.target.files?.[0])}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy || !file}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        Generate
      </Button>
    </form>
  );
}
