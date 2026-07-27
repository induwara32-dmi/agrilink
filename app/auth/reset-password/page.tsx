import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { AuthFormField } from '@/components/features/auth/auth-form-field';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Choose a secure password for your AgriLink account."
      footer={
        <p>
          Back to{' '}
          <Link href="/auth/sign-in" className="font-semibold text-primary">
            sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4">
        <AuthFormField label="New password" type="password" placeholder="••••••••" />
        <AuthFormField label="Confirm password" type="password" placeholder="••••••••" />
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 px-3 py-3 text-sm text-slate-600">
          <ShieldCheck className="h-4 w-4 text-primary" /> Passwords are validated locally in this mock flow.
        </div>
        <Button size="lg" className="w-full" asChild>
          <Link href="/auth/email-verification-success">
            Update password <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </form>
    </AuthShell>
  );
}
