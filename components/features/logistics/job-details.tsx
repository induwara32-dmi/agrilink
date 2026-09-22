'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, MapPin, Package, Phone, Route as RouteIcon, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ToastMessage } from '@/components/ui/toast-message';
import { ApiClientError } from '@/lib/api/client';
import { acceptTransportJob, getTransportJob, rejectTransportJob } from '@/lib/api/logistics';

function money(value: string, currency: string) { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value)); }

export function JobDetails({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; tone?: 'success' | 'error' } | null>(null);
  const job = useQuery({ queryKey: ['transport-jobs', jobId], queryFn: () => getTransportJob(jobId) });
  const accept = useMutation({
    mutationFn: () => acceptTransportJob(jobId),
    onSuccess: () => { setToast({ message: 'Job accepted.' }); router.push('/transporter'); },
    onError: error => setToast({ message: error instanceof ApiClientError ? error.message : 'Unable to accept this job.', tone: 'error' }),
  });
  const reject = useMutation({
    mutationFn: () => rejectTransportJob(jobId),
    onSuccess: () => { setToast({ message: 'Job rejected.' }); router.push('/transporter'); },
    onError: error => setToast({ message: error instanceof ApiClientError ? error.message : 'Unable to reject this job.', tone: 'error' }),
  });

  if (job.isLoading) return <LoadingSkeleton />;
  if (job.isError) return <ErrorState title="Job unavailable" description="We could not load this job. It may no longer be available to you." actionHref="/transporter" actionLabel="Back to dashboard" />;
  const item = job.data?.data;
  if (!item) return null;
  const farmerOrder = item.delivery.farmerOrder;
  const pending = item.status === 'ASSIGNED';
  const active = ['ACCEPTED', 'IN_PROGRESS'].includes(item.status);
  const deliveryLine = [farmerOrder.deliveryLine1, farmerOrder.deliveryLine2, farmerOrder.deliveryCity, farmerOrder.deliveryDistrict, farmerOrder.deliveryRegion, farmerOrder.deliveryCountryCode].filter(Boolean).join(', ');

  return <>
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card className="border-border/80 bg-white"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><CardTitle>{farmerOrder.order.orderNumber}</CardTitle><Badge variant={item.status === 'OPEN' ? 'outline' : item.status === 'ASSIGNED' ? 'warning' : item.status === 'REJECTED' || item.status === 'FAILED' || item.status === 'CANCELLED' ? 'danger' : 'success'}>{item.status.replaceAll('_', ' ')}</Badge></div></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>Farmer order: {farmerOrder.farmerOrderNumber}</p>
            {item.status === 'OPEN' ? <p className="text-slate-500">This job has not been assigned to a transporter yet.</p> : null}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Products</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {farmerOrder.items.map(orderItem => <div key={orderItem.id} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> {orderItem.productName}</div><span className="text-slate-600">{orderItem.quantity} {orderItem.unit}</span></div>)}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Pickup</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><span>{item.delivery.routePlan?.originLabel ?? farmerOrder.farmer.farmName}<span className="ml-2 text-xs text-slate-400">(exact pickup address is not yet configured for farmers)</span></span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><span>{farmerOrder.farmer.user.phone ?? 'Farmer phone not provided'}</span></div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><span>{item.delivery.routePlan?.destinationLabel ?? deliveryLine ?? 'Delivery address pending'}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><span>{farmerOrder.deliveryRecipientName ?? 'Buyer'} · {farmerOrder.deliveryRecipientPhone ?? 'Phone not provided'}</span></div>
            {farmerOrder.buyerNotes ? <p className="rounded-2xl bg-slate-50 p-3 text-xs">Notes: {farmerOrder.buyerNotes}</p> : null}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6">
        <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Fee &amp; distance</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Offered fee</span><span className="font-semibold text-slate-900">{money(item.offeredFee, item.currency)}</span></div>
            <div className="flex items-center gap-2"><RouteIcon className="h-4 w-4 text-primary" /><span>{item.delivery.routePlan?.distanceKm ? `${item.delivery.routePlan.distanceKm} km` : 'Distance not available yet'}</span></div>
            {item.requiredCapacity ? <p className="text-xs text-slate-500">Requires {item.requiredCapacity} {item.capacityUnit} of capacity</p> : null}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {pending ? <>
              <Button disabled={accept.isPending || reject.isPending} onClick={() => accept.mutate()}><CheckCircle2 className="mr-2 h-4 w-4" /> {accept.isPending ? 'Accepting…' : 'Accept job'}</Button>
              <Button variant="outline" disabled={accept.isPending || reject.isPending} onClick={() => reject.mutate()}><XCircle className="mr-2 h-4 w-4" /> {reject.isPending ? 'Rejecting…' : 'Reject job'}</Button>
            </> : null}
            {active ? <Button asChild><Link href={`/orders/${farmerOrder.order.id}/tracking`}>View tracking</Link></Button> : null}
            {!pending && !active ? <p className="text-sm text-slate-500">No actions available for this job right now.</p> : null}
          </CardContent>
        </Card>
      </aside>
    </div>
    {toast ? <ToastMessage {...toast} /> : null}
  </>;
}
