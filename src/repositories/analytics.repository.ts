import { FarmerOrderStatus, Prisma, TransportJobStatus, type PrismaClient } from '@prisma/client';
import type { AnalyticsActor, AnalyticsRange, MoneyTotal, TrendPoint } from '../types/analytics';
import { BaseRepository } from './base.repository';

export interface TrendRow { bucket: Date; currency: string; amount: Prisma.Decimal; count: number }
export interface CategoryRow { categoryId: string; categoryName: string; spending: Prisma.Decimal; quantity: Prisma.Decimal; orders: number }
export interface LowStockRow { productId: string; productName: string; available: Prisma.Decimal; reorderLevel: Prisma.Decimal }
export interface ProductPerformanceRow { productId: string; productName: string; unit: string; currency: string; revenue: Prisma.Decimal; quantity: Prisma.Decimal; orders: number }
export interface InventoryTurnoverRow { productId: string; productName: string; unit: string; soldQuantity: Prisma.Decimal; averageInventory: Prisma.Decimal; turnover: Prisma.Decimal }
export interface UserGrowthRow { bucket: Date; role: string; count: number }
export interface FarmerPerformanceRow { farmerId: string; farmName: string; currency: string; revenue: Prisma.Decimal; orders: number }
export interface TransporterPerformanceRow { transporterId: string; businessName: string | null; currency: string; earnings: Prisma.Decimal; deliveries: number }
export interface MoneyRow { currency: string; amount: Prisma.Decimal }
export interface InventoryStockRow { unit: string; quantity: Prisma.Decimal }
export interface CategoryPerformanceRow { categoryId: string; categoryName: string; currency: string; revenue: Prisma.Decimal; orders: number }

const between = (range: AnalyticsRange) => ({ gte: range.from, lt: range.to });
const money = (rows: Array<{ currency: string; _sum: Record<string, Prisma.Decimal | null> }>, field: string): MoneyTotal[] => rows.map(row => ({ currency: row.currency, amount: (row._sum[field] ?? new Prisma.Decimal(0)).toString() }));

export class AnalyticsRepository extends BaseRepository {
  public constructor(database: PrismaClient) { super(database); }

  public async buyer(userId: string, range: AnalyticsRange) {
    const orderWhere = { buyerId: userId, createdAt: between(range) };
    const spendingWhere = { ...orderWhere, status: { not: 'CANCELLED' as const } };
    const [spending, statuses, summary, trends, categories] = await Promise.all([
      this.database.order.groupBy({ by: ['currency'], where: spendingWhere, _sum: { grandTotal: true }, _avg: { grandTotal: true } }),
      this.database.order.groupBy({ by: ['status'], where: orderWhere, _count: { _all: true } }),
      this.database.order.count({ where: orderWhere }),
      this.orderTrends(Prisma.sql`o."buyerId" = ${userId}::uuid AND o.status <> 'CANCELLED'::"OrderStatus"`, range),
      this.database.$queryRaw<CategoryRow[]>(Prisma.sql`SELECT c.id AS "categoryId", c.name AS "categoryName", COALESCE(SUM(oi."lineTotal"), 0) AS spending, COALESCE(SUM(oi.quantity), 0) AS quantity, COUNT(DISTINCT o.id)::int AS orders FROM "OrderItem" oi JOIN "FarmerOrder" fo ON fo.id = oi."farmerOrderId" JOIN "Order" o ON o.id = fo."orderId" JOIN "Product" p ON p.id = oi."productId" JOIN "Category" c ON c.id = p."categoryId" WHERE o."buyerId" = ${userId}::uuid AND o.status <> 'CANCELLED'::"OrderStatus" AND o."createdAt" >= ${range.from} AND o."createdAt" < ${range.to} GROUP BY c.id, c.name ORDER BY spending DESC LIMIT 10`),
    ]);
    return { dashboardSummary: { orders: summary, averageOrderValue: spending.map(row => ({ currency: row.currency, amount: row._avg.grandTotal?.toString() ?? '0' })), spending: money(spending, 'grandTotal') }, spendingTrends: trends, orderHistorySummary: statuses.map(row => ({ status: row.status, count: row._count._all })), favouriteCategories: categories.map(row => ({ ...row, spending: row.spending.toString(), quantity: row.quantity.toString() })) };
  }

