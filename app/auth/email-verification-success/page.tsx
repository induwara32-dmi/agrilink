import Link from 'next/link';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { EmailVerificationResult } from '@/components/features/auth/email-verification-result';

export default async function EmailVerificationSuccessPage({ searchParams }: { searchParams: Promise<{ token?: string | string[]; registered?: string | string[] }> }) {
  const query = await searchParams;
  const token = typeof query.token === 'string' ? query.token : undefined;
  const registered = query.registered === '1';

  return (
    <AuthShell
      title={token ? 'Verify your email' : 'Registration received'}
      description="Complete email verification before signing in to AgriLink."
      footer={<p>Need help?{' '}<Link href="/auth/sign-in" className="font-semibold text-primary">Return to sign in</Link></p>}
    >
      <EmailVerificationResult token={token} registered={registered} />
    </AuthShell>
  );
}
