import type { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { MediaService } from '../services/media.service';
import type { ReorderImagesBody, ProductUploadBody, ProofUploadBody } from '../validators/media.validators';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

const id = (request: Request, name: string) => { const value = request.params[name]; return Array.isArray(value) ? value[0]! : value!; };
const actor = (request: Request) => ({ userId: request.auth!.userId, role: request.auth!.role, requestId: request.requestId });

export class MediaController extends BaseController {
  public constructor(private readonly service: MediaService) { super(); }
  public readonly uploadProductImages: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.CREATED, await this.service.uploadProductImages(id(request, 'id'), (request.files as Express.Multer.File[] | undefined) ?? [], request.body as ProductUploadBody, actor(request))));
  public readonly reorderProductImages: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.reorderProductImages(id(request, 'id'), (request.body as ReorderImagesBody).imageIds, actor(request))));
  public readonly setPrimaryImage: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.setPrimaryImage(id(request, 'id'), id(request, 'imageId'), actor(request))));
  public readonly deleteProductImage: RequestHandler = asyncHandler(async (request, response) => { await this.service.deleteProductImage(id(request, 'id'), id(request, 'imageId'), actor(request)); return sendSuccess(response, HTTP_STATUS.OK, { message: 'Product image deleted.' }); });
  public readonly uploadProfileImage: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.uploadProfileImage(request.file, actor(request))));
  public readonly deleteProfileImage: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.deleteProfileImage(actor(request))));
  public readonly uploadDeliveryProof: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.uploadDeliveryProof(id(request, 'deliveryId'), request.file, request.body as ProofUploadBody, actor(request))));
}
