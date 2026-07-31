'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin, Truck } from 'lucide-react';
import { OrderTimeline } from './order-timeline';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getOrder } from '@/lib/api/commerce';
import { getDelivery, type DeliveryTracking } from '@/lib/api/logistics';
import { DeliveryProofUpload } from '@/components/features/media/delivery-proof-upload';
import { useAuth } from '@/providers/auth-provider';

const terminal = new Set(['DELIVERED', 'CANCELLED', 'FAILED']);
export function OrderTracking({ orderId }: { orderId: string }) {
  const { user } = useAuth();
  const tracking = useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => { const order = (await getOrder(orderId)).data; const deliveries = await Promise.all(order.farmerOrders.flatMap(group => group.delivery ? [getDelivery(group.delivery.id).then(response => response.data)] : [])); return { order, deliveries }; },
    refetchInterval: query => query.state.data?.deliveries.every(delivery => terminal.has(delivery.status)) ? false : 30_000,
  });
  if (tracking.isLoading) return <LoadingSkeleton />;
  if (tracking.isError) return <ErrorState title="Tracking unavailable" description="We could not load the delivery timeline." onRetry={() => void tracking.refetch()} />;
  const data = tracking.data;
  if (!data?.deliveries.length) return <EmptyState title="Tracking not available" description="Delivery records have not been created for this order." />;
  const canUploadProof = user?.role === 'FARMER' || user?.role === 'TRANSPORTER';
  return <div className="space-y-6">{data.deliveries.map(delivery => <DeliveryPanel key={delivery.id} delivery={delivery} />)}{canUploadProof ? data.deliveries.filter(delivery => ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(delivery.status)).map(delivery => <Card key={`proof-${delivery.id}`} className="border-border/80 bg-white"><CardHeader><CardTitle>Proof of delivery · {delivery.farmerOrder.farmerOrderNumber}</CardTitle></CardHeader><CardContent><DeliveryProofUpload deliveryId={delivery.id} proofUrl={delivery.proofUrl} onUploaded={() => void tracking.refetch()} /></CardContent></Card>) : null}</div>;
}

function DeliveryPanel({ delivery }: { delivery: DeliveryTracking }) {
  const eta = delivery.estimatedDeliveryAt ? new Date(delivery.estimatedDeliveryAt).toLocaleString() : 'Pending scheduling';
  const method = delivery.method.replaceAll('_', ' ').toLowerCase();
  const vehicle = delivery.transportJob?.vehicle ?? delivery.vehicle;
  return <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"><div className="space-y-6"><Card className="border-border/80 bg-white"><CardHeader><CardTitle>{delivery.farmerOrder.farmerOrderNumber}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">{delivery.status.replaceAll('_', ' ')}</p><p className="mt-2 text-2xl font-semibold capitalize text-slate-900">{method}</p><p className="mt-2 text-sm text-slate-600">Estimated arrival: {eta}</p></div><MethodDetails delivery={delivery} /></CardContent></Card><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Delivery timeline</CardTitle></CardHeader><CardContent>{delivery.statusHistory.length ? <OrderTimeline history={delivery.statusHistory} /> : <EmptyState title="No tracking events yet" description="Updates will appear after fulfillment begins." />}</CardContent></Card></div>
  <aside className="space-y-6"><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Route details</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><span>Pickup: {delivery.routePlan?.originLabel ?? delivery.farmerOrder.farmer.farmName}</span></div><div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><span>Destination: {delivery.routePlan?.destinationLabel ?? ([delivery.farmerOrder.deliveryLine1, delivery.farmerOrder.deliveryCity].filter(Boolean).join(', ') || 'Pickup at farmer')}</span></div><div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-primary" /><span>Expected handoff: {eta}</span></div></CardContent></Card><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Fulfillment contact</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><p className="font-semibold text-slate-900">{delivery.farmerOrder.farmer.farmName}</p>{delivery.transportJob?.transporter ? <p>Transporter: {delivery.transportJob.transporter.businessName ?? 'Assigned platform transporter'}</p> : null}{vehicle ? <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {vehicle.registrationNumber} · {vehicle.type.replaceAll('_', ' ').toLowerCase()}</div> : null}</CardContent></Card><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Delivery instructions</CardTitle></CardHeader><CardContent className="text-sm text-slate-600"><p>{delivery.farmerOrder.buyerNotes ?? 'No delivery instructions provided.'}</p></CardContent></Card></aside></div>;
}

function MethodDetails({ delivery }: { delivery: DeliveryTracking }) {
  if (delivery.method === 'BUYER_PICKUP') return <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-900">Pickup details</p><p>Location: {delivery.routePlan?.originLabel ?? delivery.farmerOrder.farmer.farmName}</p><p>Pickup time: {delivery.scheduledPickupAt ? new Date(delivery.scheduledPickupAt).toLocaleString() : 'Awaiting schedule'}</p><Badge variant={delivery.status === 'READY_FOR_PICKUP' ? 'success' : 'outline'}>{delivery.status.replaceAll('_', ' ')}</Badge></div>;
  if (delivery.method === 'PLATFORM_TRANSPORTER') return <div className="space-y-2 rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-900">Platform transporter</p><p>{delivery.transportJob?.transporter?.businessName ?? 'Assignment pending'}</p><p>{delivery.transportJob?.vehicle ? `${delivery.transportJob.vehicle.registrationNumber} · ${delivery.transportJob.vehicle.type.replaceAll('_', ' ')}` : 'Vehicle pending'}</p></div>;
  return <div className="space-y-2 rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600"><p className="font-semibold text-slate-900">Farmer delivery</p><p>{delivery.farmerOrder.farmer.farmName}</p><p>ETA: {delivery.estimatedDeliveryAt ? new Date(delivery.estimatedDeliveryAt).toLocaleString() : 'Awaiting schedule'}</p></div>;
}
