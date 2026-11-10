'use client';

import { useEffect, useEffectEvent, useRef } from 'react';
import { Scope } from '@/lib/studio/scope';

// Runs `setup` once the element scrolls near the viewport and tears everything down on unmount.
// `setup` loads its 3D code with a dynamic import, so three.js stays out of the first bundle.
// It runs again when `key` changes (the locale, for sections that write text from the 3D code).
export function useSection<T extends HTMLElement>(
  setup: (root: T, scope: Scope) => Promise<void> | void,
  key: string,
  margin = '700px',
) {
  const ref = useRef<T>(null);
  const run = useEffectEvent(setup);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` is the caller's signal to set the section up again
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const scope = new Scope();
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        Promise.resolve(run(root, scope)).catch((error) => {
          console.warn('studio: section failed to start', error);
        });
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(root);
    scope.add(() => observer.disconnect());
    return () => scope.dispose();
  }, [key, margin]);

  return ref;
}
