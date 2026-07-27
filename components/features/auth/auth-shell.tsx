import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(46,125,50,0.12),_transparent_45%),#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-5 lg:pr-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="rounded-full bg-primary/10 p-2 text-primary">
              <Leaf className="h-4 w-4" />
            </span>
            AgriLink
          </Link>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Welcome to the new era of agricultural commerce.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Secure onboarding for buyers, farmers, and transporters with a premium experience built for trust and growth.
            </p>
          </div>
        </div>

        <Card className="w-full max-w-lg border-border/80 bg-white/95 shadow-xl backdrop-blur">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
              <p className="text-sm leading-7 text-slate-600">{description}</p>
            </div>
            {children}
            {footer ? <div className="mt-6 text-sm text-slate-600">{footer}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
