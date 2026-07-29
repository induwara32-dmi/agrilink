import type { RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { InventoryService } from '../services/inventory.service';
import type { InventoryAdjustmentInput } from '../types/catalog';
import type { InventoryAdjustmentBody } from '../validators/catalog.validators';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { actorFrom } from './catalog.controller';
import { BaseController } from './base.controller';

const productId = (request: Parameters<RequestHandler>[0]): string => {
  const value = request.params.id;
  return Array.isArray(value) ? value[0]! : value!;
};

export class InventoryController extends BaseController {
  public constructor(private readonly service: InventoryService) { super(); }
  public readonly get: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.get(productId(request), actorFrom(request))));
  public readonly adjust: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.adjust(productId(request), request.body as InventoryAdjustmentBody as InventoryAdjustmentInput, actorFrom(request))));
  public readonly updateSettings: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateSettings(productId(request), (request.body as { reorderLevel: string | null }).reorderLevel, actorFrom(request))));
  public readonly history: RequestHandler = asyncHandler(async (request, response) => { const query = { page: Number(request.query.page), pageSize: Number(request.query.pageSize) }; const result = await this.service.history(productId(request), query, actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
  public readonly lowStock: RequestHandler = asyncHandler(async (request, response) => { const query = { page: Number(request.query.page), pageSize: Number(request.query.pageSize) }; const result = await this.service.lowStock(query, actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
}
