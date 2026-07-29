'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Order placed</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-slate-600"><div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><CheckCircle2 className="h-5 w-5 text-success" /> Order confirmed</div><p>Order number: <span className="font-semibold text-slate-900">{item.orderNumber}</span></p><div className="space-y-2">{item.farmerOrders.map(group => <div key={group.id} className="rounded-2xl border border-border bg-slate-50 p-3"><p className="font-semibold text-slate-900">{group.farmer.farmName}</p><p>{group.farmerOrderNumber} · {group.deliveryMethod.replaceAll('_', ' ').toLowerCase()}</p></div>)}</div><div className="flex flex-wrap gap-3"><Button asChild><Link href={`/orders/${item.id}`}>View order</Link></Button><Button asChild variant="outline"><Link href="/marketplace">Continue shopping</Link></Button></div></CardContent></Card>;
}
