import { NotificationChannel, NotificationStatus, NotificationType } from '@prisma/client';
import { z } from 'zod';

const empty = z.object({}).strict();
const request = <B extends z.ZodType, P extends z.ZodType, Q extends z.ZodType>(body: B, params: P, query: Q) => z.object({ body, params, query });
const params = z.object({ notificationId: z.string().uuid() });
export const listNotificationsSchema = request(empty, empty, z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20), status: z.nativeEnum(NotificationStatus).optional(), type: z.nativeEnum(NotificationType).optional() }));
export const notificationSchema = request(empty, params, empty);
export const updateNotificationSchema = request(z.object({ status: z.nativeEnum(NotificationStatus) }), params, empty);
export const notificationCollectionSchema = request(empty, empty, empty);
export const createNotificationSchema = request(z.object({ recipientId: z.string().uuid(), type: z.nativeEnum(NotificationType), channels: z.array(z.nativeEnum(NotificationChannel)).min(1).transform(channels => [...new Set(channels)]), title: z.string().trim().min(2).max(180).regex(/^[^\r\n]+$/, 'Title must be one line.'), body: z.string().trim().min(2).max(10_000), data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional() }), empty, empty);
export type UpdateNotificationBody = z.infer<typeof updateNotificationSchema>['body'];
export type CreateNotificationBody = z.infer<typeof createNotificationSchema>['body'];
