'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import posthog from 'posthog-js';
import { resetPosthogUser } from '@/components/analytics';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const t = useTranslations('Auth');
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        const result = await authClient.signOut();
        if (!result.error) {
          posthog.capture('sign_out_completed');
          resetPosthogUser();
        }
        router.push('/');
        router.refresh();
      }}
    >
      {t('signOut')}
    </Button>
  );
}
