import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStatusBadge } from '@/components/features/orders/order-status-badge';
import type { OrderRecord } from '@/components/features/orders/order-data';

export function OrderCard({ order }: { order: OrderRecord }) {
  return (
    <Card className="border-border/80 bg-white">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">{order.orderNumber}</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{order.farmer.name}</h3>
            <p className="text-sm text-slate-600">Placed {order.createdAt} • {order.deliveryMethod}</p>
            <p className="text-sm text-slate-600">{order.location}</p>
          </div>
          <div className="space-y-3 lg:min-w-[180px]">
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-xl font-semibold text-slate-900">{order.total}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/orders/${order.id}`}>View details</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/orders/${order.id}/tracking`}>Track order <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
