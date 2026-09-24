import { Role } from '@prisma/client';
import { Router, type RequestHandler } from 'express';
import type { AccountController } from '../controllers/account.controller';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createAddressSchema, listAddressesSchema, updateAddressSchema, updateProfileSchema } from '../validators/account.validators';

export function createAccountRouter(controller: AccountController, authenticate: RequestHandler): Router {
  const router = Router();
  const anyRole = [authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER)] as const;
  router.get('/addresses', ...anyRole, validateRequest(listAddressesSchema), controller.listAddresses);
  router.post('/addresses', ...anyRole, validateRequest(createAddressSchema), controller.createAddress);
  router.patch('/addresses/:addressId', ...anyRole, validateRequest(updateAddressSchema), controller.updateAddress);
  router.patch('/profile', ...anyRole, validateRequest(updateProfileSchema), controller.updateProfile);
  return router;
}
