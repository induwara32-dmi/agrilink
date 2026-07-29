import { Router } from 'express';
import type { SystemController } from '../controllers/system.controller';

export function createSystemRouter(controller: SystemController): Router {
  const router = Router();
  router.get('/health', controller.health);
  router.get('/version', controller.version);
  return router;
}
