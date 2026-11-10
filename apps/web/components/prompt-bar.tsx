'use client';

import {
  ArrowUp,
  Check,
  ImagePlus,
  Loader2,
  Lock,
  Paperclip,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AuthDialog } from '@/components/auth-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { SHOWCASE } from '@/lib/showcase';
import { cn } from '@/lib/utils';

const MAX_SIDE = 2048;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const STEPS = [
  'Uploading your photo',
  'Reading shape and materials',
  'Drawing every angle',
  'Preparing your 3D preview',
];
const EXAMPLES = SHOWCASE.slice(0, 4);

type Phase = 'idle' | 'simulating' | 'teaser' | 'uploading' | 'error';

// Downscales on the client so uploads stay under the 4 MB request limit.
export async function prepare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not read this photo'))),
      'image/jpeg',
      0.9,
    ),
  );
}

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export function PromptBar({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authed, setAuthed] = useState(signedIn);

  useEffect(() => setAuthed(signedIn), [signedIn]);
  useEffect(() => () => void (thumb && URL.revokeObjectURL(thumb)), [thumb]);

  const pick = useCallback((next: File | null | undefined) => {
    if (!next) return;
    if (!TYPES.includes(next.type)) {
      setError('Attach a JPEG, PNG or WebP photo.');
      setPhase('error');
      return;
    }
    setError(null);
    setPhase('idle');
    setProgress(0);
    setFile(next);
    setThumb(URL.createObjectURL(next));
  }, []);

  async function loadExample(index: number) {
    const example = EXAMPLES[index];
    const blob = await (await fetch(example.photo)).blob();
    pick(new File([blob], `${example.id.replace('demo-', '')}.jpg`, { type: 'image/jpeg' }));
    setPrompt(example.prompt);
  }

  function clear() {
    setFile(null);
    setThumb(null);
    setPhase('idle');
    setProgress(0);
    setError(null);
    if (input.current) input.current.value = '';
  }

  // Logged out: play the generation, then ask for an account to reveal it.
  function simulate() {
    setPhase('simulating');
    setProgress(2);
    const started = Date.now();
    const duration = 6500;
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / duration);
      setProgress(Math.round(2 + 96 * (1 - (1 - t) ** 2)));
      if (t >= 1) {
        clearInterval(timer);
        setProgress(100);
        setPhase('teaser');
        setAuthOpen(true);
      }
    }, 80);
  }

  // Signed in: upload for real and open the render page.
  async function generate(source: File) {
    setPhase('uploading');
    setError(null);
    setProgress(8);
    const timer = setInterval(() => setProgress((value) => Math.min(value + 4, 90)), 300);
    try {
      const body = new FormData();
      body.append('image', await prepare(source), 'source.jpg');
      body.append('prompt', prompt);
      const response = await fetch('/api/renders', { method: 'POST', body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'Upload failed');
      setProgress(100);
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPhase('error');
    } finally {
      clearInterval(timer);
    }
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!file) {
      setError('Attach a photo of the object or building first.');
      setPhase('error');
      return;
    }
    if (authed) void generate(file);
    else if (phase === 'teaser') setAuthOpen(true);
    else simulate();
  }

  const busy = phase === 'simulating' || phase === 'uploading';
  const step = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));

  return (
    <div className="w-full space-y-4">
      <form
        onSubmit={submit}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pick(event.dataTransfer.files[0]);
        }}
        className={cn(
          'relative rounded-2xl border bg-card p-2 text-left shadow-lg shadow-black/5 transition-[box-shadow,border-color] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30',
          dragging && 'border-dashed border-primary ring-[3px] ring-ring/30',
        )}
      >
        {file && thumb && (
          <div className="flex flex-wrap gap-2 px-2 pt-2">
            <div className="group flex items-center gap-2 rounded-lg border bg-muted/50 p-1 pr-2">
              {/* biome-ignore lint/performance/noImgElement: local object URL thumbnail */}
              <img src={thumb} alt={file.name} className="size-10 rounded-md object-cover" />
              <div className="min-w-0 text-xs leading-tight">
                <p className="max-w-36 truncate font-medium">{file.name}</p>
                <p className="text-muted-foreground">Photo · {formatSize(file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-6 rounded-full"
                onClick={clear}
                disabled={busy}
                aria-label="Remove photo"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onPaste={(event) => {
            const pasted = Array.from(event.clipboardData.files).find((f) =>
              f.type.startsWith('image/'),
            );
            if (pasted) {
              event.preventDefault();
              pick(pasted);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          maxLength={500}
          rows={2}
          disabled={busy}
          placeholder={
            file
              ? 'Describe it (optional), e.g. walnut sideboard with brass handles'
              : 'Attach a photo of furniture, decor or a building, then describe it…'
          }
          className="min-h-20 resize-none border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-0 dark:bg-transparent md:text-base"
        />
        <div className="flex items-center justify-between gap-2 px-1 pb-0.5">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="text-muted-foreground"
            >
              {file ? <Paperclip /> : <ImagePlus />}
              {file ? 'Replace photo' : 'Attach photo'}
            </Button>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              or drop, or paste
            </span>
          </div>
          <Button type="submit" disabled={busy} className="rounded-full">
            {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Generate
            {!busy && <ArrowUp className="hidden sm:block" />}
          </Button>
        </div>
        <input
          ref={input}
          type="file"
          accept={TYPES.join(',')}
          className="hidden"
          onChange={(event) => pick(event.target.files?.[0])}
        />
        {dragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 text-sm font-medium">
            Drop your photo to attach it
          </div>
        )}
      </form>

      {phase === 'idle' && !file && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm lg:justify-start">
          <span className="text-muted-foreground">Try one:</span>
          {EXAMPLES.map((example, index) => (
            <Button
              key={example.id}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 rounded-full pl-1 text-xs"
              onClick={() => loadExample(index)}
            >
              {/* biome-ignore lint/performance/noImgElement: tiny static thumbnail */}
              <img src={example.photo} alt="" className="size-5 rounded-full object-cover" />
              {example.title}
            </Button>
          ))}
        </div>
      )}

      {phase === 'error' && error && (
        <Alert variant="destructive" className="text-left">
          <TriangleAlert />
          <AlertTitle>Could not start this render</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(busy || phase === 'teaser') && thumb && (
        <Card className="gap-4 py-4 text-left">
          <CardContent className="space-y-4 px-4">
            <div className="flex items-center gap-3">
              {/* biome-ignore lint/performance/noImgElement: local object URL thumbnail */}
              <img src={thumb} alt="" className="size-10 rounded-md border object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {phase === 'teaser' ? 'Your preview is ready' : `${STEPS[step]}…`}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {prompt || 'Photo to 3D model'}
                </p>
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
            {phase === 'teaser' ? (
              <Teaser thumb={thumb} onReveal={() => setAuthOpen(true)} />
            ) : (
              <ol className="grid gap-1.5 text-xs sm:grid-cols-2">
                {STEPS.map((label, index) => (
                  <li
                    key={label}
                    className={cn(
                      'flex items-center gap-2',
                      index > step ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {index < step ? (
                      <Check className="size-3.5" />
                    ) : index === step ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <span className="size-3.5 rounded-full border" />
                    )}
                    {label}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        title="Your 3D preview is ready"
        description="Create a free account to see every angle of your photo and turn it into a 3D model."
        onDone={async () => {
          setAuthOpen(false);
          setAuthed(true);
          router.refresh();
          if (file) await generate(file);
        }}
      >
        {thumb && (
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                {/* biome-ignore lint/performance/noImgElement: local object URL thumbnail */}
                <img
                  src={thumb}
                  alt=""
                  className={cn('size-full object-cover', index > 0 && 'scale-110 blur-sm')}
                  style={{ transform: index % 2 ? 'scaleX(-1) scale(1.1)' : undefined }}
                />
                {index > 0 && (
                  <Lock className="absolute inset-0 m-auto size-4 text-white drop-shadow" />
                )}
              </div>
            ))}
          </div>
        )}
      </AuthDialog>
    </div>
  );
}

function Teaser({ thumb, onReveal }: { thumb: string; onReveal: () => void }) {
  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative grid
            key={index}
            className="aspect-square overflow-hidden rounded-md border bg-white"
          >
            {/* biome-ignore lint/performance/noImgElement: local object URL thumbnail */}
            <img
              src={thumb}
              alt=""
              className="size-full object-cover blur-md"
              style={{ transform: `scale(1.15) ${index % 2 ? 'scaleX(-1)' : ''}` }}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Button onClick={onReveal} className="shadow-lg">
          <Lock />
          Sign up free to see every angle
        </Button>
      </div>
    </div>
  );
}
