'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get('next') ?? '/';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));
    setBusy(true);
    setError(null);
    const result =
      mode === 'sign-up'
        ? await authClient.signUp.email({
            email,
            password,
            name: String(form.get('name') || email.split('@')[0]),
          })
        : await authClient.signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message ?? 'Something went wrong');
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  const other = mode === 'sign-up' ? 'sign-in' : 'sign-up';
  return (
    <Card className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">
        {mode === 'sign-up' ? 'Create your account' : 'Sign in'}
      </h1>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'sign-up' && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {mode === 'sign-up' ? 'Sign up' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === 'sign-up' ? 'Already have an account? ' : 'New here? '}
        <Link href={`/${other}?next=${encodeURIComponent(next)}`} className="underline">
          {mode === 'sign-up' ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </Card>
  );
}
