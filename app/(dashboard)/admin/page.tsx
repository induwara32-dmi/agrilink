'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, DollarSign, Truck, Users, Warehouse } from 'lucide-react';
import { AnalyticsChart } from '@/components/features/dashboard/analytics-chart';
import { AnalyticsControls, comparisonLabel, moneyLabel } from '@/components/features/dashboard/analytics-controls';
import { DataTable } from '@/components/features/dashboard/data-table';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { NotificationPanel } from '@/components/features/notifications/notification-panel';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { analyticsQueryKeys, getAdminAnalytics, type AnalyticsQuery } from '@/lib/api/analytics';

function aggregateByBucket(points: Array<{ bucket: string; count: number }>) {
  const totals = new Map<string, number>();
  points.forEach(point => totals.set(point.bucket, (totals.get(point.bucket) ?? 0) + point.count));
  return [...totals].map(([bucket, value]) => ({ name: new Date(bucket).toLocaleDateString(), value }));
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<AnalyticsQuery>({ period: 'month' });
  const enabled = period.period !== 'custom' || Boolean(period.from && period.to);
  const analytics = useQuery({ queryKey: analyticsQueryKeys.role('admin', period), queryFn: () => getAdminAnalytics(period), enabled });
  const report = analytics.data?.data;
  const pendingOrders = report?.current.orders.byStatus.filter(item => !['DELIVERED', 'CANCELLED'].includes(item.status)).reduce((sum, item) => sum + item.count, 0) ?? 0;

  return <div className="space-y-6">
    <section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Platform analytics</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin Dashboard</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Monitor marketplace growth, users, orders, revenue, products, and partner performance.</p></section>
    <AnalyticsControls query={period} onChange={setPeriod} />
    {!enabled ? <EmptyState title="Select a custom range" description="Choose both dates to load analytics." /> : analytics.isLoading ? <LoadingSkeleton /> : analytics.isError ? <ErrorState title="Platform analytics unavailable" description="We could not load the admin summary." onRetry={() => void analytics.refetch()} /> : report ? <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><KPICard title="Total Users" value={String(report.current.platformOverview.totalUsers)} change={comparisonLabel(report.comparison.newUsers.percentChange)} icon={<Users className="h-5 w-5" />} /><KPICard title="Active Farmers" value={String(report.current.platformOverview.activeFarmers)} change={`${report.current.platformOverview.pendingFarmers} awaiting approval`} icon={<Warehouse className="h-5 w-5" />} /><KPICard title="Active Transporters" value={String(report.current.platformOverview.activeTransporters)} change={`${report.current.platformOverview.pendingTransporters} awaiting approval`} icon={<Truck className="h-5 w-5" />} /><KPICard title="Pending Orders" value={String(pendingOrders)} change={`${report.current.orders.total} in selected period`} icon={<ClipboardList className="h-5 w-5" />} /><KPICard title="Platform Revenue" value={moneyLabel(report.current.platformOverview.revenue)} change={report.comparison.revenue.map(item => `${item.currency}: ${comparisonLabel(item.percentChange)}`).join(' / ') || 'No previous revenue'} icon={<DollarSign className="h-5 w-5" />} /></section>
      <section className="grid gap-6 xl:grid-cols-2"><AnalyticsChart title="User Growth" data={aggregateByBucket(report.current.userGrowth.trend)} dataKey="value" color="#F59E0B" /><AnalyticsChart title="Order Trend" data={aggregateByBucket(report.current.orders.trend)} dataKey="value" color="#2E7D32" /></section>
      <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Recent Registrations" columns={['Name', 'Email', 'Role', 'Registered']} rows={report.current.recentRegistrations.map(item => ({ Name: item.name, Email: item.email, Role: item.role, Registered: new Date(item.createdAt).toLocaleDateString() }))} /><DataTable title="Approval Summary" columns={['Partner type', 'Active', 'Pending']} rows={[{ 'Partner type': 'Farmers', Active: report.current.platformOverview.activeFarmers, Pending: report.current.platformOverview.pendingFarmers }, { 'Partner type': 'Transporters', Active: report.current.platformOverview.activeTransporters, Pending: report.current.platformOverview.pendingTransporters }]} /></section>
      <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Product Performance" columns={['Status', 'Products']} rows={report.current.products.byStatus.map(item => ({ Status: item.status.replaceAll('_', ' '), Products: item.count }))} /><DataTable title="Category Performance" columns={['Category', 'Orders', 'Revenue']} rows={report.current.categories.performance.map(item => ({ Category: item.categoryName, Orders: item.orders, Revenue: new Intl.NumberFormat(undefined, { style: 'currency', currency: item.currency }).format(Number(item.revenue)) }))} /></section>
      <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Farmer Performance" columns={['Farmer', 'Orders', 'Revenue']} rows={report.current.farmerPerformance.map(item => ({ Farmer: item.farmName, Orders: item.orders, Revenue: new Intl.NumberFormat(undefined, { style: 'currency', currency: item.currency }).format(Number(item.revenue)) }))} /><DataTable title="Transporter Performance" columns={['Transporter', 'Deliveries', 'Earnings']} rows={report.current.transporterPerformance.map(item => ({ Transporter: item.businessName ?? 'Independent transporter', Deliveries: item.deliveries, Earnings: new Intl.NumberFormat(undefined, { style: 'currency', currency: item.currency }).format(Number(item.earnings)) }))} /></section>
      <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Order Status" columns={['Status', 'Orders']} rows={report.current.orders.byStatus.map(item => ({ Status: item.status.replaceAll('_', ' '), Orders: item.count }))} /><div><NotificationPanel compact /></div></section>
    </> : null}
  </div>;
}
