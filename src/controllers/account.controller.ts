import type { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { AccountService } from '../services/account.service';
import type { AccountActor, AddressInput, AddressUpdateInput, ProfileUpdateInput } from '../types/account';
import type { CreateAddressBody, UpdateAddressBody, UpdateProfileBody } from '../validators/account.validators';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

const actorFrom = (request: Request): AccountActor => ({ userId: request.auth!.userId, role: request.auth!.role, requestId: request.requestId });
const parameter = (request: Request, name: string): string => { const value = request.params[name]; return Array.isArray(value) ? value[0]! : value!; };

export class AccountController extends BaseController {
  public constructor(private readonly service: AccountService) { super(); }
  public readonly listAddresses: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.listAddresses(actorFrom(request))));
  public readonly createAddress: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.CREATED, await this.service.createAddress(request.body as CreateAddressBody as AddressInput, actorFrom(request))));
  public readonly updateAddress: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateAddress(parameter(request, 'addressId'), request.body as UpdateAddressBody as AddressUpdateInput, actorFrom(request))));
  public readonly updateProfile: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateProfile(request.body as UpdateProfileBody as ProfileUpdateInput, actorFrom(request))));
}
