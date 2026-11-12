import { cn } from '@/lib/utils';
import { isInFlight } from './types';

// Greyscale on purpose (DESIGN.md: chrome is greyscale, destructive marks errors).
export function StatusDot({ status, className }: { status: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'size-2 shrink-0 rounded-full',
        status === 'ready' && 'bg-foreground',
        isInFlight(status) && 'animate-pulse bg-muted-foreground motion-reduce:animate-none',
        status === 'preview_ready' && 'border border-muted-foreground',
        status === 'failed' && 'bg-destructive',
        className,
      )}
    />
  );
}
