'use client';
import type { PricingVariant } from '@easyrender/harness/pricing';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { observePricing, stopObservingPricing } from '@/lib/analytics/browser';

export function PricingExposure({
  variant,
  subject,
  isExperimentActive,
}: {
  variant: PricingVariant;
  subject: string | null;
  isExperimentActive: boolean;
}) {
  const router = useRouter();
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = marker.current;
    if (!element || !isExperimentActive) return;
    let isDisposed = false;
    let isChecking = false;
    async function refreshOnShutdown() {
      if (isChecking || document.visibilityState === 'hidden') return;
      isChecking = true;
      try {
        const response = await fetch('/api/pricing', {
          cache: 'no-store',
          signal: AbortSignal.timeout(3000),
        });
        const current = response.ok ? await response.json() : null;
        if (!isDisposed && (!current?.isExperimentActive || current.variant !== variant)) {
          stopObservingPricing();
          router.refresh();
        }
      } catch {
        if (!isDisposed) {
          stopObservingPricing();
          router.refresh();
        }
      } finally {
        isChecking = false;
      }
    }
    const timer = setInterval(() => void refreshOnShutdown(), 5000);
    document.addEventListener('visibilitychange', refreshOnShutdown);
    void refreshOnShutdown();
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) observePricing(variant);
    });
    observer.observe(element);
    return () => {
      isDisposed = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshOnShutdown);
      observer.disconnect();
      stopObservingPricing();
    };
  }, [variant, isExperimentActive, router]);
  return (
    <span
      ref={marker}
      data-pricing-variant={variant}
      data-pricing-subject={subject ?? undefined}
      aria-hidden="true"
      className="block h-px"
    />
  );
}
