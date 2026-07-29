'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';
import { AuthFormField } from './auth-form-field';
import { Button } from '@/components/ui/button';
import { ApiClientError } from '@/lib/api/client';
import type { UserRole } from '@/lib/api/types';
import { useAuth } from '@/providers/auth-provider';

const roleDestination: Record<UserRole, string> = {
  BUYER: '/buyer',
  FARMER: '/farmer',
  TRANSPORTER: '/transporter',
  ADMIN: '/admin',
};

export function LoginForm({ adminOnly = false }: { adminOnly?: boolean }) {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await login(String(form.get('email')), String(form.get('password')));
      if (adminOnly && user.role !== 'ADMIN') {
        await logout();
        setError('This sign-in page is reserved for administrator accounts.');
        return;
      }
      router.replace(roleDestination[user.role]);
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <AuthFormField label={adminOnly ? 'Admin email' : 'Email'} name="email" type="email" autoComplete="email" required placeholder={adminOnly ? 'admin@agrilink.com' : 'you@example.com'} />
      <AuthFormField label={adminOnly ? 'Admin password' : 'Password'} name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      {error ? <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
      <Button size="lg" className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Continue'} {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
      {!adminOnly ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-slate-50 px-3 py-3 text-sm text-slate-600">
          <Lock className="mr-2 h-4 w-4 text-primary" /> Secure API-backed sign-in
        </div>
      ) : null}
    </form>
  );
}
