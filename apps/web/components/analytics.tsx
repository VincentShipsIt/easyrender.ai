'use client';
import {
  CONFIG_VERSION,
  isToolAllowed,
  type PrivacyRegion,
  toolPolicy,
} from '@easyrender/core/attribution';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { Button } from '@/components/ui/button';
import { attribution, gaPageview, initializeGa, setBrowserTools } from '@/lib/analytics/browser';
import { authClient } from '@/lib/auth-client';

const hasPosthog = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
let identifiedUserId: string | null = null;
const fallback: PrivacyRegion = {
  country: null,
  consent_region: 'strict',
  gpc: false,
  config_version: CONFIG_VERSION,
};
export function cookiesPath(locale: string) {
  return locale === 'en' ? '/cookies' : `/${locale}/${locale === 'it' ? 'cookie' : 'cookies'}`;
}

export function identifyPosthogUser(user: { id: string; email?: string | null; name?: string | null }) {
  if (identifiedUserId === user.id) return;
  if (identifiedUserId) posthog.reset();
  posthog.identify(user.id, {
    ...(user.email ? { email: user.email } : {}),
    ...(user.name ? { name: user.name } : {}),
  });
  identifiedUserId = user.id;
}

export function resetPosthogUser() {
  posthog.reset();
  identifiedUserId = null;
}
function readChoice(): boolean | null {
  try {
    const value = document.cookie.split('; ').find((cookie) => cookie.startsWith('er_consent='));
    const parsed = JSON.parse(decodeURIComponent(value?.slice('er_consent='.length) ?? 'null'));
    return parsed?.version === CONFIG_VERSION &&
      typeof parsed.accepted === 'boolean' &&
      Number.isFinite(Date.parse(parsed.date))
      ? parsed.accepted
      : null;
  } catch {
    return null;
  }
}
export function chooseConsent(accepted: boolean) {
  document.cookie = `er_consent=${encodeURIComponent(JSON.stringify({ version: CONFIG_VERSION, date: new Date().toISOString(), accepted }))}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  window.dispatchEvent(new Event('er-consent'));
}
export function ConsentControls() {
  const t = useTranslations('Analytics');
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => chooseConsent(true)}>
        {t('accept')}
      </Button>
      <Button variant="outline" onClick={() => chooseConsent(false)}>
        {t('reject')}
      </Button>
    </div>
  );
}
export function Analytics() {
  const t = useTranslations('Analytics');
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [region, setRegion] = useState<PrivacyRegion>(fallback);
  const [isResolved, setResolved] = useState(false);
  const [choice, setChoice] = useState<boolean | null>(null);
  useEffect(() => {
    attribution();
    initializeGa(gaId);
    setChoice(readChoice());
    const changed = () => setChoice(readChoice());
    window.addEventListener('er-consent', changed);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const query = new URLSearchParams(location.search);
    const params = new URLSearchParams();
    for (const key of ['__geo', '__privacy_fail'])
      if (query.has(key)) params.set(key, query.get(key) ?? '');
    const hasGpc =
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    void fetch(`/api/privacy-region?${params}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('region unavailable');
        const result = (await response.json()) as PrivacyRegion;
        if (!['strict', 'standard'].includes(result.consent_region))
          throw new Error('invalid region');
        setRegion({ ...result, gpc: hasGpc || result.gpc });
        setResolved(true);
      })
      .catch(() => {
        setRegion({
          ...fallback,
          gpc: hasGpc,
        }); /* No optional load on failure, even with a previous choice. */
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      controller.abort();
      clearTimeout(timeout);
      window.removeEventListener('er-consent', changed);
    };
  }, []);
  useEffect(() => {
    // Always after paint, outside the critical rendering path. Cancel pending imports on rejection.
    const ph =
      isResolved &&
      hasPosthog &&
      isToolAllowed('posthog', region.consent_region, choice, region.gpc);
    const ga =
      isResolved &&
      Boolean(gaId) &&
      isToolAllowed('ga4', region.consent_region, choice, region.gpc);
    if (!ph && !ga) {
      void setBrowserTools(false, false, choice === false || region.gpc);
      return;
    }
    const timer = setTimeout(() => {
      void setBrowserTools(ph, ga).then(() => {
        if (ph && session?.user?.id) identifyPosthogUser(session.user);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [region, choice, isResolved, session?.user?.id, session?.user?.email, session?.user?.name]);
  useEffect(() => {
    if (pathname) gaPageview();
  }, [pathname]);
  const needsConsent =
    (hasPosthog && toolPolicy('posthog', region.consent_region) === 'consent') ||
    (Boolean(gaId) && toolPolicy('ga4', region.consent_region) === 'consent');
  if (
    !isResolved ||
    region.consent_region !== 'strict' ||
    region.gpc ||
    choice !== null ||
    !needsConsent
  )
    return null;
  return (
    <aside
      aria-label={t('title')}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-lg border bg-background p-4 text-sm shadow-lg"
      data-testid="consent-banner"
    >
      <p className="mb-3 text-muted-foreground">{t('banner')}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ConsentControls />
        <Link href={cookiesPath(locale)} className="underline underline-offset-4">
          {t('details')}
        </Link>
      </div>
    </aside>
  );
}
