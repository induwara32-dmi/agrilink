import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClickableRowList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={cn('divide-y divide-border', className)}>{children}</ul>;
}

export function ClickableRow({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <li>
      <Link href={href} className={cn('flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset', className)}>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">{children}</div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
      </Link>
    </li>
  );
}
