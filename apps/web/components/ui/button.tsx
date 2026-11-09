import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border bg-background hover:bg-muted',
  ghost: 'hover:bg-muted',
} as const;

const sizes = { default: 'h-9 px-4', sm: 'h-8 px-3 text-xs', lg: 'h-11 px-6 text-base' } as const;

export type ButtonStyle = { variant?: keyof typeof variants; size?: keyof typeof sizes };

export const buttonClass = ({ variant = 'default', size = 'default' }: ButtonStyle = {}) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  );

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<'button'> & ButtonStyle) {
  return <button className={cn(buttonClass({ variant, size }), className)} {...props} />;
}
