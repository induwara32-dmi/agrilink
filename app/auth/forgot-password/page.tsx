import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { AuthFormField } from '@/components/features/auth/auth-form-field';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recover your account"
      description="Enter your email and we will guide you through password recovery."
      footer={
        <p>
          Remembered it?{' '}
          <Link href="/auth/sign-in" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4">
        <AuthFormField label="Email" type="email" placeholder="you@example.com" />
        <Button size="lg" className="w-full" asChild>
          <Link href="/auth/reset-password">
            Send recovery link <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </form>
    </AuthShell>
  );
}
