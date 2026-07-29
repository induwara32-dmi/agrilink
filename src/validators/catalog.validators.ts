import { InventoryMovementType, ProductStatus } from '@prisma/client';
import { z } from 'zod';

const uuid = z.string().uuid();
const decimal = z.string().regex(/^\d+(\.\d{1,4})?$/, 'Must be a positive decimal with up to four decimal places.');
const quantity = z.string().regex(/^-?\d+(\.\d{1,3})?$/, 'Must be a decimal with up to three decimal places.');
const empty = z.object({}).strict();
const request = <B extends z.ZodType, P extends z.ZodType, Q extends z.ZodType>(body: B, params: P, query: Q) => z.object({ body, params, query });
const idParams = z.object({ id: uuid });

export const productListSchema = request(empty, empty, z.object({
  page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(120).optional(), categoryId: uuid.optional(), farmerId: uuid.optional(),
  status: z.nativeEnum(ProductStatus).optional(), minPrice: decimal.optional(), maxPrice: decimal.optional(),
  sort: z.enum(['newest', 'oldest', 'priceAsc', 'priceDesc', 'nameAsc', 'nameDesc']).default('newest'),
}));
export const productIdSchema = request(empty, idParams, empty);
export const createProductSchema = request(z.object({
  farmerId: uuid.optional(), categoryId: uuid, name: z.string().trim().min(2).max(180), slug: z.string().trim().min(2).max(220).optional(),
  description: z.string().trim().min(10).max(10000), sku: z.string().trim().min(1).max(100).optional(), unit: z.string().trim().min(1).max(40),
  unitPrice: decimal, currency: z.string().length(3).transform(v => v.toUpperCase()), minOrderQuantity: decimal.default('1'),
  status: z.nativeEnum(ProductStatus).optional(), initialQuantity: decimal.optional(), reorderLevel: decimal.optional(),
}), empty, empty);
export const updateProductSchema = request(createProductSchema.shape.body.omit({ farmerId: true, initialQuantity: true, reorderLevel: true }).partial().refine(v => Object.keys(v).length > 0), idParams, empty);
export const categoryListSchema = request(empty, empty, z.object({ includeInactive: z.stringbool().default(false) }));
export const createCategorySchema = request(z.object({ parentId: uuid.nullable().optional(), name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(140).optional(), description: z.string().trim().max(5000).optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().min(0).optional() }), empty, empty);
export const updateCategorySchema = request(createCategorySchema.shape.body.partial().refine(v => Object.keys(v).length > 0), idParams, empty);
export const imageParamsSchema = request(empty, z.object({ id: uuid, imageId: uuid }), empty);
export const createImageSchema = request(z.object({ storageKey: z.string().trim().min(1).max(500), url: z.string().url(), altText: z.string().trim().max(255).optional(), sortOrder: z.number().int().min(0) }), idParams, empty);
export const updateImageSchema = request(z.object({ altText: z.string().trim().max(255).optional(), sortOrder: z.number().int().min(0).optional() }).refine(v => Object.keys(v).length > 0), z.object({ id: uuid, imageId: uuid }), empty);
export const inventoryAdjustmentSchema = request(z.object({ type: z.enum([InventoryMovementType.STOCK_IN, InventoryMovementType.RETURN, InventoryMovementType.ADJUSTMENT, InventoryMovementType.DAMAGE, InventoryMovementType.EXPIRY]), quantity, reason: z.string().trim().min(2).max(255).optional() }), idParams, empty);
export const inventorySettingsSchema = request(z.object({ reorderLevel: decimal.nullable() }), idParams, empty);
export const inventoryHistorySchema = request(empty, idParams, z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }));
export const lowStockSchema = request(empty, empty, z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }));

export type ProductListQuery = z.infer<typeof productListSchema>['query'];
export type CreateProductBody = z.infer<typeof createProductSchema>['body'];
export type UpdateProductBody = z.infer<typeof updateProductSchema>['body'];
export type CreateCategoryBody = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>['body'];
export type CreateImageBody = z.infer<typeof createImageSchema>['body'];
export type UpdateImageBody = z.infer<typeof updateImageSchema>['body'];
export type InventoryAdjustmentBody = z.infer<typeof inventoryAdjustmentSchema>['body'];
