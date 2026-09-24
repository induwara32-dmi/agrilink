'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getOrder } from '@/lib/api/commerce';

export function OrderSuccess() {
  const orderId = useSearchParams().get('orderId');
  const order = useQuery({ queryKey: ['orders', orderId], queryFn: () => getOrder(orderId!), enabled: Boolean(orderId) });
  if (!orderId) return <EmptyState title="Order reference missing" description="Visit your orders to find a completed checkout." />;
  if (order.isLoading) return <LoadingSkeleton />;
  if (order.isError) return <ErrorState title="Order confirmation unavailable" description="Your order may have been placed, but its confirmation could not be loaded." actionHref="/orders" actionLabel="View orders" />;
  const item = order.data?.data;
  if (!item) return null;
  return <Card className="overflow-hidden border-border/80 bg-white"><CardContent className="space-y-6 pt-8 text-center text-sm text-slate-600">
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
      <span className="absolute left-1 top-3 h-3 w-3 rounded-full bg-warning" />
      <span className="absolute right-2 top-6 h-2.5 w-2.5 rotate-45 rounded-sm bg-secondary" />
      <span className="absolute bottom-4 left-3 h-2 w-2 rotate-12 rounded-sm bg-primary" />
      <span className="absolute bottom-2 right-4 h-3 w-3 rounded-full bg-success/70" />
      <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 rounded-sm bg-warning/80" />
      <span className="absolute right-0 top-2 h-2 w-2 rounded-full bg-primary/70" />
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10"><CheckCircle2 className="h-11 w-11 text-success" /></div>
    </div>
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Order confirmed!</h2>
      <p className="mt-2 text-slate-600">Thanks for your order — here&apos;s your confirmation.</p>
    </div>
    <p>Order number: <span className="font-semibold text-slate-900">{item.orderNumber}</span></p>
    <div className="space-y-2 text-left">{item.farmerOrders.map(group => <div key={group.id} className="rounded-2xl border border-border bg-slate-50 p-3"><p className="font-semibold text-slate-900">{group.farmer.farmName}</p><p>{group.farmerOrderNumber} · {group.deliveryMethod.replaceAll('_', ' ').toLowerCase()}</p></div>)}</div>
    <div className="flex flex-wrap justify-center gap-3"><Button asChild><Link href={`/orders/${item.id}`}>View order</Link></Button><Button asChild variant="outline"><Link href="/marketplace">Continue shopping</Link></Button></div>
  </CardContent></Card>;
}
