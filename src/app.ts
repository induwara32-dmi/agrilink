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
import { LogisticsController } from './controllers/logistics.controller';
import { NotificationController } from './controllers/notification.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { MediaController } from './controllers/media.controller';
import { createAuthenticate } from './middlewares/authentication.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import { requestContextMiddleware } from './middlewares/request-context.middleware';
import { HealthRepository } from './repositories/health.repository';
import { AuthRepository } from './repositories/auth.repository';
import { CatalogRepository } from './repositories/catalog.repository';
import { InventoryRepository } from './repositories/inventory.repository';
import { CommerceRepository } from './repositories/commerce.repository';
import { LogisticsRepository } from './repositories/logistics.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { MediaRepository } from './repositories/media.repository';
import { createApiRouter } from './routes';
import { SystemService } from './services/system.service';
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.service';
import { CatalogService } from './services/catalog.service';
import { InventoryService } from './services/inventory.service';
import { CommerceService } from './services/commerce.service';
import { LogisticsService } from './services/logistics.service';
import { NotificationService } from './services/notification.service';
import { AnalyticsService } from './services/analytics.service';
import { MemoryAnalyticsCacheService } from './services/analytics-cache.service';
import { MediaService } from './services/media.service';
import { API_PREFIX } from './constants/application';
import { EventBus } from './utils/event-bus';
import { DOMAIN_EVENT_TYPES } from './types/domain-events';

export function createApp(): Express {
  const app = express();
  const healthRepository = new HealthRepository(prisma);
  const systemService = new SystemService(healthRepository);
  const systemController = new SystemController(systemService);
  const emailService = new EmailService();
  const eventBus = new EventBus();
  const notificationService = new NotificationService(new NotificationRepository(prisma), emailService);
  eventBus.subscribe(DOMAIN_EVENT_TYPES, notificationService.handleEvent);
  const notificationController = new NotificationController(notificationService);
  const analyticsController = new AnalyticsController(new AnalyticsService(new AnalyticsRepository(prisma), new MemoryAnalyticsCacheService()));
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository, emailService, eventBus);
  const authController = new AuthController(authService);
  const authenticate = createAuthenticate(authRepository);
  const catalogService = new CatalogService(new CatalogRepository(prisma), eventBus);
  const catalogController = new CatalogController(catalogService);
  const inventoryController = new InventoryController(new InventoryService(new InventoryRepository(prisma), catalogService, eventBus));
  const commerceController = new CommerceController(new CommerceService(new CommerceRepository(prisma), eventBus));
  const logisticsController = new LogisticsController(new LogisticsService(new LogisticsRepository(prisma), eventBus));
  const mediaController = new MediaController(new MediaService(new MediaRepository(prisma)));

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

  app.use(API_PREFIX, createApiRouter(systemController, authController, authenticate, catalogController, inventoryController, commerceController, logisticsController, notificationController, analyticsController, mediaController));
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
