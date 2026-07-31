'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCircle2, ShoppingCart, Wallet } from 'lucide-react';
import { AnalyticsChart } from '@/components/features/dashboard/analytics-chart';
import { AnalyticsControls, comparisonLabel, moneyLabel, trendData } from '@/components/features/dashboard/analytics-controls';
import { DataTable } from '@/components/features/dashboard/data-table';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { BuyerRecentOrders } from '@/components/features/orders/buyer-order-widgets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { analyticsQueryKeys, getBuyerAnalytics, type AnalyticsQuery } from '@/lib/api/analytics';
import { listDeliveries } from '@/lib/api/logistics';
import { getUnreadCount, notificationQueryKeys } from '@/lib/api/notifications';
import { useAuth } from '@/providers/auth-provider';

export function BuyerDashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<AnalyticsQuery>({ period: 'month' });
  const enabled = period.period !== 'custom' || Boolean(period.from && period.to);
  const analytics = useQuery({ queryKey: analyticsQueryKeys.role('buyer', period), queryFn: () => getBuyerAnalytics(period), enabled });
  const deliveries = useQuery({ queryKey: ['deliveries', 'buyer-upcoming'], queryFn: () => listDeliveries(1, 5) });
  const unread = useQuery({ queryKey: notificationQueryKeys.unread(), queryFn: getUnreadCount });
  const report = analytics.data?.data;
  const statusCount = (status: string) => report?.current.orderHistorySummary.find(item => item.status === status)?.count ?? 0;
  return <div className="space-y-6"><section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Buyer analytics</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {user?.profile?.firstName ?? 'Buyer'}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Review your orders, spending, deliveries, and marketplace preferences.</p></section><AnalyticsControls query={period} onChange={setPeriod} />
  {!enabled ? <EmptyState title="Select a custom range" description="Choose both a start and end date to load analytics." /> : analytics.isLoading ? <LoadingSkeleton /> : analytics.isError ? <ErrorState title="Buyer analytics unavailable" description="We could not load your dashboard summary." onRetry={() => void analytics.refetch()} /> : report ? <>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KPICard title="Total Orders" value={String(report.current.dashboardSummary.orders)} change={comparisonLabel(report.comparison.orders.percentChange)} icon={<ShoppingCart className="h-5 w-5" />} /><KPICard title="Pending Orders" value={String(statusCount('PENDING'))} change="Current selected period" icon={<ShoppingCart className="h-5 w-5" />} /><KPICard title="Completed Orders" value={String(statusCount('FULFILLED'))} change="Current selected period" icon={<CheckCircle2 className="h-5 w-5" />} /><KPICard title="Total Spending" value={moneyLabel(report.current.dashboardSummary.spending)} change={report.comparison.spending.map(item => `${item.currency}: ${comparisonLabel(item.percentChange)}`).join(' · ') || 'No previous spending'} icon={<Wallet className="h-5 w-5" />} /></section>
    <section className="grid gap-6 xl:grid-cols-2">{report.current.dashboardSummary.spending.map(total => <AnalyticsChart key={total.currency} title={`Spending trend (${total.currency})`} data={trendData(report.current.spendingTrends, total.currency)} dataKey="value" color="#2E7D32" />)}{!report.current.dashboardSummary.spending.length ? <EmptyState title="No spending data" description="Spending trends will appear after completed checkouts." /> : null}<DataTable title="Favourite Categories" columns={['Category', 'Orders', 'Spending']} rows={report.current.favouriteCategories.map(item => ({ Category: item.categoryName, Orders: item.orders, Spending: item.spending }))} /></section>
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><BuyerRecentOrders /><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Upcoming Deliveries</CardTitle></CardHeader><CardContent className="space-y-3">{deliveries.isLoading ? <LoadingSkeleton /> : deliveries.isError ? <ErrorState title="Deliveries unavailable" description="Upcoming deliveries could not be loaded." onRetry={() => void deliveries.refetch()} /> : deliveries.data?.data.filter(item => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(item.status)).length ? deliveries.data.data.filter(item => !['DELIVERED', 'CANCELLED', 'FAILED'].includes(item.status)).map(item => <div key={item.id} className="rounded-2xl border border-border bg-slate-50 p-3 text-sm"><p className="font-semibold text-slate-900">{item.farmerOrder.farmer.farmName}</p><p className="mt-1 text-slate-600">{item.status.replaceAll('_', ' ')} · {item.estimatedDeliveryAt ? new Date(item.estimatedDeliveryAt).toLocaleString() : 'Scheduling pending'}</p></div>) : <EmptyState title="No upcoming deliveries" description="Active deliveries will appear here." />}</CardContent></Card></section>
    <Card className="border-border/80 bg-white"><CardHeader><CardTitle>Notifications</CardTitle></CardHeader><CardContent className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-slate-700"><Bell className="h-5 w-5 text-primary" /><span>{unread.data?.data.count ?? 0} unread notifications</span></div><Button asChild variant="outline"><Link href="/notifications">Open notification center</Link></Button></CardContent></Card>
  </> : null}</div>;
}

export default BuyerDashboardPage;
