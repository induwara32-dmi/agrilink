import { Role } from '@prisma/client';
import { Router, type RequestHandler } from 'express';
import type { AnalyticsController } from '../controllers/analytics.controller';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { analyticsSchema } from '../validators/analytics.validators';

export function createAnalyticsRouter(controller: AnalyticsController, authenticate: RequestHandler): Router {
  const router = Router();
  router.get('/analytics/buyer', authenticate, authorizeRoles(Role.BUYER), validateRequest(analyticsSchema), controller.buyer);
  router.get('/analytics/farmer', authenticate, authorizeRoles(Role.FARMER), validateRequest(analyticsSchema), controller.farmer);
  router.get('/analytics/transporter', authenticate, authorizeRoles(Role.TRANSPORTER), validateRequest(analyticsSchema), controller.transporter);
  router.get('/analytics/admin', authenticate, authorizeRoles(Role.ADMIN), validateRequest(analyticsSchema), controller.admin);
  return router;
}