  public async farmer(userId: string, range: AnalyticsRange, includeSnapshot = true) {
    const farmer = await this.database.farmerProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!farmer) throw new Error('FARMER_PROFILE_NOT_FOUND');
    const fulfilledWhere = { farmerId: farmer.id, status: FarmerOrderStatus.DELIVERED, completedAt: between(range) };
    const periodWhere = { farmerId: farmer.id, createdAt: between(range) };
    const [revenue, statuses, trends, topProducts, lowStock, turnover, totalProducts, activeProducts, inventoryStock] = await Promise.all([
      this.database.farmerOrder.groupBy({ by: ['currency'], where: fulfilledWhere, _sum: { total: true } }),
      this.database.farmerOrder.groupBy({ by: ['status'], where: periodWhere, _count: { _all: true } }),
      this.farmerTrends(farmer.id, range),
      this.database.$queryRaw<ProductPerformanceRow[]>(Prisma.sql`SELECT p.id AS "productId", p.name AS "productName", oi.unit, fo.currency, COALESCE(SUM(oi."lineTotal"), 0) AS revenue, COALESCE(SUM(oi.quantity), 0) AS quantity, COUNT(DISTINCT fo.id)::int AS orders FROM "OrderItem" oi JOIN "FarmerOrder" fo ON fo.id = oi."farmerOrderId" JOIN "Product" p ON p.id = oi."productId" WHERE fo."farmerId" = ${farmer.id}::uuid AND fo.status = 'DELIVERED'::"FarmerOrderStatus" AND fo."completedAt" >= ${range.from} AND fo."completedAt" < ${range.to} GROUP BY p.id, p.name, oi.unit, fo.currency ORDER BY revenue DESC LIMIT 10`),
      includeSnapshot ? this.database.$queryRaw<LowStockRow[]>(Prisma.sql`SELECT p.id AS "productId", p.name AS "productName", (i."quantityOnHand" - i."quantityReserved") AS available, i."reorderLevel" AS "reorderLevel" FROM "Inventory" i JOIN "Product" p ON p.id = i."productId" WHERE p."farmerId" = ${farmer.id}::uuid AND p."deletedAt" IS NULL AND i."reorderLevel" IS NOT NULL AND (i."quantityOnHand" - i."quantityReserved") <= i."reorderLevel" ORDER BY available ASC`) : Promise.resolve([]),
      this.database.$queryRaw<InventoryTurnoverRow[]>(Prisma.sql`WITH sales AS (SELECT p.id AS "productId", p.name AS "productName", oi.unit, COALESCE(SUM(oi.quantity), 0) AS "soldQuantity" FROM "OrderItem" oi JOIN "FarmerOrder" fo ON fo.id = oi."farmerOrderId" JOIN "Product" p ON p.id = oi."productId" WHERE fo."farmerId" = ${farmer.id}::uuid AND fo.status = 'DELIVERED'::"FarmerOrderStatus" AND fo."completedAt" >= ${range.from} AND fo."completedAt" < ${range.to} GROUP BY p.id, p.name, oi.unit) SELECT s."productId", s."productName", s.unit, s."soldQuantity", (i."quantityOnHand" + s."soldQuantity" / 2) AS "averageInventory", CASE WHEN (i."quantityOnHand" + s."soldQuantity" / 2) > 0 THEN s."soldQuantity" / (i."quantityOnHand" + s."soldQuantity" / 2) ELSE 0 END AS turnover FROM sales s JOIN "Inventory" i ON i."productId" = s."productId" ORDER BY turnover DESC LIMIT 20`),
      includeSnapshot ? this.database.product.count({ where: { farmerId: farmer.id, deletedAt: null } }) : Promise.resolve(0),
      includeSnapshot ? this.database.product.count({ where: { farmerId: farmer.id, status: 'ACTIVE', deletedAt: null } }) : Promise.resolve(0),
      includeSnapshot ? this.database.$queryRaw<InventoryStockRow[]>(Prisma.sql`SELECT p.unit, COALESCE(SUM(i."quantityOnHand" - i."quantityReserved"), 0) AS quantity FROM "Inventory" i JOIN "Product" p ON p.id = i."productId" WHERE p."farmerId" = ${farmer.id}::uuid AND p."deletedAt" IS NULL GROUP BY p.unit ORDER BY p.unit`) : Promise.resolve([]),
    ]);
    return { revenue: money(revenue, 'total'), salesTrends: trends, topProducts: topProducts.map(row => ({ ...row, revenue: row.revenue.toString(), quantity: row.quantity.toString() })), lowStockSummary: { count: lowStock.length, products: lowStock.map(row => ({ ...row, available: row.available.toString(), reorderLevel: row.reorderLevel.toString() })) }, productSummary: { total: totalProducts, active: activeProducts }, inventoryStock: inventoryStock.map(row => ({ unit: row.unit, quantity: row.quantity.toString() })), inventoryTurnover: turnover.map(row => ({ ...row, soldQuantity: row.soldQuantity.toString(), averageInventory: row.averageInventory.toString(), turnover: row.turnover.toString() })), orderStatusDistribution: statuses.map(row => ({ status: row.status, count: row._count._all })) };
  }

  public async transporter(userId: string, range: AnalyticsRange) {
    const transporter = await this.database.transporterProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!transporter) throw new Error('TRANSPORTER_PROFILE_NOT_FOUND');
    const [earnings, completed, accepted, rejected, statuses, trends, availableJobs, acceptedDeliveries] = await Promise.all([
      this.database.transportJob.groupBy({ by: ['currency'], where: { transporterId: transporter.id, status: TransportJobStatus.COMPLETED, completedAt: between(range) }, _sum: { offeredFee: true } }),
      this.database.transportJob.count({ where: { transporterId: transporter.id, status: TransportJobStatus.COMPLETED, completedAt: between(range) } }),
      this.database.transportJob.count({ where: { transporterId: transporter.id, acceptedAt: between(range) } }),
      this.database.transportJobRejection.count({ where: { userId, createdAt: between(range) } }),
      this.database.delivery.groupBy({ by: ['status'], where: { transportJob: { transporterId: transporter.id, createdAt: between(range) } }, _count: { _all: true } }),
      this.transportTrends(transporter.id, range),
      this.database.transportJob.count({ where: { status: TransportJobStatus.OPEN } }),
      this.database.transportJob.count({ where: { transporterId: transporter.id, status: { in: [TransportJobStatus.ACCEPTED, TransportJobStatus.IN_PROGRESS] } } }),
    ]);
    return { availableJobs, acceptedDeliveries, deliveriesCompleted: completed, earnings: money(earnings, 'offeredFee'), acceptanceRate: accepted + rejected === 0 ? 0 : Math.round((accepted / (accepted + rejected)) * 10_000) / 100, completionRate: accepted === 0 ? 0 : Math.round((completed / accepted) * 10_000) / 100, deliveryStatusDistribution: statuses.map(row => ({ status: row.status, count: row._count._all })), deliveryTrends: trends };
  }

  public async admin(range: AnalyticsRange) {
    const [users, totalUsers, userRoles, userGrowth, revenue, orders, totalOrders, orderStatuses, products, totalProducts, productStatuses, categories, totalCategories, farmers, transporters, activeFarmers, activeTransporters, pendingFarmers, pendingTransporters, registrations, orderTrends, categoryPerformance] = await Promise.all([
      this.database.user.count({ where: { createdAt: between(range), deletedAt: null } }),
      this.database.user.count({ where: { createdAt: { lt: range.to }, deletedAt: null } }),
      this.database.user.groupBy({ by: ['role'], where: { createdAt: between(range), deletedAt: null }, _count: { _all: true } }),
      this.userGrowth(range),
      this.database.$queryRaw<MoneyRow[]>(Prisma.sql`SELECT p.currency, COALESCE(SUM(p."amountPaid" - p."amountRefunded"), 0) AS amount FROM "Payment" p WHERE p.status IN ('PAID'::"PaymentStatus", 'PARTIALLY_REFUNDED'::"PaymentStatus", 'REFUNDED'::"PaymentStatus") AND p."paidAt" >= ${range.from} AND p."paidAt" < ${range.to} GROUP BY p.currency ORDER BY p.currency`),
      this.database.order.count({ where: { createdAt: between(range) } }),
      this.database.order.count({ where: { createdAt: { lt: range.to } } }),
      this.database.order.groupBy({ by: ['status'], where: { createdAt: between(range) }, _count: { _all: true } }),
      this.database.product.count({ where: { createdAt: between(range), deletedAt: null } }),
      this.database.product.count({ where: { createdAt: { lt: range.to }, deletedAt: null } }),
      this.database.product.groupBy({ by: ['status'], where: { createdAt: between(range), deletedAt: null }, _count: { _all: true } }),
      this.database.category.count({ where: { createdAt: between(range), deletedAt: null } }),
      this.database.category.count({ where: { createdAt: { lt: range.to }, deletedAt: null } }),
      this.database.$queryRaw<FarmerPerformanceRow[]>(Prisma.sql`SELECT fp.id AS "farmerId", fp."farmName", fo.currency, COALESCE(SUM(fo.total), 0) AS revenue, COUNT(fo.id)::int AS orders FROM "FarmerOrder" fo JOIN "FarmerProfile" fp ON fp.id = fo."farmerId" WHERE fo.status = 'DELIVERED'::"FarmerOrderStatus" AND fo."completedAt" >= ${range.from} AND fo."completedAt" < ${range.to} GROUP BY fp.id, fp."farmName", fo.currency ORDER BY revenue DESC LIMIT 20`),
      this.database.$queryRaw<TransporterPerformanceRow[]>(Prisma.sql`SELECT tp.id AS "transporterId", tp."businessName", tj.currency, COALESCE(SUM(tj."offeredFee"), 0) AS earnings, COUNT(tj.id)::int AS deliveries FROM "TransportJob" tj JOIN "TransporterProfile" tp ON tp.id = tj."transporterId" WHERE tj.status = 'COMPLETED'::"TransportJobStatus" AND tj."completedAt" >= ${range.from} AND tj."completedAt" < ${range.to} GROUP BY tp.id, tp."businessName", tj.currency ORDER BY earnings DESC LIMIT 20`),
      this.database.user.count({ where: { role: 'FARMER', status: 'ACTIVE', deletedAt: null } }),
      this.database.user.count({ where: { role: 'TRANSPORTER', status: 'ACTIVE', deletedAt: null } }),
      this.database.farmerProfile.count({ where: { verificationStatus: 'PENDING', deletedAt: null } }),
      this.database.transporterProfile.count({ where: { verificationStatus: 'PENDING', deletedAt: null } }),
      this.database.user.findMany({ where: { createdAt: between(range), deletedAt: null }, select: { id: true, email: true, role: true, createdAt: true, profile: { select: { displayName: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
      this.orderTrends(Prisma.sql`TRUE`, range),
      this.database.$queryRaw<CategoryPerformanceRow[]>(Prisma.sql`SELECT c.id AS "categoryId", c.name AS "categoryName", o.currency, COALESCE(SUM(oi."lineTotal"), 0) AS revenue, COUNT(DISTINCT o.id)::int AS orders FROM "OrderItem" oi JOIN "FarmerOrder" fo ON fo.id = oi."farmerOrderId" JOIN "Order" o ON o.id = fo."orderId" JOIN "Product" p ON p.id = oi."productId" JOIN "Category" c ON c.id = p."categoryId" WHERE o.status <> 'CANCELLED'::"OrderStatus" AND o."createdAt" >= ${range.from} AND o."createdAt" < ${range.to} GROUP BY c.id, c.name, o.currency ORDER BY revenue DESC LIMIT 20`),
    ]);
    const netRevenue = revenue.map(row => ({ currency: row.currency, amount: row.amount.toString() }));
    return { platformOverview: { newUsers: users, totalUsers, activeFarmers, activeTransporters, pendingFarmers, pendingTransporters, orders, totalOrders, products, totalProducts, categories, totalCategories, revenue: netRevenue }, recentRegistrations: registrations.map(user => ({ ...user, name: user.profile?.displayName ?? ([user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || user.email) })), userGrowth: { trend: userGrowth, byRole: userRoles.map(row => ({ role: row.role, count: row._count._all })) }, revenue: netRevenue, orders: { total: orders, cumulativeTotal: totalOrders, trend: orderTrends, byStatus: orderStatuses.map(row => ({ status: row.status, count: row._count._all })) }, products: { total: products, cumulativeTotal: totalProducts, byStatus: productStatuses.map(row => ({ status: row.status, count: row._count._all })) }, categories: { total: categories, cumulativeTotal: totalCategories, performance: categoryPerformance.map(row => ({ ...row, revenue: row.revenue.toString() })) }, farmerPerformance: farmers.map(row => ({ ...row, revenue: row.revenue.toString() })), transporterPerformance: transporters.map(row => ({ ...row, earnings: row.earnings.toString() })) };
  }

  public async audit(actor: AnalyticsActor, scope: string, fromCache: boolean): Promise<void> { await this.database.auditLog.create({ data: { actorId: actor.userId, action: 'ANALYTICS_VIEWED', entityType: 'Analytics', requestId: actor.requestId, after: { scope, fromCache } } }); }

  private async orderTrends(condition: Prisma.Sql, range: AnalyticsRange): Promise<TrendPoint[]> { const rows = await this.database.$queryRaw<TrendRow[]>(Prisma.sql`SELECT date_trunc(${range.bucket}, o."createdAt") AS bucket, o.currency, COALESCE(SUM(o."grandTotal"), 0) AS amount, COUNT(o.id)::int AS count FROM "Order" o WHERE ${condition} AND o."createdAt" >= ${range.from} AND o."createdAt" < ${range.to} GROUP BY bucket, o.currency ORDER BY bucket ASC`); return rows.map(row => ({ ...row, amount: row.amount.toString() })); }
  private async farmerTrends(farmerId: string, range: AnalyticsRange): Promise<TrendPoint[]> { const rows = await this.database.$queryRaw<TrendRow[]>(Prisma.sql`SELECT date_trunc(${range.bucket}, fo."completedAt") AS bucket, fo.currency, COALESCE(SUM(fo.total), 0) AS amount, COUNT(fo.id)::int AS count FROM "FarmerOrder" fo WHERE fo."farmerId" = ${farmerId}::uuid AND fo.status = 'DELIVERED'::"FarmerOrderStatus" AND fo."completedAt" >= ${range.from} AND fo."completedAt" < ${range.to} GROUP BY bucket, fo.currency ORDER BY bucket ASC`); return rows.map(row => ({ ...row, amount: row.amount.toString() })); }
  private async transportTrends(transporterId: string, range: AnalyticsRange): Promise<TrendPoint[]> { const rows = await this.database.$queryRaw<TrendRow[]>(Prisma.sql`SELECT date_trunc(${range.bucket}, tj."completedAt") AS bucket, tj.currency, COALESCE(SUM(tj."offeredFee"), 0) AS amount, COUNT(tj.id)::int AS count FROM "TransportJob" tj WHERE tj."transporterId" = ${transporterId}::uuid AND tj.status = 'COMPLETED'::"TransportJobStatus" AND tj."completedAt" >= ${range.from} AND tj."completedAt" < ${range.to} GROUP BY bucket, tj.currency ORDER BY bucket ASC`); return rows.map(row => ({ ...row, amount: row.amount.toString() })); }
  private async userGrowth(range: AnalyticsRange) { return this.database.$queryRaw<UserGrowthRow[]>(Prisma.sql`SELECT date_trunc(${range.bucket}, u."createdAt") AS bucket, u.role::text AS role, COUNT(u.id)::int AS count FROM "User" u WHERE u."createdAt" >= ${range.from} AND u."createdAt" < ${range.to} AND u."deletedAt" IS NULL GROUP BY bucket, u.role ORDER BY bucket ASC`); }
}
