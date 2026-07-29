import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-[1.5rem] border border-dashed border-border bg-slate-50 p-8 text-center text-sm text-slate-600', className)}>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
