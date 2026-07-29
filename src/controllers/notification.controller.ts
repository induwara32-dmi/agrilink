import type { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { NotificationService } from '../services/notification.service';
import type { CreateNotificationInput, NotificationActor, NotificationQuery } from '../types/notification';
import type { CreateNotificationBody, UpdateNotificationBody } from '../validators/notification.validators';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

const actorFrom = (request: Request): NotificationActor => ({ userId: request.auth!.userId, requestId: request.requestId });
const idFrom = (request: Request): string => { const value = request.params.notificationId; return Array.isArray(value) ? value[0]! : value!; };
export class NotificationController extends BaseController {
  public constructor(private readonly service: NotificationService) { super(); }
  public readonly create: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.CREATED, await this.service.create(request.body as CreateNotificationBody as CreateNotificationInput, actorFrom(request))));
  public readonly list: RequestHandler = asyncHandler(async (request, response) => { const query = request.query as unknown as NotificationQuery; const result = await this.service.list(query, actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
  public readonly get: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.get(idFrom(request), actorFrom(request))));
  public readonly update: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateStatus(idFrom(request), (request.body as UpdateNotificationBody).status, actorFrom(request))));
  public readonly markRead: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.markRead(idFrom(request), actorFrom(request))));
  public readonly markAllRead: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, { updated: await this.service.markAllRead(actorFrom(request)) }));
  public readonly unreadCount: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.unreadCount(actorFrom(request))));
  public readonly delete: RequestHandler = asyncHandler(async (request, response) => { await this.service.delete(idFrom(request), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, { message: 'Notification deleted.' }); });
}
