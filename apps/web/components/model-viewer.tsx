'use client';

import {
  type CSSProperties,
  type DetailedHTMLProps,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        loading?: 'auto' | 'lazy' | 'eager';
        reveal?: 'auto' | 'manual';
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'disable-zoom'?: boolean;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: string;
        'rotation-per-second'?: string;
        'interaction-prompt'?: string;
        'camera-orbit'?: string;
        'shadow-intensity'?: string;
        'shadow-softness'?: string;
        'environment-image'?: string;
        'touch-action'?: string;
        exposure?: string;
      };
    }
  }
}

let loader: Promise<unknown> | null = null;
const loadModelViewer = () => {
  loader ??= import('@google/model-viewer');
  return loader;
};

type Props = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  interactive?: boolean;
  zoom?: boolean;
  ar?: boolean;
  lazy?: boolean;
  rotationSpeed?: string;
};

// Google's <model-viewer>, loaded on the client only.
export function ModelViewer({
  src,
  alt,
  className,
  style,
  interactive = false,
  zoom = true,
  ar = false,
  lazy = true,
  rotationSpeed = '24deg',
}: Props) {
  const [ready, setReady] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    const start = () => loadModelViewer().then(() => alive && setReady(true));
    const element = host.current;
    // A lazy viewer far down the page does not need the library (or its model) until it is
    // about to be seen.
    if (!lazy || !element) {
      start();
      return () => {
        alive = false;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(element);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [lazy]);

  return (
    <div ref={host} className={cn('relative size-full', className)} style={style}>
      {ready && (
        <model-viewer
          src={src}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second={rotationSpeed}
          interaction-prompt="none"
          camera-controls={interactive || undefined}
          disable-zoom={!interactive || !zoom || undefined}
          touch-action={interactive ? 'pan-y' : undefined}
          ar={ar || undefined}
          ar-modes={ar ? 'webxr scene-viewer quick-look' : undefined}
          shadow-intensity="1"
          shadow-softness="1"
          exposure="1"
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            pointerEvents: interactive ? 'auto' : 'none',
            cursor: interactive ? 'grab' : undefined,
          }}
        />
      )}
    </div>
  );
}
