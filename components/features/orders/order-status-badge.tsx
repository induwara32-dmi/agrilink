import { Badge } from '@/components/ui/badge';
import { getStatusVariant, type OrderStatus } from '@/components/features/orders/order-data';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
}
