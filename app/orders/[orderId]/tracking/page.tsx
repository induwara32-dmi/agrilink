import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, Phone, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrderById } from '@/components/features/orders/order-data';
import { OrderTimeline } from '@/components/features/orders/order-timeline';

export default async function OrderTrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = getOrderById(orderId);
  if (!order) notFound();

  const renderMethodDetails = () => {
    if (order.deliveryMethod === 'Buyer Pickup') {
      return (
        <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Pickup details</p>
          <p>Pickup location: {order.location}</p>
          <p>Pickup date: {order.pickupDate}</p>
          <p>Pickup time: {order.pickupTime}</p>
          <p>Verification code: {order.pickupCode}</p>
          <Badge variant="success">Ready for pickup</Badge>
        </div>
      );
    }

    if (order.deliveryMethod === 'Platform Transporter') {
      return (
        <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Platform transporter</p>
          <p>Assigned transporter: {order.transporter?.name}</p>
          <p>Driver: {order.driver?.name}</p>
          <p>Vehicle: {order.driver?.vehicleNumber} • {order.driver?.vehicleType}</p>
          <p>Route: Northern corridor • live tracking placeholder</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Farmer delivery</p>
        <p>Driver: {order.driver?.name}</p>
        <p>Vehicle: {order.driver?.vehicleNumber} • {order.driver?.vehicleType}</p>
        <p>ETA: {order.eta}</p>
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Tracking</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{order.orderNumber}</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Current delivery status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">{order.status}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{order.currentTimelineStatus}</p>
                <p className="mt-2 text-sm text-slate-600">Estimated arrival: {order.eta}</p>
              </div>
              <div className="rounded-[1.5rem] border border-dashed border-border bg-slate-50 p-6 text-center text-sm text-slate-600">
                <MapPin className="mx-auto mb-3 h-5 w-5 text-primary" />
                Responsive map placeholder for live convoy movement
              </div>
              {renderMethodDetails()}
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
              <CardTitle>Route details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> <span>Pickup: {order.farmer.location}</span></div>
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> <span>Destination: {order.location}</span></div>
              <div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-primary" /> <span>Expected handoff: {order.eta}</span></div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Contact & support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {order.farmer.phone}</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {order.driver?.name}</div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline"><MessageCircle className="mr-2 h-4 w-4" /> Contact farmer</Button>
                <Button><Phone className="mr-2 h-4 w-4" /> Call driver</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Delivery instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              <p>{order.notes}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Proof of delivery</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              {order.proofOfDelivery ? <p>{order.proofOfDelivery}</p> : <p>No proof of delivery uploaded yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
