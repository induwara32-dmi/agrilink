'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/client';

type VerificationState = 'pending' | 'verifying' | 'verified' | 'error';

export function EmailVerificationResult({ token, registered }: { token?: string; registered: boolean }) {
  const [state, setState] = useState<VerificationState>(token ? 'verifying' : registered ? 'pending' : 'error');
  const [error, setError] = useState(token || registered ? null : 'This verification link is incomplete.');

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => setState('verified'))
      .catch((requestError: unknown) => {
        setError(requestError instanceof ApiClientError ? requestError.message : 'Unable to verify your email. Please request a new link.');
        setState('error');
      });
  }, [token]);

  const content = state === 'pending'
    ? { icon: <MailCheck className="mx-auto h-10 w-10 text-primary" />, title: 'Check your email', message: 'Your account was created. Open the verification link sent to your email before signing in.', tone: 'bg-primary/10' }
    : state === 'verifying'
      ? { icon: <MailCheck className="mx-auto h-10 w-10 animate-pulse text-primary" />, title: 'Verifying email…', message: 'Please wait while AgriLink verifies your account.', tone: 'bg-primary/10' }
      : state === 'verified'
        ? { icon: <CheckCircle2 className="mx-auto h-10 w-10 text-success" />, title: 'Email verified', message: 'Your account is ready. You can now sign in with your new credentials.', tone: 'bg-success/10' }
        : { icon: <XCircle className="mx-auto h-10 w-10 text-danger" />, title: 'Verification failed', message: error ?? 'Unable to verify this email address.', tone: 'bg-danger/10' };

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-center rounded-2xl border border-border p-6 text-center ${content.tone}`}>
        <div className="space-y-2">{content.icon}<p className="text-sm font-semibold text-slate-900">{content.title}</p><p className="text-sm text-slate-600">{content.message}</p></div>
      </div>
      {state === 'pending' || state === 'verifying' ? null : (
        <Button size="lg" className="w-full" asChild>
          <Link href="/auth/sign-in">Continue <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      )}
    </div>
  );
}
