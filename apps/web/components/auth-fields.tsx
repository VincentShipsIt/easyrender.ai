'use client';

import { Loader2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

export type AuthMode = 'sign-in' | 'sign-up';

// Email and password sign up or sign in. Calls onDone once the session cookie is set.
export function AuthFields({
  mode,
  onDone,
  submitLabel,
}: {
  mode: AuthMode;
  onDone: () => void | Promise<void>;
  submitLabel?: string;
}) {
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
      setError(result.error.message ?? 'Could not sign you in. Try again.');
      setBusy(false);
      return;
    }
    await onDone();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {mode === 'sign-up' && (
        <div className="grid gap-2">
          <Label htmlFor={`${mode}-name`}>Name</Label>
          <Input id={`${mode}-name`} name="name" autoComplete="name" placeholder="Jane Agent" />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input
          id={`${mode}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@agency.com"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input
          id={`${mode}-password`}
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
          placeholder="At least 8 characters"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="animate-spin" />}
        {submitLabel ?? (mode === 'sign-up' ? 'Create account' : 'Sign in')}
      </Button>
    </form>
  );
}
