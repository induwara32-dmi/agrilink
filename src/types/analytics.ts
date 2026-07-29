import type { Role } from '@prisma/client';

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year' | 'custom';
export type TrendBucket = 'hour' | 'day' | 'week' | 'month';
export interface AnalyticsQuery { period: AnalyticsPeriod; from?: Date; to?: Date }
export interface AnalyticsRange { from: Date; to: Date; bucket: TrendBucket }
export interface AnalyticsPeriodSet { current: AnalyticsRange; previous: AnalyticsRange; period: AnalyticsPeriod }
export interface AnalyticsActor { userId: string; role: Role; requestId: string }
export interface MoneyTotal { currency: string; amount: string }
export interface TrendPoint extends MoneyTotal { bucket: Date; count: number }
export interface ComparisonValue { current: number; previous: number; percentChange: number | null }
