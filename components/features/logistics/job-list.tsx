import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransportJob } from '@/lib/api/logistics';

export function TransportJobList({ jobs }: { jobs: TransportJob[] }) {
  return (
    <Card className="border-border/80 bg-white">
      <CardHeader><CardTitle>Available and Assigned Jobs</CardTitle></CardHeader>
      <CardContent className="p-0">
        {jobs.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">No jobs are available for this period.</p>
        ) : (
          <ul className="divide-y divide-border">
            {jobs.map(job => (
              <li key={job.id}>
                <Link href={`/transport-jobs/${job.id}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
                  <div>
                    <p className="font-semibold text-slate-900">{job.delivery.farmerOrder.order.orderNumber}</p>
                    <p className="text-slate-600">{job.delivery.routePlan ? `${job.delivery.routePlan.originLabel} to ${job.delivery.routePlan.destinationLabel}` : 'Route pending'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">{job.status.replaceAll('_', ' ')}</span>
                    <span className="font-semibold text-slate-900">{new Intl.NumberFormat(undefined, { style: 'currency', currency: job.currency }).format(Number(job.offeredFee))}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
