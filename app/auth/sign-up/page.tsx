'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserCircle2 } from 'lucide-react';
import { type FormEvent } from 'react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { AuthFormField } from '@/components/features/auth/auth-form-field';
import { Button } from '@/components/ui/button';
import { useSignup } from '@/providers/signup-provider';

export default function CreateAccountPage() {
  const router = useRouter();
  const { draft, saveDraft } = useSignup();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get('phone') ?? '').trim();
    saveDraft({
      firstName: String(form.get('firstName')).trim(),
      lastName: String(form.get('lastName')).trim(),
      email: String(form.get('email')).trim(),
      password: String(form.get('password')),
      ...(phone ? { phone } : {}),
    });
    router.push('/auth/role-selection');
  }

  return (
    <AuthShell
      title="Create your account"
      description="Set up your buyer, farmer, or transporter profile with a secure onboarding flow."
      footer={<p>Already have an account?{' '}<Link href="/auth/sign-in" className="font-semibold text-primary">Sign in</Link></p>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthFormField label="First name" name="firstName" autoComplete="given-name" required defaultValue={draft?.firstName} placeholder="Amina" />
          <AuthFormField label="Last name" name="lastName" autoComplete="family-name" required defaultValue={draft?.lastName} placeholder="Yusuf" />
        </div>
        <AuthFormField label="Email" name="email" type="email" autoComplete="email" required defaultValue={draft?.email} placeholder="you@example.com" />
        <AuthFormField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={32} defaultValue={draft?.phone} placeholder="+94 77 123 4567" />
        <AuthFormField label="Password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} defaultValue={draft?.password} placeholder="••••••••••••" />
        <p className="text-xs leading-5 text-slate-500">Use at least 12 characters with uppercase, lowercase, number, and symbol.</p>
        <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-900"><UserCircle2 className="h-4 w-4 text-primary" /> Public roles are limited to Buyer, Farmer, and Transporter.</div>
          <p className="mt-2">Admin access uses a separate login route and is not part of public registration.</p>
        </div>
        <Button size="lg" className="w-full" type="submit">Continue <ArrowRight className="h-4 w-4" /></Button>
      </form>
    </AuthShell>
  );
}
