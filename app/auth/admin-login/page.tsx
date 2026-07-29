import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { LoginForm } from '@/components/features/auth/login-form';

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Admin login"
      description="Access the administrative workspace through a secure, separate entry point."
      footer={<p>Public users can{' '}<Link href="/auth/welcome" className="font-semibold text-primary">return to onboarding</Link></p>}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 px-3 py-3 text-sm text-slate-600">
          <ShieldCheck className="h-4 w-4 text-primary" /> Admin accounts are created separately and are not part of public registration.
        </div>
        <LoginForm adminOnly />
      </div>
    </AuthShell>
  );
}
