import type { NotificationChannel, NotificationStatus, NotificationType } from '@prisma/client';

export interface NotificationActor { userId: string; requestId: string }
export interface NotificationQuery { page: number; pageSize: number; status?: NotificationStatus; type?: NotificationType }
export interface CreateNotificationInput { recipientId: string; type: NotificationType; channels: NotificationChannel[]; title: string; body: string; data?: Record<string, string | number | boolean | null> }
