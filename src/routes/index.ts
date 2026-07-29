import { Router } from 'express';
import type { SystemController } from '../controllers/system.controller';
import type { AuthController } from '../controllers/auth.controller';
import type { RequestHandler } from 'express';
import { createAuthRouter } from './auth.routes';
import { createSystemRouter } from './system.routes';

export function createApiRouter(
  systemController: SystemController,
  authController: AuthController,
  authenticate: RequestHandler,
): Router {
  const router = Router();
  router.use(createSystemRouter(systemController));
  router.use('/auth', createAuthRouter(authController, authenticate));
  return router;
}
