import type { InventoryMovementType, ProductStatus, Role } from '@prisma/client';

export interface Actor { userId: string; role: Role; requestId: string }
export interface PageQuery { page: number; pageSize: number }
export interface ProductQuery extends PageQuery {
  search?: string;
  categoryId?: string;
  farmerId?: string;
  status?: ProductStatus;
  minPrice?: string;
  maxPrice?: string;
  sort: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc';
}
export interface ProductInput {
  farmerId?: string;
  categoryId: string;
  name: string;
  slug?: string;
  description: string;
  sku?: string;
  unit: string;
  unitPrice: string;
  currency: string;
  minOrderQuantity: string;
  status?: ProductStatus;
  initialQuantity?: string;
  reorderLevel?: string;
}
export type ProductUpdateInput = Partial<Omit<ProductInput, 'farmerId' | 'initialQuantity' | 'reorderLevel'>>;
export interface CategoryInput { parentId?: string | null; name: string; slug?: string; description?: string; isActive?: boolean; sortOrder?: number }
export type CategoryUpdateInput = Partial<CategoryInput>;
export interface ImageInput { storageKey: string; url: string; altText?: string; sortOrder: number }
export type ImageUpdateInput = Partial<Pick<ImageInput, 'altText' | 'sortOrder'>>;
export interface InventoryAdjustmentInput { type: InventoryMovementType; quantity: string; reason?: string }
