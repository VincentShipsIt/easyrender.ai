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
  /** Starting camera, in model-viewer's `camera-orbit` syntax. */
  cameraOrbit?: string;
  autoRotate?: boolean;
  /** Called once the model has loaded and is drawn. */
  onLoad?: () => void;
};

// Google's <model-viewer>, loaded on the client only, and only once its box comes near the
// viewport: the library bundles its own three.js (~370 KB), so a viewer far down a page must not
// download it during the first paint. The box keeps its size while empty, so nothing shifts.
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
  cameraOrbit,
  autoRotate = true,
  onLoad,
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  // Read through a ref so a new callback on every render does not re-attach the listener.
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    let alive = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadModelViewer().then(() => alive && setReady(true));
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(element);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const element = viewer.current;
    if (!ready || !element) return;
    const handle = () => onLoadRef.current?.();
    element.addEventListener('load', handle);
    return () => element.removeEventListener('load', handle);
  }, [ready]);

  return (
    <div ref={box} className={cn('relative size-full', className)} style={style}>
      {ready && (
        <model-viewer
          ref={viewer}
          src={src}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          auto-rotate={autoRotate || undefined}
          auto-rotate-delay="0"
          camera-orbit={cameraOrbit}
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
