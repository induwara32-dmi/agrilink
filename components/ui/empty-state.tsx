import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-[1.5rem] border border-dashed border-border bg-slate-50 p-8 text-center text-sm text-slate-600', className)}>
      {icon ? <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:h-7 [&_svg]:w-7">{icon}</div> : null}
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
