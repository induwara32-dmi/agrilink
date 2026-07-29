import { Router, type RequestHandler } from 'express';
import { Role } from '@prisma/client';
import type { NotificationController } from '../controllers/notification.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { createNotificationSchema, listNotificationsSchema, notificationCollectionSchema, notificationSchema, updateNotificationSchema } from '../validators/notification.validators';

export function createNotificationRouter(controller: NotificationController, authenticate: RequestHandler): Router {
  const router = Router();
  router.use('/notifications', authenticate);
  router.get('/notifications', validateRequest(listNotificationsSchema), controller.list);
  router.post('/notifications', authorizeRoles(Role.ADMIN), validateRequest(createNotificationSchema), controller.create);
  router.get('/notifications/unread-count', validateRequest(notificationCollectionSchema), controller.unreadCount);
  router.post('/notifications/mark-all-read', validateRequest(notificationCollectionSchema), controller.markAllRead);
  router.get('/notifications/:notificationId', validateRequest(notificationSchema), controller.get);
  router.patch('/notifications/:notificationId', validateRequest(updateNotificationSchema), controller.update);
  router.post('/notifications/:notificationId/read', validateRequest(notificationSchema), controller.markRead);
  router.delete('/notifications/:notificationId', validateRequest(notificationSchema), controller.delete);
  return router;
}
