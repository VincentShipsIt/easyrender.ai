import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { martianMono, monaSans } from './fonts';
import './studio.css';

// Wraps a marketing page: loads the studio typefaces and stylesheet and, through
// `body:has(.er-studio)`, switches the page chrome to the studio palette.
export function StudioShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('er-studio', monaSans.variable, martianMono.variable, className)}>
      {children}
    </div>
  );
}
