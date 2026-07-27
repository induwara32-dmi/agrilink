import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { AuthFormField } from '@/components/features/auth/auth-form-field';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Admin login"
      description="Access the administrative workspace through a secure, separate entry point."
      footer={
        <p>
          Public users can{' '}
          <Link href="/auth/welcome" className="font-semibold text-primary">
            return to onboarding
          </Link>
        </p>
      }
    >
      <form className="space-y-4">
        <AuthFormField label="Admin email" type="email" placeholder="admin@agrilink.com" />
        <AuthFormField label="Admin password" type="password" placeholder="••••••••" />
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 px-3 py-3 text-sm text-slate-600">
          <ShieldCheck className="h-4 w-4 text-primary" /> Admin accounts are created separately and are not part of public registration.
        </div>
        <Button size="lg" className="w-full">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
}
