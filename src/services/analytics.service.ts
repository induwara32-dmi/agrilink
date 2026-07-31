import { HTTP_STATUS } from '../constants/application';
import type { AnalyticsRepository } from '../repositories/analytics.repository';
import type { AnalyticsActor, AnalyticsPeriodSet, AnalyticsQuery, ComparisonValue, MoneyTotal } from '../types/analytics';
import { resolveAnalyticsPeriod, percentChange } from '../utils/analytics-period';
import { ApiError } from '../utils/api-error';
import type { AnalyticsCacheService } from './analytics-cache.service';
import { BaseService } from './base.service';

const CACHE_TTL_SECONDS = 300;
const comparison = (current: number, previous: number): ComparisonValue => ({ current, previous, percentChange: percentChange(current, previous) });
const moneyComparison = (current: MoneyTotal[], previous: MoneyTotal[]) => [...new Set([...current.map(item => item.currency), ...previous.map(item => item.currency)])].map(currency => { const currentAmount = Number(current.find(item => item.currency === currency)?.amount ?? 0); const previousAmount = Number(previous.find(item => item.currency === currency)?.amount ?? 0); return { currency, ...comparison(currentAmount, previousAmount) }; });
const periodMetadata = (periods: AnalyticsPeriodSet) => ({ preset: periods.period, current: { from: periods.current.from, to: periods.current.to, bucket: periods.current.bucket }, previous: { from: periods.previous.from, to: periods.previous.to, bucket: periods.previous.bucket } });

export class AnalyticsService extends BaseService {
  public constructor(private readonly repository: AnalyticsRepository, private readonly cache: AnalyticsCacheService) { super(); }
  public buyer(query: AnalyticsQuery, actor: AnalyticsActor) { return this.report('buyer', query, actor, async periods => { const [current, previous] = await Promise.all([this.repository.buyer(actor.userId, periods.current), this.repository.buyer(actor.userId, periods.previous)]); return { period: periodMetadata(periods), current, previous, comparison: { orders: comparison(current.dashboardSummary.orders, previous.dashboardSummary.orders), spending: moneyComparison(current.dashboardSummary.spending, previous.dashboardSummary.spending) } }; }); }
  public farmer(query: AnalyticsQuery, actor: AnalyticsActor) { return this.report('farmer', query, actor, async periods => { const [current, previous] = await Promise.all([this.repository.farmer(actor.userId, periods.current, true), this.repository.farmer(actor.userId, periods.previous, false)]); const { lowStockSummary, productSummary, inventoryStock, ...currentPeriod } = current; const { lowStockSummary: previousLowStock, productSummary: previousProducts, inventoryStock: previousInventory, ...previousPeriod } = previous; void previousLowStock; void previousProducts; void previousInventory; return { period: periodMetadata(periods), snapshot: { lowStockSummary, productSummary, inventoryStock }, current: currentPeriod, previous: previousPeriod, comparison: { revenue: moneyComparison(current.revenue, previous.revenue) } }; }); }
  public transporter(query: AnalyticsQuery, actor: AnalyticsActor) { return this.report('transporter', query, actor, async periods => { const [current, previous] = await Promise.all([this.repository.transporter(actor.userId, periods.current), this.repository.transporter(actor.userId, periods.previous)]); return { period: periodMetadata(periods), current, previous, comparison: { deliveriesCompleted: comparison(current.deliveriesCompleted, previous.deliveriesCompleted), earnings: moneyComparison(current.earnings, previous.earnings), acceptanceRate: comparison(current.acceptanceRate, previous.acceptanceRate), completionRate: comparison(current.completionRate, previous.completionRate) } }; }); }
  public admin(query: AnalyticsQuery, actor: AnalyticsActor) { return this.report('admin', query, actor, async periods => { const [current, previous] = await Promise.all([this.repository.admin(periods.current), this.repository.admin(periods.previous)]); return { period: periodMetadata(periods), current, previous, comparison: { newUsers: comparison(current.platformOverview.newUsers, previous.platformOverview.newUsers), orders: comparison(current.platformOverview.orders, previous.platformOverview.orders), products: comparison(current.platformOverview.products, previous.platformOverview.products), categories: comparison(current.platformOverview.categories, previous.platformOverview.categories), revenue: moneyComparison(current.platformOverview.revenue, previous.platformOverview.revenue) } }; }); }

  private async report<T>(scope: string, query: AnalyticsQuery, actor: AnalyticsActor, loader: (periods: AnalyticsPeriodSet) => Promise<T>): Promise<T> {
    const periods = resolveAnalyticsPeriod(query);
    const key = `analytics:${scope}:${actor.userId}:${periods.current.from.toISOString()}:${periods.current.to.toISOString()}`;
    const cached = await this.cache.get<T>(key);
    if (cached) { await this.repository.audit(actor, scope, true); return cached; }
    try { const report = await loader(periods); await this.cache.set(key, report, CACHE_TTL_SECONDS); await this.repository.audit(actor, scope, false); return report; }
    catch (error) { if (error instanceof Error && error.message === 'FARMER_PROFILE_NOT_FOUND') throw new ApiError(HTTP_STATUS.FORBIDDEN, 'FARMER_PROFILE_REQUIRED', 'A farmer profile is required.'); if (error instanceof Error && error.message === 'TRANSPORTER_PROFILE_NOT_FOUND') throw new ApiError(HTTP_STATUS.FORBIDDEN, 'TRANSPORTER_PROFILE_REQUIRED', 'A transporter profile is required.'); throw error; }
  }
}
