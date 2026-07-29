import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, MessageCircle, Package, Phone, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrderById } from '@/components/features/orders/order-data';
import { OrderStatusBadge } from '@/components/features/orders/order-status-badge';
import { OrderTimeline } from '@/components/features/orders/order-timeline';

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = getOrderById(orderId);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Order details</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{order.orderNumber}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <CardTitle>Order overview</CardTitle>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="font-semibold text-slate-900">Order date</p>
                  <p>{order.createdAt}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Estimated arrival</p>
                  <p>{order.eta}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Farmer</p>
                <p className="mt-2">{order.farmer.name}</p>
                <p>{order.farmer.location}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-slate-600">Qty {item.quantity} • {item.unitPrice}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{item.total}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Delivery timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline currentStatus={order.currentTimelineStatus} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Payment summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{order.paymentSummary.subtotal}</span></div>
              <div className="flex items-center justify-between"><span>Delivery</span><span>{order.paymentSummary.delivery}</span></div>
              <div className="flex items-center justify-between"><span>Discount</span><span>{order.paymentSummary.discount}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-slate-900"><span>Total</span><span>{order.paymentSummary.total}</span></div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Delivery details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> {order.deliveryMethod}</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {order.location}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {order.farmer.phone}</div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button><Download className="mr-2 h-4 w-4" /> Download invoice</Button>
              <Button variant="outline">Cancel order</Button>
              <Button asChild variant="outline">
                <Link href={`/orders/${order.id}/tracking`}>
                  <MessageCircle className="mr-2 h-4 w-4" /> Track delivery
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{order.notes}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
