import { InventoryMovementType, Prisma, ProductStatus, type PrismaClient } from '@prisma/client';
import type { CategoryInput, CategoryUpdateInput, ProductInput, ProductQuery, ProductUpdateInput } from '../types/catalog';
import { BaseRepository } from './base.repository';

const productInclude = {
  category: true,
  farmer: {
    include: {
      user: {
        select: {
          id: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  },
  images: { orderBy: { sortOrder: 'asc' as const } },
  inventory: true,
} satisfies Prisma.ProductInclude;
export type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

const audit = (actorId: string, action: string, entityType: string, entityId: string, requestId: string, before?: Prisma.InputJsonValue, after?: Prisma.InputJsonValue) => ({ actorId, action, entityType, entityId, requestId, ...(before ? { before } : {}), ...(after ? { after } : {}) });

export class CatalogRepository extends BaseRepository {
  public constructor(database: PrismaClient) { super(database); }
  public findFarmerByUser(userId: string) { return this.database.farmerProfile.findUnique({ where: { userId } }); }
  public findFarmerById(id: string) { return this.database.farmerProfile.findUnique({ where: { id } }); }
  public findCategory(id: string) { return this.database.category.findFirst({ where: { id, deletedAt: null } }); }
  public findCategoryByName(name: string, excludeId?: string) { return this.database.category.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) } }); }
  public findProduct(id: string): Promise<ProductRecord | null> { return this.database.product.findFirst({ where: { id, deletedAt: null }, include: productInclude }); }

  public async listProducts(query: ProductQuery, publicOnly: boolean, ownerFarmerId?: string) {
    const where: Prisma.ProductWhereInput = { deletedAt: null, ...(publicOnly ? { status: ProductStatus.ACTIVE, category: { isActive: true, deletedAt: null } } : {}), ...(ownerFarmerId ? { farmerId: ownerFarmerId } : {}), ...(query.categoryId ? { categoryId: query.categoryId } : {}), ...(query.farmerId ? { farmerId: query.farmerId } : {}), ...(!publicOnly && query.status ? { status: query.status } : {}), ...(query.search ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }, { farmer: { farmName: { contains: query.search, mode: 'insensitive' } } }] } : {}), ...(query.minPrice || query.maxPrice ? { unitPrice: { ...(query.minPrice ? { gte: new Prisma.Decimal(query.minPrice) } : {}), ...(query.maxPrice ? { lte: new Prisma.Decimal(query.maxPrice) } : {}) } } : {}) };
    const orderBy: Prisma.ProductOrderByWithRelationInput = query.sort === 'oldest' ? { createdAt: 'asc' } : query.sort === 'priceAsc' ? { unitPrice: 'asc' } : query.sort === 'priceDesc' ? { unitPrice: 'desc' } : query.sort === 'nameAsc' ? { name: 'asc' } : query.sort === 'nameDesc' ? { name: 'desc' } : { createdAt: 'desc' };
    const [items, total] = await this.database.$transaction([this.database.product.findMany({ where, include: productInclude, orderBy, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.database.product.count({ where })]);
    return { items, total };
  }

  public async createProduct(input: ProductInput, farmerId: string, actorId: string, requestId: string): Promise<ProductRecord> {
    return this.database.$transaction(async tx => {
      const product = await tx.product.create({ data: { farmerId, categoryId: input.categoryId, name: input.name, slug: input.slug!, description: input.description, ...(input.sku ? { sku: input.sku } : {}), unit: input.unit, unitPrice: new Prisma.Decimal(input.unitPrice), currency: input.currency, minOrderQuantity: new Prisma.Decimal(input.minOrderQuantity), status: input.status ?? ProductStatus.DRAFT, inventory: { create: { quantityOnHand: new Prisma.Decimal(input.initialQuantity ?? 0), ...(input.reorderLevel ? { reorderLevel: new Prisma.Decimal(input.reorderLevel) } : {}) } } }, include: productInclude });
      const initialQuantity = new Prisma.Decimal(input.initialQuantity ?? 0);
      if (product.inventory && initialQuantity.isPositive()) {
        await tx.inventoryMovement.create({ data: { inventoryId: product.inventory.id, actorId, type: InventoryMovementType.STOCK_IN, quantity: initialQuantity, balanceAfter: initialQuantity, reason: 'Initial inventory' } });
      }
      await tx.auditLog.create({ data: audit(actorId, 'PRODUCT_CREATED', 'Product', product.id, requestId, undefined, { name: product.name, status: product.status }) });
      return product;
    });
  }

  public async updateProduct(id: string, input: ProductUpdateInput, actorId: string, requestId: string): Promise<ProductRecord> {
    return this.database.$transaction(async tx => {
      const before = await tx.product.findUniqueOrThrow({ where: { id } });
      const product = await tx.product.update({ where: { id }, data: { ...input, ...(input.unitPrice ? { unitPrice: new Prisma.Decimal(input.unitPrice) } : {}), ...(input.minOrderQuantity ? { minOrderQuantity: new Prisma.Decimal(input.minOrderQuantity) } : {}), ...(input.status === ProductStatus.ACTIVE ? { publishedAt: before.publishedAt ?? new Date() } : {}) }, include: productInclude });
      await tx.auditLog.create({ data: audit(actorId, 'PRODUCT_UPDATED', 'Product', id, requestId, { name: before.name, status: before.status }, { name: product.name, status: product.status }) });
      return product;
    });
  }

  public async deleteProduct(id: string, actorId: string, requestId: string): Promise<void> { await this.database.$transaction([this.database.product.update({ where: { id }, data: { deletedAt: new Date(), status: ProductStatus.ARCHIVED } }), this.database.auditLog.create({ data: audit(actorId, 'PRODUCT_DELETED', 'Product', id, requestId) })]); }
  public listCategories(includeInactive: boolean) { return this.database.category.findMany({ where: { deletedAt: null, ...(!includeInactive ? { isActive: true } : {}) }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }
  public async createCategory(input: CategoryInput, actorId: string, requestId: string) { return this.database.$transaction(async tx => { const item = await tx.category.create({ data: { ...input, slug: input.slug! } }); await tx.auditLog.create({ data: audit(actorId, 'CATEGORY_CREATED', 'Category', item.id, requestId, undefined, { name: item.name }) }); return item; }); }
  public async updateCategory(id: string, input: CategoryUpdateInput, actorId: string, requestId: string) { return this.database.$transaction(async tx => { const before = await tx.category.findUniqueOrThrow({ where: { id } }); const item = await tx.category.update({ where: { id }, data: input }); await tx.auditLog.create({ data: audit(actorId, 'CATEGORY_UPDATED', 'Category', id, requestId, { name: before.name }, { name: item.name }) }); return item; }); }
  public async deleteCategory(id: string, actorId: string, requestId: string): Promise<void> { await this.database.$transaction([this.database.category.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } }), this.database.auditLog.create({ data: audit(actorId, 'CATEGORY_DELETED', 'Category', id, requestId) })]); }
}
