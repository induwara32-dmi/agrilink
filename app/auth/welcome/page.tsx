import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sprout, Truck } from 'lucide-react';
import { AuthShell } from '@/components/features/auth/auth-shell';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  return (
    <AuthShell
      title="Create your AgriLink account"
      description="Join a marketplace built for trusted agricultural trade, logistics coordination, and long-term growth."
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-slate-50 p-4 text-center">
            <ShoppingBag className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Buyer</p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-4 text-center">
            <Sprout className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Farmer</p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-4 text-center">
            <Truck className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Transporter</p>
          </div>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href="/auth/create-account">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg" className="w-full">
          <Link href="/auth/admin-login">Admin login</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
