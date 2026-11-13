import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

// The easyrender mark: a sphere under one light, coming from the upper right.
// On a dark ground the solid part is the lit side; on a light ground it is the shadow, so the
// same shape is drawn turned half a turn. Marketing pages (`.er-studio`) are dark whatever the
// system theme says.
const SPHERE = 'M24 7A17 17 0 0 1 24 41A6.5 17 0 0 1 24 7Z';

function Sphere({ turn, className }: { turn: number; className: string }) {
  return (
    <g transform={`rotate(${turn} 24 24)`} className={className}>
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2" />
      <path d={SPHERE} fill="currentColor" />
    </g>
  );
}

export function BrandMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn('size-5 shrink-0', className)}
      {...props}
    >
      <Sphere turn={142} className="dark:hidden [body:has(.er-studio)_&]:hidden" />
      <Sphere turn={-38} className="hidden dark:block [body:has(.er-studio)_&]:block" />
    </svg>
  );
}
