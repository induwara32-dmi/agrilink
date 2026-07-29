import type { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { CommerceService } from '../services/commerce.service';
import type { CartItemInput, CartItemUpdate, CheckoutInput, CheckoutPreviewInput, CommerceActor } from '../types/commerce';
import type { AddCartItemBody, CheckoutBody, CheckoutPreviewBody, UpdateCartItemBody } from '../validators/commerce.validators';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

const actorFrom = (request: Request): CommerceActor => ({ userId: request.auth!.userId, role: request.auth!.role, requestId: request.requestId });
const parameter = (request: Request, name: string): string => { const value = request.params[name]; return Array.isArray(value) ? value[0]! : value!; };

export class CommerceController extends BaseController {
  public constructor(private readonly service: CommerceService) { super(); }
  public readonly getCart: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.getCart(actorFrom(request))));
  public readonly addItem: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.CREATED, await this.service.addItem(request.body as AddCartItemBody as CartItemInput, actorFrom(request))));
  public readonly updateItem: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateItem(parameter(request, 'itemId'), request.body as UpdateCartItemBody as CartItemUpdate, actorFrom(request))));
  public readonly saveForLater: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateItem(parameter(request, 'itemId'), { savedForLater: true }, actorFrom(request))));
  public readonly removeItem: RequestHandler = asyncHandler(async (request, response) => { await this.service.removeItem(parameter(request, 'itemId'), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, { message: 'Cart item removed.' }); });
  public readonly clearCart: RequestHandler = asyncHandler(async (request, response) => { await this.service.clearCart(actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, { message: 'Cart cleared.' }); });
  public readonly previewCheckout: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.previewCheckout(request.body as CheckoutPreviewBody as CheckoutPreviewInput, actorFrom(request))));
  public readonly checkout: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.CREATED, await this.service.checkout(request.body as CheckoutBody as CheckoutInput, actorFrom(request))));
  public readonly listOrders: RequestHandler = asyncHandler(async (request, response) => { const query = { page: Number(request.query.page), pageSize: Number(request.query.pageSize), ...(typeof request.query.search === 'string' ? { search: request.query.search } : {}), ...(typeof request.query.status === 'string' ? { status: request.query.status as import('@prisma/client').OrderStatus } : {}) }; const result = await this.service.listOrders(query, actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
  public readonly getOrder: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.getOrder(parameter(request, 'orderId'), actorFrom(request))));
  public readonly cancelOrder: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.cancelOrder(parameter(request, 'orderId'), actorFrom(request))));
}
