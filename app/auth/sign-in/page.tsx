import Link from 'next/link';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { LoginForm } from '@/components/features/auth/login-form';

export default function SignInPage() {
  return (
    <AuthShell
      title="Sign in to AgriLink"
      description="Access your dashboard and continue growing your agricultural network."
      footer={<p>New here?{' '}<Link href="/auth/sign-up" className="font-semibold text-primary">Create account</Link></p>}
    >
      <div className="space-y-4">
        <LoginForm />
        <div className="text-center text-sm">
          <Link href="/auth/forgot-password" className="font-semibold text-primary">Forgot password?</Link>
        </div>
      </div>
    </AuthShell>
  );
}
