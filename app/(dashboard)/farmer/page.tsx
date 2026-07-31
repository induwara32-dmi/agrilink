'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Leaf, Package, ShoppingCart, Wallet } from 'lucide-react';
import { AnalyticsChart } from '@/components/features/dashboard/analytics-chart';
import { AnalyticsControls, comparisonLabel, moneyLabel, trendData } from '@/components/features/dashboard/analytics-controls';
import { DataTable } from '@/components/features/dashboard/data-table';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { analyticsQueryKeys, getFarmerAnalytics, type AnalyticsQuery } from '@/lib/api/analytics';
import { listOrders } from '@/lib/api/commerce';
import { listDeliveries } from '@/lib/api/logistics';
import { useAuth } from '@/providers/auth-provider';

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<AnalyticsQuery>({ period: 'month' });
  const enabled = period.period !== 'custom' || Boolean(period.from && period.to);
  const analytics = useQuery({ queryKey: analyticsQueryKeys.role('farmer', period), queryFn: () => getFarmerAnalytics(period), enabled });
  const orders = useQuery({ queryKey: ['orders', 'farmer-recent'], queryFn: () => listOrders({ page: 1, pageSize: 5 }) });
  const deliveries = useQuery({ queryKey: ['deliveries', 'farmer-recent'], queryFn: () => listDeliveries(1, 5) });
  const report = analytics.data?.data;
  const activeOrders = report?.current.orderStatusDistribution.filter(item => !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(item.status)).reduce((sum, item) => sum + item.count, 0) ?? 0;
  return <div className="space-y-6"><section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Farmer analytics</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {user?.profile?.firstName ?? 'Farmer'}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Monitor products, inventory, sales, revenue, orders, and deliveries.</p></section><AnalyticsControls query={period} onChange={setPeriod} />
  {!enabled ? <EmptyState title="Select a custom range" description="Choose both dates to load analytics." /> : analytics.isLoading ? <LoadingSkeleton /> : analytics.isError ? <ErrorState title="Farmer analytics unavailable" description="We could not load farm performance." onRetry={() => void analytics.refetch()} /> : report ? <>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KPICard title="Total Products" value={String(report.snapshot.productSummary.total)} change={`${report.snapshot.productSummary.active} active listings`} icon={<Package className="h-5 w-5" />} /><KPICard title="Active Orders" value={String(activeOrders)} change="Selected period" icon={<ShoppingCart className="h-5 w-5" />} /><KPICard title="Monthly Revenue" value={moneyLabel(report.current.revenue)} change={report.comparison.revenue.map(item => `${item.currency}: ${comparisonLabel(item.percentChange)}`).join(' · ') || 'No previous revenue'} icon={<Wallet className="h-5 w-5" />} /><KPICard title="Inventory Stock" value={report.snapshot.inventoryStock.map(item => `${item.quantity} ${item.unit}`).join(' · ') || '—'} change="Available, grouped by unit" icon={<Leaf className="h-5 w-5" />} /></section>
    <section className="grid gap-6 xl:grid-cols-2">{report.current.revenue.map(total => <AnalyticsChart key={total.currency} title={`Revenue trend (${total.currency})`} data={trendData(report.current.salesTrends, total.currency)} dataKey="value" color="#4F46E5" />)}<AnalyticsChart title="Sales trend (orders)" data={report.current.salesTrends.map(point => ({ name: new Date(point.bucket).toLocaleDateString(), value: point.count }))} dataKey="value" color="#2E7D32" /></section>
    <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Top Products" columns={['Product', 'Quantity', 'Orders', 'Revenue']} rows={report.current.topProducts.map(item => ({ Product: item.productName, Quantity: `${item.quantity} ${item.unit}`, Orders: item.orders, Revenue: new Intl.NumberFormat(undefined, { style: 'currency', currency: item.currency }).format(Number(item.revenue)) }))} /><DataTable title="Order Status Distribution" columns={['Status', 'Count']} rows={report.current.orderStatusDistribution.map(item => ({ Status: item.status.replaceAll('_', ' '), Count: item.count }))} /></section>
    <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Low Stock Summary</CardTitle></CardHeader><CardContent className="space-y-3">{report.snapshot.lowStockSummary.products.length ? report.snapshot.lowStockSummary.products.map(item => <div key={item.productId} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm"><p className="font-semibold text-slate-900">{item.productName}</p><p className="text-slate-600">{item.available} available · reorder at {item.reorderLevel}</p></div>) : <EmptyState title="No low-stock products" description="Inventory is above configured reorder levels." />}</CardContent></Card><DataTable title="Inventory Turnover" columns={['Product', 'Sold', 'Average Inventory', 'Turnover']} rows={report.current.inventoryTurnover.map(item => ({ Product: item.productName, Sold: `${item.soldQuantity} ${item.unit}`, 'Average Inventory': item.averageInventory, Turnover: item.turnover }))} /></section>
    <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Recent Orders" columns={['Order', 'Created', 'Status', 'Groups']} rows={(orders.data?.data ?? []).map(item => ({ Order: item.orderNumber, Created: new Date(item.createdAt).toLocaleDateString(), Status: item.status.replaceAll('_', ' '), Groups: item.farmerOrders.length }))} /><DataTable title="Recent Deliveries" columns={['Order', 'Method', 'Status', 'ETA']} rows={(deliveries.data?.data ?? []).map(item => ({ Order: item.farmerOrder.order.orderNumber, Method: item.method.replaceAll('_', ' '), Status: item.status.replaceAll('_', ' '), ETA: item.estimatedDeliveryAt ? new Date(item.estimatedDeliveryAt).toLocaleString() : 'Pending' }))} /></section>
  </> : null}</div>;
}
