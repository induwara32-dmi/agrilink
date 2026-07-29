import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { prisma } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';
import { SystemController } from './controllers/system.controller';
import { AuthController } from './controllers/auth.controller';
import { CatalogController } from './controllers/catalog.controller';
import { InventoryController } from './controllers/inventory.controller';
import { CommerceController } from './controllers/commerce.controller';
import { createAuthenticate } from './middlewares/authentication.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import { requestContextMiddleware } from './middlewares/request-context.middleware';
import { HealthRepository } from './repositories/health.repository';
import { AuthRepository } from './repositories/auth.repository';
import { CatalogRepository } from './repositories/catalog.repository';
import { InventoryRepository } from './repositories/inventory.repository';
import { CommerceRepository } from './repositories/commerce.repository';
import { createApiRouter } from './routes';
import { SystemService } from './services/system.service';
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.service';
import { CatalogService } from './services/catalog.service';
import { InventoryService } from './services/inventory.service';
import { CommerceService } from './services/commerce.service';
import { API_PREFIX } from './constants/application';

export function createApp(): Express {
  const app = express();
  const healthRepository = new HealthRepository(prisma);
  const systemService = new SystemService(healthRepository);
  const systemController = new SystemController(systemService);
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository, new EmailService());
  const authController = new AuthController(authService);
  const authenticate = createAuthenticate(authRepository);
  const catalogService = new CatalogService(new CatalogRepository(prisma));
  const catalogController = new CatalogController(catalogService);
  const inventoryController = new InventoryController(new InventoryService(new InventoryRepository(prisma), catalogService));
  const commerceController = new CommerceController(new CommerceService(new CommerceRepository(prisma)));

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(requestContextMiddleware);
  app.use(
    pinoHttp({
      logger,
      customProps: (request) => ({
        requestId:
          'requestId' in request && typeof request.requestId === 'string' ? request.requestId : undefined,
      }),
    }),
  );
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()), credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  app.use(API_PREFIX, createApiRouter(systemController, authController, authenticate, catalogController, inventoryController, commerceController));
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
