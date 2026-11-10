'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthFields, type AuthMode } from '@/components/auth-fields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get('next') ?? '/dashboard';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
  const other = mode === 'sign-up' ? 'sign-in' : 'sign-up';

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          {mode === 'sign-up' ? 'Create your account' : 'Welcome back'}
        </CardTitle>
        <CardDescription>
          {mode === 'sign-up'
            ? 'Free previews of every angle. Pay only for the 3D models you keep.'
            : 'Sign in to render, download and share your 3D models.'}
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
          {mode === 'sign-up' ? 'Already have an account? ' : 'New here? '}
          <Link
            href={`/${other}?next=${encodeURIComponent(next)}`}
            className="text-foreground underline underline-offset-4"
          >
            {mode === 'sign-up' ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
