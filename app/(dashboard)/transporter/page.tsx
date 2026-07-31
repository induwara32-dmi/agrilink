'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, PackageCheck, Route, Wallet } from 'lucide-react';
import { AnalyticsChart } from '@/components/features/dashboard/analytics-chart';
import { AnalyticsControls, comparisonLabel, moneyLabel, trendData } from '@/components/features/dashboard/analytics-controls';
import { DataTable } from '@/components/features/dashboard/data-table';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { analyticsQueryKeys, getTransporterAnalytics, type AnalyticsQuery } from '@/lib/api/analytics';
import { listTransportJobs, listVehicles } from '@/lib/api/logistics';
import { useAuth } from '@/providers/auth-provider';

export default function TransporterDashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<AnalyticsQuery>({ period: 'month' });
  const enabled = period.period !== 'custom' || Boolean(period.from && period.to);
  const analytics = useQuery({ queryKey: analyticsQueryKeys.role('transporter', period), queryFn: () => getTransporterAnalytics(period), enabled });
  const jobs = useQuery({ queryKey: ['transport-jobs', 'dashboard'], queryFn: () => listTransportJobs(1, 5) });
  const vehicles = useQuery({ queryKey: ['vehicles', 'dashboard'], queryFn: () => listVehicles(1, 10) });
  const report = analytics.data?.data;

  return <div className="space-y-6">
    <section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Transport analytics</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {user?.profile?.firstName ?? 'Transporter'}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Track available work, delivery performance, earnings, and vehicle readiness.</p></section>
    <AnalyticsControls query={period} onChange={setPeriod} />
    {!enabled ? <EmptyState title="Select a custom range" description="Choose both dates to load analytics." /> : analytics.isLoading ? <LoadingSkeleton /> : analytics.isError ? <ErrorState title="Transport analytics unavailable" description="We could not load delivery performance." onRetry={() => void analytics.refetch()} /> : report ? <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KPICard title="Available Jobs" value={String(report.current.availableJobs)} change="Currently open" icon={<Route className="h-5 w-5" />} /><KPICard title="Accepted Deliveries" value={String(report.current.acceptedDeliveries)} change="Accepted or in progress" icon={<PackageCheck className="h-5 w-5" />} /><KPICard title="Completed Deliveries" value={String(report.current.deliveriesCompleted)} change={comparisonLabel(report.comparison.deliveriesCompleted.percentChange)} icon={<CheckCircle2 className="h-5 w-5" />} /><KPICard title="Earnings" value={moneyLabel(report.current.earnings)} change={report.comparison.earnings.map(item => `${item.currency}: ${comparisonLabel(item.percentChange)}`).join(' / ') || 'No previous earnings'} icon={<Wallet className="h-5 w-5" />} /></section>
      <section className="grid gap-6 xl:grid-cols-2"><AnalyticsChart title="Delivery trend" data={report.current.deliveryTrends.map(point => ({ name: new Date(point.bucket).toLocaleDateString(), value: point.count }))} dataKey="value" color="#2E7D32" />{report.current.earnings.map(total => <AnalyticsChart key={total.currency} title={`Earnings trend (${total.currency})`} data={trendData(report.current.deliveryTrends, total.currency)} dataKey="value" color="#4F46E5" />)}</section>
      <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Delivery Performance" columns={['Metric', 'Value', 'Comparison']} rows={[{ Metric: 'Acceptance rate', Value: `${report.current.acceptanceRate}%`, Comparison: comparisonLabel(report.comparison.acceptanceRate.percentChange) }, { Metric: 'Completion rate', Value: `${report.current.completionRate}%`, Comparison: comparisonLabel(report.comparison.completionRate.percentChange) }]} /><DataTable title="Delivery Status Distribution" columns={['Status', 'Count']} rows={report.current.deliveryStatusDistribution.map(item => ({ Status: item.status.replaceAll('_', ' '), Count: item.count }))} /></section>
      <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Available and Assigned Jobs" columns={['Order', 'Route', 'Status', 'Fee']} rows={(jobs.data?.data ?? []).map(job => ({ Order: job.delivery.farmerOrder.order.orderNumber, Route: job.delivery.routePlan ? `${job.delivery.routePlan.originLabel} to ${job.delivery.routePlan.destinationLabel}` : 'Route pending', Status: job.status.replaceAll('_', ' '), Fee: new Intl.NumberFormat(undefined, { style: 'currency', currency: job.currency }).format(Number(job.offeredFee)) }))} /><DataTable title="Vehicle Status" columns={['Registration', 'Type', 'Capacity', 'Status']} rows={(vehicles.data?.data ?? []).map(vehicle => ({ Registration: vehicle.registrationNumber, Type: vehicle.type.replaceAll('_', ' '), Capacity: vehicle.capacity && vehicle.capacityUnit ? `${vehicle.capacity} ${vehicle.capacityUnit}` : 'Not specified', Status: vehicle.isActive && vehicle.isAvailable ? 'AVAILABLE' : vehicle.isActive ? 'BUSY' : 'INACTIVE' }))} /></section>
      {(jobs.isError || vehicles.isError) && <ErrorState title="Operational data unavailable" description="Some jobs or vehicle details could not be loaded." onRetry={() => { void jobs.refetch(); void vehicles.refetch(); }} />}
      {jobs.isLoading || vehicles.isLoading ? <LoadingSkeleton /> : null}
    </> : null}
  </div>;
}
