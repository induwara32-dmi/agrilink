'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableRow, ClickableRowList } from '@/components/ui/clickable-row';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { listTransportJobs, type JobStatusBucketCode } from '@/lib/api/logistics';

const statuses: Array<{ value?: JobStatusBucketCode; label: string }> = [{ label: 'All' }, { value: 'open', label: 'Open' }, { value: 'active', label: 'Active' }, { value: 'history', label: 'History' }];
const isBucket = (value: string | null): value is JobStatusBucketCode => value === 'open' || value === 'active' || value === 'history';

function TransportJobsContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<JobStatusBucketCode | undefined>(() => { const initial = searchParams.get('status'); return isBucket(initial) ? initial : undefined; });
  const [page, setPage] = useState(1);
  const jobs = useQuery({ queryKey: ['transport-jobs', 'list', { page, status }], queryFn: () => listTransportJobs(page, 10, status) });
  const items = jobs.data?.data ?? [];
  const meta = jobs.data?.meta;

  return <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Transport jobs</CardTitle></CardHeader><CardContent className="space-y-6">
    <div className="flex flex-wrap gap-2">{statuses.map(option => <button key={option.label} type="button" onClick={() => { setStatus(option.value); setPage(1); }} className={`rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${status === option.value ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-700'}`}>{option.label}</button>)}</div>
    {jobs.isLoading ? <LoadingSkeleton /> : jobs.isError ? <ErrorState title="Jobs unavailable" description="We could not load transport jobs." onRetry={() => void jobs.refetch()} /> : items.length ? <ClickableRowList>
      {items.map(job => <ClickableRow key={job.id} href={`/transport-jobs/${job.id}`}>
        <div>
          <p className="font-semibold text-slate-900">{job.delivery.farmerOrder.order.orderNumber}</p>
          <p className="text-slate-600">{job.delivery.routePlan ? `${job.delivery.routePlan.originLabel} to ${job.delivery.routePlan.destinationLabel}` : 'Route pending'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-600">{job.status.replaceAll('_', ' ')}</span>
          <span className="font-semibold text-slate-900">{new Intl.NumberFormat(undefined, { style: 'currency', currency: job.currency }).format(Number(job.offeredFee))}</span>
        </div>
      </ClickableRow>)}
    </ClickableRowList> : <EmptyState title="No jobs found" description="Try a different filter." />}
    {meta ? <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="text-sm text-slate-600">Showing {items.length} of {meta.total} jobs</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setPage(current => Math.max(current - 1, 1))} disabled={meta.page <= 1}>Prev</Button><span className="text-sm font-semibold text-slate-700">Page {meta.page} of {Math.max(meta.totalPages, 1)}</span><Button variant="outline" size="sm" onClick={() => setPage(current => current + 1)} disabled={meta.page >= meta.totalPages}>Next</Button></div></div> : null}
  </CardContent></Card>;
}

export default function TransportJobsPage() {
  return <ProtectedRoute role="TRANSPORTER"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Transport jobs</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Browse jobs</h1></div><Button asChild variant="outline"><Link href="/transporter"><ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard</Link></Button></div><TransportJobsContent /></main></ProtectedRoute>;
}
