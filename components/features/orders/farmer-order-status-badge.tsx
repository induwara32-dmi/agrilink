import { Badge } from '@/components/ui/badge';
import type { FarmerOrderStatusCode } from '@/lib/api/commerce';

const labels: Record<FarmerOrderStatusCode, string> = { PENDING: 'Pending', ACCEPTED: 'Accepted', PREPARING: 'Preparing', READY_FOR_PICKUP: 'Ready for pickup', IN_TRANSIT: 'In transit', DELIVERED: 'Delivered', REJECTED: 'Rejected', CANCELLED: 'Cancelled' };
export function FarmerOrderStatusBadge({ status }: { status: FarmerOrderStatusCode }) { const variant = status === 'DELIVERED' ? 'success' : status === 'REJECTED' || status === 'CANCELLED' ? 'danger' : status === 'PENDING' ? 'outline' : 'warning'; return <Badge variant={variant}>{labels[status]}</Badge>; }
