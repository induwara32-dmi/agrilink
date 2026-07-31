import { Role } from '@prisma/client';
import { Router, type RequestHandler } from 'express';
import type { CatalogController } from '../controllers/catalog.controller';
import type { InventoryController } from '../controllers/inventory.controller';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { categoryListSchema, createCategorySchema, createProductSchema, inventoryAdjustmentSchema, inventoryHistorySchema, inventorySettingsSchema, lowStockSchema, productIdSchema, productListSchema, updateCategorySchema, updateProductSchema } from '../validators/catalog.validators';

export function createCatalogRouter(catalog: CatalogController, inventory: InventoryController, authenticate: RequestHandler): Router {
  const router = Router();
  router.get('/products', validateRequest(productListSchema), catalog.listPublic);
  router.get('/search', validateRequest(productListSchema), catalog.listPublic);
  router.get('/products/:id', validateRequest(productIdSchema), catalog.getPublic);
  router.get('/categories', validateRequest(categoryListSchema), catalog.listCategories);
  router.get('/categories/:id', validateRequest(productIdSchema), catalog.getCategory);
  router.get('/management/products', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(productListSchema), catalog.listManaged);
  router.post('/products', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(createProductSchema), catalog.createProduct);
  router.patch('/products/:id', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(updateProductSchema), catalog.updateProduct);
  router.delete('/products/:id', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(productIdSchema), catalog.deleteProduct);
  router.get('/products/:id/inventory', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(productIdSchema), inventory.get);
  router.patch('/products/:id/inventory', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(inventorySettingsSchema), inventory.updateSettings);
  router.post('/products/:id/inventory/adjustments', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(inventoryAdjustmentSchema), inventory.adjust);
  router.get('/products/:id/inventory/history', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(inventoryHistorySchema), inventory.history);
  router.get('/inventory/low-stock', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(lowStockSchema), inventory.lowStock);
  router.get('/admin/categories', authenticate, authorizeRoles(Role.ADMIN), validateRequest(categoryListSchema), catalog.listAdminCategories);
  router.post('/categories', authenticate, authorizeRoles(Role.ADMIN), validateRequest(createCategorySchema), catalog.createCategory);
  router.patch('/categories/:id', authenticate, authorizeRoles(Role.ADMIN), validateRequest(updateCategorySchema), catalog.updateCategory);
  router.delete('/categories/:id', authenticate, authorizeRoles(Role.ADMIN), validateRequest(productIdSchema), catalog.deleteCategory);
  return router;
}
