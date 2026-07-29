import { Badge } from '@/components/ui/badge';
import type { OrderStatusCode } from '@/lib/api/commerce';

const labels: Record<OrderStatusCode, string> = { PENDING: 'Pending', CONFIRMED: 'Confirmed', PROCESSING: 'Processing', PARTIALLY_FULFILLED: 'Partially fulfilled', FULFILLED: 'Fulfilled', CANCELLED: 'Cancelled' };
export function OrderStatusBadge({ status }: { status: OrderStatusCode }) { const variant = status === 'FULFILLED' ? 'success' : status === 'CANCELLED' ? 'danger' : status === 'PROCESSING' ? 'warning' : 'outline'; return <Badge variant={variant}>{labels[status]}</Badge>; }
