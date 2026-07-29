'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { DataTable } from '@/components/features/dashboard/data-table';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { listOrders } from '@/lib/api/commerce';

export function BuyerOrderStats() {
  const pending = useQuery({ queryKey: ['orders', 'stats', 'pending'], queryFn: () => listOrders({ page: 1, pageSize: 1, status: 'PENDING' }) });
  const fulfilled = useQuery({ queryKey: ['orders', 'stats', 'fulfilled'], queryFn: () => listOrders({ page: 1, pageSize: 1, status: 'FULFILLED' }) });
  return <><KPICard title="Pending Orders" value={pending.isLoading ? '…' : String(pending.data?.meta?.total ?? 0)} change="Live order count" icon={<ShoppingCart className="h-5 w-5" />} /><KPICard title="Completed Orders" value={fulfilled.isLoading ? '…' : String(fulfilled.data?.meta?.total ?? 0)} change="Live fulfilled count" icon={<CheckCircle2 className="h-5 w-5" />} /></>;
}

export function BuyerRecentOrders() {
  const orders = useQuery({ queryKey: ['orders', 'dashboard-recent'], queryFn: () => listOrders({ page: 1, pageSize: 5 }) });
  if (orders.isLoading) return <LoadingSkeleton />;
  if (orders.isError) return <ErrorState title="Recent orders unavailable" description="We could not load recent orders." onRetry={() => void orders.refetch()} />;
  const rows = (orders.data?.data ?? []).map(order => ({ order: order.orderNumber, farmers: order.farmerOrders.map(group => group.farmer.farmName).join(', '), date: new Date(order.createdAt).toLocaleDateString(), status: order.status.replaceAll('_', ' ').toLowerCase() }));
  return rows.length ? <DataTable title="Recent Orders" columns={['Order', 'Farmers', 'Date', 'Status']} rows={rows} /> : <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader><CardContent><EmptyState title="No orders yet" description="Completed checkouts will appear here." /></CardContent></Card>;
}

export function BuyerOrderTrackingShortcut() { return <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Order tracking</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-slate-600">Open an active order to see its live backend delivery timeline.</p><Button asChild><Link href="/orders">View orders</Link></Button></CardContent></Card>; }
