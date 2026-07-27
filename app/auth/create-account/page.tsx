import Link from 'next/link';
import { ArrowRight, UserCircle2 } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { AuthFormField } from '@/components/features/auth/auth-form-field';
import { Button } from '@/components/ui/button';

export default function CreateAccountPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Set up your buyer, farmer, or transporter profile with a secure onboarding flow."
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthFormField label="First name" placeholder="Amina" />
          <AuthFormField label="Last name" placeholder="Yusuf" />
        </div>
        <AuthFormField label="Email" type="email" placeholder="you@example.com" />
        <AuthFormField label="Password" type="password" placeholder="••••••••" />
        <div className="rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <UserCircle2 className="h-4 w-4 text-primary" /> Public roles are limited to Buyer, Farmer, and Transporter.
          </div>
          <p className="mt-2">Admin access uses a separate login route and is not part of public registration.</p>
        </div>
        <Button size="lg" className="w-full" asChild>
          <Link href="/auth/role-selection">
            Continue <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </form>
    </AuthShell>
  );
}
