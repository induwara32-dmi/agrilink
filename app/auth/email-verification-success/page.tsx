import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { Button } from '@/components/ui/button';

export default function EmailVerificationSuccessPage() {
  return (
    <AuthShell
      title="Email verified"
      description="Your account is ready. Continue to sign in and start exploring AgriLink."
      footer={
        <p>
          Need help?{' '}
          <Link href="/auth/sign-in" className="font-semibold text-primary">
            Return to sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center rounded-2xl border border-border bg-success/10 p-6 text-center">
          <div className="space-y-2">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <p className="text-sm font-semibold text-slate-900">Your email verification was successful.</p>
          </div>
        </div>
        <Button size="lg" className="w-full" asChild>
          <Link href="/auth/sign-in">
            Continue <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </AuthShell>
  );
}
