'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, PackageCheck, Route, Wallet } from 'lucide-react';
import { AnalyticsChart } from '@/components/features/dashboard/analytics-chart';
import { AnalyticsControls, comparisonLabel, moneyLabel, trendData } from '@/components/features/dashboard/analytics-controls';
import { DataTable } from '@/components/features/dashboard/data-table';
import { KPICard } from '@/components/features/dashboard/kpi-card';
import { TransportJobList } from '@/components/features/logistics/job-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickableRow, ClickableRowList } from '@/components/ui/clickable-row';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { analyticsQueryKeys, getTransporterAnalytics, type AnalyticsQuery } from '@/lib/api/analytics';
import { listTransportJobs, listVehicles } from '@/lib/api/logistics';
import { useAuth } from '@/providers/auth-provider';

export default function TransporterDashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const highlightEarnings = searchParams.get('view') === 'earnings';
  const earningsRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<AnalyticsQuery>({ period: 'month' });
  const enabled = period.period !== 'custom' || Boolean(period.from && period.to);
  const analytics = useQuery({ queryKey: analyticsQueryKeys.role('transporter', period), queryFn: () => getTransporterAnalytics(period), enabled });
  const jobs = useQuery({ queryKey: ['transport-jobs', 'dashboard'], queryFn: () => listTransportJobs(1, 5) });
  const vehicles = useQuery({ queryKey: ['vehicles', 'dashboard'], queryFn: () => listVehicles(1, 10) });
  const report = analytics.data?.data;

  useEffect(() => {
    if (highlightEarnings && report) earningsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightEarnings, report]);

  return <div className="space-y-6">
    <section className="rounded-[2rem] border border-border bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-sm">
      <div className="flex items-center justify-between gap-6">
        <div><p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Transport analytics</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {user?.profile?.firstName ?? 'Transporter'}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">Track available work, delivery performance, earnings, and vehicle readiness.</p></div>
        <div className="hidden shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 shadow-lg md:block"><Image src="/images/delivery-handoff.jpg" alt="A transporter handing off crates of fresh produce" width={236} height={157} className="h-auto w-[220px] object-cover" /></div>
      </div>
    </section>
    <AnalyticsControls query={period} onChange={setPeriod} />
    {!enabled ? <EmptyState title="Select a custom range" description="Choose both dates to load analytics." /> : analytics.isLoading ? <LoadingSkeleton /> : analytics.isError ? <ErrorState title="Transport analytics unavailable" description="We could not load delivery performance." onRetry={() => void analytics.refetch()} /> : report ? <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KPICard title="Open Jobs" value={String(report.current.availableJobs)} change="Currently open" icon={<Route className="h-5 w-5" />} /><KPICard title="Accepted Deliveries" value={String(report.current.acceptedDeliveries)} change="Accepted or in progress" icon={<PackageCheck className="h-5 w-5" />} /><KPICard title="Completed Deliveries" value={String(report.current.deliveriesCompleted)} change={comparisonLabel(report.comparison.deliveriesCompleted.percentChange)} icon={<CheckCircle2 className="h-5 w-5" />} /><div ref={earningsRef} className={`rounded-2xl transition ${highlightEarnings ? 'ring-2 ring-primary ring-offset-2' : ''}`}><KPICard title="Earnings" value={moneyLabel(report.current.earnings)} change={report.comparison.earnings.map(item => `${item.currency}: ${comparisonLabel(item.percentChange)}`).join(' / ') || 'No previous earnings'} icon={<Wallet className="h-5 w-5" />} /></div></section>
      <section className="grid gap-6 xl:grid-cols-2"><AnalyticsChart title="Delivery trend" data={report.current.deliveryTrends.map(point => ({ name: new Date(point.bucket).toLocaleDateString(), value: point.count }))} dataKey="value" color="#2E7D32" />{report.current.earnings.map(total => <AnalyticsChart key={total.currency} title={`Earnings trend (${total.currency})`} data={trendData(report.current.deliveryTrends, total.currency)} dataKey="value" color="#4F46E5" />)}</section>
      <section className="grid gap-6 xl:grid-cols-2"><DataTable title="Delivery Performance" columns={['Metric', 'Value', 'Comparison']} rows={[{ Metric: 'Acceptance rate', Value: `${report.current.acceptanceRate}%`, Comparison: comparisonLabel(report.comparison.acceptanceRate.percentChange) }, { Metric: 'Completion rate', Value: `${report.current.completionRate}%`, Comparison: comparisonLabel(report.comparison.completionRate.percentChange) }]} /><DataTable title="Delivery Status Distribution" columns={['Status', 'Count']} rows={report.current.deliveryStatusDistribution.map(item => ({ Status: item.status.replaceAll('_', ' '), Count: item.count }))} /></section>
      <section className="grid gap-6 xl:grid-cols-2"><TransportJobList jobs={jobs.data?.data ?? []} /><Card className="border-border/80 bg-white"><CardHeader><CardTitle>Vehicle Status</CardTitle></CardHeader><CardContent className="p-0">{(vehicles.data?.data ?? []).length ? <ClickableRowList>{(vehicles.data?.data ?? []).map(vehicle => <ClickableRow key={vehicle.id} href="/profile">
        <div><p className="font-semibold text-slate-900">{vehicle.registrationNumber}</p><p className="text-slate-600">{vehicle.type.replaceAll('_', ' ')}</p></div>
        <div className="flex items-center gap-3"><span className="text-slate-600">{vehicle.capacity && vehicle.capacityUnit ? `${vehicle.capacity} ${vehicle.capacityUnit}` : 'Capacity not specified'}</span><span className="font-semibold text-slate-900">{vehicle.isActive && vehicle.isAvailable ? 'AVAILABLE' : vehicle.isActive ? 'BUSY' : 'INACTIVE'}</span></div>
      </ClickableRow>)}</ClickableRowList> : <p className="px-4 py-8 text-center text-sm text-slate-500">No vehicles registered.</p>}</CardContent></Card></section>
      {(jobs.isError || vehicles.isError) && <ErrorState title="Operational data unavailable" description="Some jobs or vehicle details could not be loaded." onRetry={() => { void jobs.refetch(); void vehicles.refetch(); }} />}
      {jobs.isLoading || vehicles.isLoading ? <LoadingSkeleton /> : null}
    </> : null}
  </div>;
}
