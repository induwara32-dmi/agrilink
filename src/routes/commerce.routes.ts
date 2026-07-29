import { Role } from '@prisma/client';
import { Router, type RequestHandler } from 'express';
import type { CommerceController } from '../controllers/commerce.controller';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { addCartItemSchema, cartItemSchema, cartSchema, checkoutPreviewSchema, checkoutSchema, orderIdSchema, orderListSchema, updateCartItemSchema } from '../validators/commerce.validators';

export function createCommerceRouter(controller: CommerceController, authenticate: RequestHandler): Router {
  const router = Router();
  const buyer = [authenticate, authorizeRoles(Role.BUYER)] as const;
  router.get('/cart', ...buyer, validateRequest(cartSchema), controller.getCart);
  router.post('/cart/items', ...buyer, validateRequest(addCartItemSchema), controller.addItem);
  router.patch('/cart/items/:itemId', ...buyer, validateRequest(updateCartItemSchema), controller.updateItem);
  router.post('/cart/items/:itemId/save-for-later', ...buyer, validateRequest(cartItemSchema), controller.saveForLater);
  router.delete('/cart/items/:itemId', ...buyer, validateRequest(cartItemSchema), controller.removeItem);
  router.delete('/cart', ...buyer, validateRequest(cartSchema), controller.clearCart);
  router.post('/checkout/preview', ...buyer, validateRequest(checkoutPreviewSchema), controller.previewCheckout);
  router.post('/checkout', ...buyer, validateRequest(checkoutSchema), controller.checkout);
  router.get('/orders', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.ADMIN), validateRequest(orderListSchema), controller.listOrders);
  router.get('/orders/:orderId', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.ADMIN), validateRequest(orderIdSchema), controller.getOrder);
  return router;
}
