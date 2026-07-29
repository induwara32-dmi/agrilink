import type { AnalyticsPeriodSet, AnalyticsQuery, AnalyticsRange, TrendBucket } from '../types/analytics';

const startOfUtcDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const range = (from: Date, to: Date, bucket: TrendBucket): AnalyticsRange => ({ from, to, bucket });

export function resolveAnalyticsPeriod(query: AnalyticsQuery, now = new Date()): AnalyticsPeriodSet {
  let from: Date;
  let to: Date;
  let bucket: TrendBucket;
  if (query.period === 'custom') {
    from = query.from!;
    to = query.to!;
    const days = (to.getTime() - from.getTime()) / 86_400_000;
    bucket = days <= 2 ? 'hour' : days <= 90 ? 'day' : days <= 730 ? 'week' : 'month';
  } else if (query.period === 'day') {
    from = startOfUtcDay(now); to = new Date(from.getTime() + 86_400_000); bucket = 'hour';
  } else if (query.period === 'week') {
    const day = startOfUtcDay(now); const mondayOffset = (day.getUTCDay() + 6) % 7; from = new Date(day.getTime() - mondayOffset * 86_400_000); to = new Date(from.getTime() + 7 * 86_400_000); bucket = 'day';
  } else if (query.period === 'month') {
    from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)); bucket = 'day';
  } else {
    from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)); to = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1)); bucket = 'month';
  }
  const duration = to.getTime() - from.getTime();
  return { period: query.period, current: range(from, to, bucket), previous: range(new Date(from.getTime() - duration), from, bucket) };
}

export function percentChange(current: number, previous: number): number | null { if (previous === 0) return current === 0 ? 0 : null; return Math.round(((current - previous) / previous) * 10_000) / 100; }
