import { EmailDeliveryStatus, NotificationChannel, NotificationStatus } from '@prisma/client';
import { renderNotification } from '../constants/notification-templates';
import { HTTP_STATUS } from '../constants/application';
import type { NotificationRepository } from '../repositories/notification.repository';
import type { DomainEvent } from '../types/domain-events';
import type { CreateNotificationInput, NotificationActor, NotificationQuery } from '../types/notification';
import { ApiError } from '../utils/api-error';
import { BaseService } from './base.service';
import type { EmailService } from './email.service';
import { createTokenId } from '../utils/token';

export class NotificationService extends BaseService {
  public constructor(private readonly repository: NotificationRepository, private readonly email: EmailService) { super(); }
  public readonly handleEvent = async (event: DomainEvent): Promise<void> => {
    const rendered = renderNotification(event);
    const recipients = await this.repository.findRecipients(event.recipientIds);
    await Promise.all(recipients.map(async recipient => {
      const notification = await this.repository.createFromEvent(recipient.id, event, rendered);
      if (!rendered.channels.includes(NotificationChannel.EMAIL) || notification.emailStatus === EmailDeliveryStatus.SENT) return;
      try { await this.email.sendNotification(recipient.email, rendered.title, rendered.body); await this.repository.markEmailSent(notification.id); }
      catch (error) { const message = error instanceof Error ? error.message : 'Email delivery failed'; await this.repository.markEmailFailed(notification.id, message); }
    }));
  };
  public async create(input: CreateNotificationInput, actor: NotificationActor) { const recipients = await this.repository.findRecipients([input.recipientId]); if (recipients.length !== 1) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'RECIPIENT_NOT_FOUND', 'Notification recipient not found.'); const notification = await this.repository.createManual(createTokenId(), input, actor); if (input.channels.includes(NotificationChannel.EMAIL)) { try { await this.email.sendNotification(notification.user.email, input.title, input.body); await this.repository.markEmailSent(notification.id); } catch (error) { await this.repository.markEmailFailed(notification.id, error instanceof Error ? error.message : 'Email delivery failed'); } } return this.repository.findOwned(notification.id, input.recipientId); }
  public async list(query: NotificationQuery, actor: NotificationActor) { const result = await this.repository.list(actor.userId, query); return { ...result, meta: { ...query, total: result.total, totalPages: Math.ceil(result.total / query.pageSize) } }; }
  public async get(id: string, actor: NotificationActor) { const item = await this.repository.findOwned(id, actor.userId); if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND', 'Notification not found.'); return item; }
  public async updateStatus(id: string, status: NotificationStatus, actor: NotificationActor) { try { return await this.repository.updateStatus(id, status, actor); } catch (error) { this.translate(error); } }
  public markRead(id: string, actor: NotificationActor) { return this.updateStatus(id, NotificationStatus.READ, actor); }
  public markAllRead(actor: NotificationActor) { return this.repository.markAllRead(actor); }
  public async unreadCount(actor: NotificationActor) { return { count: await this.repository.unreadCount(actor.userId) }; }
  public async delete(id: string, actor: NotificationActor): Promise<void> { try { await this.repository.softDelete(id, actor); } catch (error) { this.translate(error); } }
  private translate(error: unknown): never { if (error instanceof Error && error.message === 'NOTIFICATION_NOT_FOUND') throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND', 'Notification not found.'); throw error; }
}
