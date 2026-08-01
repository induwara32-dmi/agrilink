import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleOptionProps {
  title: string;
  description: string;
  selected?: boolean;
  icon: React.ReactNode;
  onSelect?: () => void;
}

export function RoleOption({ title, description, selected = false, icon, onSelect }: RoleOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn('w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2', selected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-white')}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {selected ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        </div>
      </div>
    </button>
  );
}
