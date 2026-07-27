import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KPIProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

export function KPICard({ title, value, change, icon }: KPIProps) {
  return (
    <Card className="border-border/80 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div>
        </div>
        <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-sm font-medium text-success">
          <ArrowUpRight className="h-4 w-4" /> {change}
        </div>
      </CardContent>
    </Card>
  );
}
