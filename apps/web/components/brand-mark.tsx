import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

// The easyrender mark: two offset frames, one in front of the other, and a datum dot at the top
// right. A flat photo turning into something with depth, anchored at one point. It is a single
// colour, so it follows the text colour on any ground and needs no light or dark variant. The same
// shape ships as `public/brand/mark.svg`; keep the two in step.
export function BrandMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
      className={cn('size-5 shrink-0', className)}
      {...props}
    >
      <path fillRule="evenodd" d="M4 4H44V20H60V60H20V44H4ZM9 9V39H20V20H39V9ZM25 25V55H55V25Z" />
      <circle cx="55" cy="9" r="5" />
    </svg>
  );
}
