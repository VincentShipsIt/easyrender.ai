'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AuthFields, type AuthMode } from '@/components/auth-fields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get('next') ?? '/dashboard';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
  const other = mode === 'sign-up' ? 'sign-in' : 'sign-up';

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          {mode === 'sign-up' ? t('signUpTitle') : t('signInTitle')}
        </CardTitle>
        <CardDescription>
          {mode === 'sign-up' ? t('signUpDescription') : t('signInDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <AuthFields
          mode={mode}
          onDone={() => {
            router.push(next);
            router.refresh();
          }}
        />
        <p className="text-center text-sm text-muted-foreground">
          {mode === 'sign-up' ? t('haveAccount') : t('newHere')}{' '}
          <Link
            href={`/${other}?next=${encodeURIComponent(next)}`}
            className="text-foreground underline underline-offset-4"
          >
            {mode === 'sign-up' ? t('signIn') : t('createAnAccount')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
