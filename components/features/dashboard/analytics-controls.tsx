'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { AnalyticsPeriod, AnalyticsQuery } from '@/lib/api/analytics';

export function AnalyticsControls({ query, onChange }: { query: AnalyticsQuery; onChange: (query: AnalyticsQuery) => void }) {
  return <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 sm:grid-cols-3"><Select aria-label="Analytics period" value={query.period} onChange={event => onChange({ period: event.target.value as AnalyticsPeriod })}><option value="day">Day</option><option value="week">Week</option><option value="month">Month</option><option value="year">Year</option><option value="custom">Custom</option></Select>{query.period === 'custom' ? <><Input aria-label="Analytics start date" type="date" value={query.from?.slice(0, 10) ?? ''} onChange={event => onChange({ ...query, from: event.target.value ? new Date(`${event.target.value}T00:00:00Z`).toISOString() : undefined })} /><Input aria-label="Analytics end date" type="date" value={query.to?.slice(0, 10) ?? ''} onChange={event => onChange({ ...query, to: event.target.value ? new Date(`${event.target.value}T23:59:59Z`).toISOString() : undefined })} /></> : <div className="text-sm text-slate-600 sm:col-span-2">Comparisons use the equivalent preceding period.</div>}</div>;
}

export function comparisonLabel(percentChange: number | null) { return percentChange === null ? 'No previous-period baseline' : `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}% vs previous period`; }
export function moneyLabel(values: Array<{ currency: string; amount: string }>) { return values.length ? values.map(value => new Intl.NumberFormat(undefined, { style: 'currency', currency: value.currency }).format(Number(value.amount))).join(' · ') : '—'; }
export function trendData(points: Array<{ bucket: string; amount: string; count: number }>, currency?: string) { return points.filter(point => !currency || ('currency' in point && (point as { currency: string }).currency === currency)).map(point => ({ name: new Date(point.bucket).toLocaleDateString(), value: Number(point.amount), count: point.count })); }
