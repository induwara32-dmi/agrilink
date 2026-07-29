'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, MessageCircle, Package, Truck } from 'lucide-react';
import { OrderStatusBadge } from './order-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ToastMessage } from '@/components/ui/toast-message';
import { ApiClientError } from '@/lib/api/client';
import { cancelOrder, getOrder } from '@/lib/api/commerce';

function money(value: string, currency: string) { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value)); }
export function OrderDetails({ orderId }: { orderId: string }) {
  const client = useQueryClient();
  const [toast, setToast] = useState<{ message: string; tone?: 'success' | 'error' } | null>(null);
  const order = useQuery({ queryKey: ['orders', orderId], queryFn: () => getOrder(orderId) });
  const cancel = useMutation({ mutationFn: () => cancelOrder(orderId), onSuccess: response => { client.setQueryData(['orders', orderId], response); void client.invalidateQueries({ queryKey: ['orders'] }); setToast({ message: 'Order cancelled and inventory reservations released.' }); }, onError: error => setToast({ message: error instanceof ApiClientError ? error.message : 'Unable to cancel this order.', tone: 'error' }) });
  if (order.isLoading) return <LoadingSkeleton />;
  if (order.isError) return <ErrorState title="Order unavailable" description="We could not load this order." actionHref="/orders" actionLabel="Back to orders" />;
  const item = order.data?.data;
  if (!item) return null;
  const cancellable = item.status === 'PENDING' && item.payment?.status === 'PENDING' && item.farmerOrders.every(group => group.status === 'PENDING');
  return <><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><div className="space-y-6"><Card className="border-border/80 bg-white"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><CardTitle>Order overview</CardTitle><OrderStatusBadge status={item.status} /></div></CardHeader><CardContent className="space-y-4 text-sm text-slate-600"><div className="grid gap-4 md:grid-cols-2"><div><p className="font-semibold text-slate-900">Order date</p><p>{new Date(item.createdAt).toLocaleString()}</p></div><div><p className="font-semibold text-slate-900">Farmer groups</p><p>{item.farmerOrders.length}</p></div></div></CardContent></Card>
  {item.farmerOrders.map(group => <Card key={group.id} className="border-border/80 bg-white"><CardHeader><CardTitle>{group.farmer.farmName} · {group.farmerOrderNumber}</CardTitle></CardHeader><CardContent className="space-y-3">{group.items.map(orderItem => <div key={orderItem.id} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm"><div><p className="font-semibold text-slate-900">{orderItem.productName}</p><p className="text-slate-600">Qty {orderItem.quantity} {orderItem.unit} · {money(orderItem.unitPrice, item.currency)}</p></div><p className="font-semibold text-slate-900">{money(orderItem.lineTotal, item.currency)}</p></div>)}</CardContent></Card>)}</div>
  <aside className="space-y-6"><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Payment summary</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><div className="flex justify-between"><span>Subtotal</span><span>{money(item.subtotal, item.currency)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{money(item.deliveryFee, item.currency)}</span></div><div className="flex justify-between"><span>Discount</span><span>-{money(item.discountTotal, item.currency)}</span></div><div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-slate-900"><span>Total</span><span>{money(item.grandTotal, item.currency)}</span></div></CardContent></Card>
  <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Delivery details</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600">{item.farmerOrders.map(group => <div key={group.id} className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> {group.deliveryMethod.replaceAll('_', ' ').toLowerCase()}</div><div className="mt-2 flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {group.deliveryCity ?? group.farmer.farmName}</div></div>)}</CardContent></Card>
  <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Actions</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2"><Button onClick={() => setToast({ message: 'Invoice downloads will be available when the invoice backend is implemented.' })}><Download className="mr-2 h-4 w-4" /> Download invoice</Button><Button variant="outline" disabled={!cancellable || cancel.isPending} onClick={() => cancel.mutate()}>{cancel.isPending ? 'Cancelling…' : 'Cancel order'}</Button><Button asChild variant="outline"><Link href={`/orders/${item.id}/tracking`}><MessageCircle className="mr-2 h-4 w-4" /> Track delivery</Link></Button></CardContent></Card></aside></div>{toast ? <ToastMessage {...toast} /> : null}</>;
}
