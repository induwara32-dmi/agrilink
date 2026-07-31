import { Role } from '@prisma/client';
import { Router, type RequestHandler } from 'express';
import type { MediaController } from '../controllers/media.controller';
import { authorizeRoles } from '../middlewares/role.middleware';
import { deliveryProofUpload, productImagesUpload, profileImageUpload } from '../middlewares/upload.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { productImageSchema, productUploadSchema, profileUploadSchema, proofUploadSchema, reorderImagesSchema } from '../validators/media.validators';

export function createMediaRouter(controller: MediaController, authenticate: RequestHandler): Router {
  const router = Router();
  router.post('/products/:id/images', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), productImagesUpload, validateRequest(productUploadSchema), controller.uploadProductImages);
  router.put('/products/:id/images/reorder', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(reorderImagesSchema), controller.reorderProductImages);
  router.patch('/products/:id/images/:imageId/primary', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(productImageSchema), controller.setPrimaryImage);
  router.delete('/products/:id/images/:imageId', authenticate, authorizeRoles(Role.FARMER, Role.ADMIN), validateRequest(productImageSchema), controller.deleteProductImage);
  router.put('/me/avatar', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), profileImageUpload, validateRequest(profileUploadSchema), controller.uploadProfileImage);
  router.delete('/me/avatar', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), controller.deleteProfileImage);
  router.post('/deliveries/:deliveryId/proof', authenticate, authorizeRoles(Role.FARMER, Role.TRANSPORTER), deliveryProofUpload, validateRequest(proofUploadSchema), controller.uploadDeliveryProof);
  return router;
}
