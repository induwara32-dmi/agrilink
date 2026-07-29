import { Router } from 'express';
import type { SystemController } from '../controllers/system.controller';
import { createSystemRouter } from './system.routes';

export function createApiRouter(systemController: SystemController): Router {
  const router = Router();
  router.use(createSystemRouter(systemController));
  return router;
}
