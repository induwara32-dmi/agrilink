import type { RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { SystemService } from '../services/system.service';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

export class SystemController extends BaseController {
  public constructor(private readonly systemService: SystemService) {
    super();
  }

  public readonly health: RequestHandler = asyncHandler(async (_request, response) => {
    const health = await this.systemService.getHealth();
    const statusCode = health.status === 'ok' ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;
    return sendSuccess(response, statusCode, health);
  });

  public readonly version: RequestHandler = (_request, response) => {
    return sendSuccess(response, HTTP_STATUS.OK, this.systemService.getVersion());
  };
}
