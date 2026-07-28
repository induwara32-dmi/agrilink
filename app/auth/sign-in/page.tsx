import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { AuthFormField } from '@/components/features/auth/auth-form-field';
import { Button } from '@/components/ui/button';

export default function SignInPage() {
  return (
    <AuthShell
      title="Sign in to AgriLink"
      description="Access your dashboard and continue growing your agricultural network."
      footer={
        <p>
          New here?{' '}
          <Link href="/auth/sign-up" className="font-semibold text-primary">
            Create account
          </Link>
        </p>
      }
    >
      <form className="space-y-4">
        <AuthFormField label="Email" type="email" placeholder="you@example.com" />
        <AuthFormField label="Password" type="password" placeholder="••••••••" />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="rounded border-border" /> Remember me
          </label>
          <Link href="/auth/forgot-password" className="font-semibold text-primary">
            Forgot password?
          </Link>
        </div>
        <Button size="lg" className="w-full">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-center rounded-2xl border border-border bg-slate-50 px-3 py-3 text-sm text-slate-600">
          <Lock className="mr-2 h-4 w-4 text-primary" /> Secure mock sign-in experience
        </div>
      </form>
    </AuthShell>
  );
}
