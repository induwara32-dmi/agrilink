import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableRow, ClickableRowList } from '@/components/ui/clickable-row';
import type { TransportJob } from '@/lib/api/logistics';

export function TransportJobList({ jobs }: { jobs: TransportJob[] }) {
  return (
    <Card className="border-border/80 bg-white">
      <CardHeader><CardTitle>Available and Assigned Jobs</CardTitle></CardHeader>
      <CardContent className="p-0">
        {jobs.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">No jobs are available for this period.</p>
        ) : (
          <ClickableRowList>
            {jobs.map(job => (
              <ClickableRow key={job.id} href={`/transport-jobs/${job.id}`}>
                <div>
                  <p className="font-semibold text-slate-900">{job.delivery.farmerOrder.order.orderNumber}</p>
                  <p className="text-slate-600">{job.delivery.routePlan ? `${job.delivery.routePlan.originLabel} to ${job.delivery.routePlan.destinationLabel}` : 'Route pending'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600">{job.status.replaceAll('_', ' ')}</span>
                  <span className="font-semibold text-slate-900">{new Intl.NumberFormat(undefined, { style: 'currency', currency: job.currency }).format(Number(job.offeredFee))}</span>
                </div>
              </ClickableRow>
            ))}
          </ClickableRowList>
        )}
      </CardContent>
    </Card>
  );
}
