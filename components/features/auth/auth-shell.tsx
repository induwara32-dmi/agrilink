import Image from 'next/image';
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
    <div className="min-h-screen bg-[#f8fafc] lg:flex">
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <Image src="/images/farmer-field-2.jpg" alt="Smiling farmers standing together in a lush green field" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/10" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white">
            <span className="rounded-full bg-white/15 p-2 text-white backdrop-blur">
              <Leaf className="h-4 w-4" />
            </span>
            AgriLink
          </Link>
          <div className="max-w-md space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome to the new era of agricultural commerce.
            </h1>
            <p className="text-lg leading-8 text-white/85">
              Secure onboarding for buyers, farmers, and transporters with a premium experience built for trust and growth.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(46,125,50,0.12),_transparent_45%)] px-4 py-10 sm:px-6 lg:bg-none lg:px-12">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 lg:hidden">
            <span className="rounded-full bg-primary/10 p-2 text-primary">
              <Leaf className="h-4 w-4" />
            </span>
            AgriLink
          </Link>
          <Card className="border-border/80 bg-white/95 shadow-xl backdrop-blur">
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
    </div>
  );
}
