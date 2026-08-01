import { Prisma, ProductStatus, Role, VerificationStatus } from '@prisma/client';
import { HTTP_STATUS } from '../constants/application';
import type { CatalogRepository, ProductRecord } from '../repositories/catalog.repository';
import type { Actor, CategoryInput, CategoryUpdateInput, ProductInput, ProductQuery, ProductUpdateInput } from '../types/catalog';
import { ApiError } from '../utils/api-error';
import { slugify } from '../utils/slug';
import { createTokenId } from '../utils/token';
import { BaseService } from './base.service';
import type { DomainEventPublisher } from '../types/domain-events';

const pageMeta = (page: number, pageSize: number, total: number) => ({ page, pageSize, total, totalPages: Math.ceil(total / pageSize) });

export class CatalogService extends BaseService {
  public constructor(private readonly repository: CatalogRepository, private readonly events: DomainEventPublisher) { super(); }
  public async listPublic(query: ProductQuery) { const result = await this.repository.listProducts(query, true); return { ...result, meta: pageMeta(query.page, query.pageSize, result.total) }; }
  public async listFarmer(query: ProductQuery, actor: Actor) { const farmer = await this.requireFarmer(actor.userId); const result = await this.repository.listProducts(query, false, farmer.id); return { ...result, meta: pageMeta(query.page, query.pageSize, result.total) }; }
  public async managedFarmerId(actor: Actor): Promise<string | undefined> { return actor.role === Role.FARMER ? (await this.requireFarmer(actor.userId)).id : undefined; }
  public async listManaged(query: ProductQuery, actor: Actor) { if (actor.role === Role.ADMIN) { const result = await this.repository.listProducts(query, false); return { ...result, meta: pageMeta(query.page, query.pageSize, result.total) }; } return this.listFarmer(query, actor); }
  public async getPublic(id: string) { const item = await this.repository.findProduct(id); if (!item || item.status !== ProductStatus.ACTIVE || !item.category.isActive) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'PRODUCT_NOT_FOUND', 'Product not found.'); return item; }
  public getManaged(id: string, actor: Actor) { return this.requireManagedProduct(id, actor); }
  public async getCategory(id: string) { const item = await this.repository.findCategory(id); if (!item || !item.isActive) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND', 'Category not found.'); return item; }
  public async createProduct(input: ProductInput, actor: Actor) {
    const farmer = actor.role === Role.ADMIN ? await this.repository.findFarmerById(input.farmerId ?? '') : await this.requireFarmer(actor.userId);
    if (!farmer) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'FARMER_REQUIRED', 'A valid farmer is required.');
    if (actor.role !== Role.ADMIN && farmer.verificationStatus !== VerificationStatus.APPROVED) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'FARMER_NOT_VERIFIED', 'Farmer verification is required.');
    if (!await this.repository.findCategory(input.categoryId)) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'CATEGORY_NOT_FOUND', 'Category not found.');
    const slug = input.slug ?? `${slugify(input.name)}-${createTokenId().slice(0, 8)}`;
    try { const product = await this.repository.createProduct({ ...input, slug }, farmer.id, actor.userId, actor.requestId); await this.events.publish({ type: 'PRODUCT_CREATED', recipientIds: [farmer.userId], data: { productId: product.id, productName: product.name } }); return product; } catch (error) { this.translateConflict(error); }
  }
  public async updateProduct(id: string, input: ProductUpdateInput, actor: Actor) { const product = await this.requireManagedProduct(id, actor); if (input.categoryId && !await this.repository.findCategory(input.categoryId)) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'CATEGORY_NOT_FOUND', 'Category not found.'); if (input.status === ProductStatus.ACTIVE && actor.role !== Role.ADMIN && product.farmer.verificationStatus !== VerificationStatus.APPROVED) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'FARMER_NOT_VERIFIED', 'Farmer verification is required.'); try { return await this.repository.updateProduct(id, input, actor.userId, actor.requestId); } catch (error) { this.translateConflict(error); } }
  public async deleteProduct(id: string, actor: Actor): Promise<void> { await this.requireManagedProduct(id, actor); await this.repository.deleteProduct(id, actor.userId, actor.requestId); }
  public listCategories(includeInactive: boolean, actor?: Actor) { return this.repository.listCategories(actor?.role === Role.ADMIN ? includeInactive : false); }
  public async createCategory(input: CategoryInput, actor: Actor) { if (input.parentId && !await this.repository.findCategory(input.parentId)) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'PARENT_CATEGORY_NOT_FOUND', 'Parent category not found.'); try { return await this.repository.createCategory({ ...input, slug: input.slug ?? slugify(input.name) }, actor.userId, actor.requestId); } catch (error) { this.translateConflict(error); } }
  public async updateCategory(id: string, input: CategoryUpdateInput, actor: Actor) { if (!await this.repository.findCategory(id)) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND', 'Category not found.'); if (input.parentId === id) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_CATEGORY_PARENT', 'A category cannot be its own parent.'); try { return await this.repository.updateCategory(id, input, actor.userId, actor.requestId); } catch (error) { this.translateConflict(error); } }
  public async deleteCategory(id: string, actor: Actor): Promise<void> { if (!await this.repository.findCategory(id)) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND', 'Category not found.'); await this.repository.deleteCategory(id, actor.userId, actor.requestId); }
  public async requireManagedProduct(id: string, actor: Actor): Promise<ProductRecord> { const product = await this.repository.findProduct(id); if (!product) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'PRODUCT_NOT_FOUND', 'Product not found.'); if (actor.role !== Role.ADMIN && product.farmer.userId !== actor.userId) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'PRODUCT_FORBIDDEN', 'You cannot manage this product.'); return product; }
  private async requireFarmer(userId: string) { const farmer = await this.repository.findFarmerByUser(userId); if (!farmer) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'FARMER_PROFILE_REQUIRED', 'A farmer profile is required.'); return farmer; }
  private translateConflict(error: unknown): never { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ApiError(HTTP_STATUS.CONFLICT, 'UNIQUE_CONFLICT', 'A unique field is already in use.'); throw error; }
}
