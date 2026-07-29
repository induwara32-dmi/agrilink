import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      <div className="h-24 rounded-2xl border border-border bg-slate-100" />
      <div className="h-20 rounded-2xl border border-border bg-slate-100" />
      <div className="h-20 rounded-2xl border border-border bg-slate-100" />
    </div>
  );
}
