import type { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { AnalyticsService } from '../services/analytics.service';
import type { AnalyticsActor, AnalyticsQuery } from '../types/analytics';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

const actorFrom = (request: Request): AnalyticsActor => ({ userId: request.auth!.userId, role: request.auth!.role, requestId: request.requestId });
const queryFrom = (request: Request) => request.query as unknown as AnalyticsQuery;
export class AnalyticsController extends BaseController {
  public constructor(private readonly service: AnalyticsService) { super(); }
  public readonly buyer: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.buyer(queryFrom(request), actorFrom(request))));
  public readonly farmer: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.farmer(queryFrom(request), actorFrom(request))));
  public readonly transporter: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.transporter(queryFrom(request), actorFrom(request))));
  public readonly admin: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.admin(queryFrom(request), actorFrom(request))));
}
