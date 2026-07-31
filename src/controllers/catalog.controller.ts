import type { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { CatalogService } from '../services/catalog.service';
import type { Actor, CategoryInput, CategoryUpdateInput, ProductInput, ProductQuery, ProductUpdateInput } from '../types/catalog';
import type { CreateCategoryBody, CreateProductBody, ProductListQuery, UpdateCategoryBody, UpdateProductBody } from '../validators/catalog.validators';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

export function actorFrom(request: Request): Actor { return { userId: request.auth!.userId, role: request.auth!.role, requestId: request.requestId }; }
const pathParameter = (request: Request, name: string): string => {
  const value = request.params[name];
  return Array.isArray(value) ? value[0]! : value!;
};
const productQuery = (query: ProductListQuery): ProductQuery => ({ page: query.page, pageSize: query.pageSize, sort: query.sort, ...(query.search ? { search: query.search } : {}), ...(query.categoryId ? { categoryId: query.categoryId } : {}), ...(query.farmerId ? { farmerId: query.farmerId } : {}), ...(query.status ? { status: query.status } : {}), ...(query.minPrice ? { minPrice: query.minPrice } : {}), ...(query.maxPrice ? { maxPrice: query.maxPrice } : {}) });

export class CatalogController extends BaseController {
  public constructor(private readonly service: CatalogService) { super(); }
  public readonly listPublic: RequestHandler = asyncHandler(async (request, response) => { const result = await this.service.listPublic(productQuery(request.query as unknown as ProductListQuery)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
  public readonly listManaged: RequestHandler = asyncHandler(async (request, response) => { const result = await this.service.listManaged(productQuery(request.query as unknown as ProductListQuery), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
  public readonly getPublic: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.getPublic(pathParameter(request, 'id'))));
  public readonly getCategory: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.getCategory(pathParameter(request, 'id'))));
  public readonly createProduct: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.CREATED, await this.service.createProduct(request.body as CreateProductBody as ProductInput, actorFrom(request))));
  public readonly updateProduct: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateProduct(pathParameter(request, 'id'), request.body as UpdateProductBody as ProductUpdateInput, actorFrom(request))));
  public readonly deleteProduct: RequestHandler = asyncHandler(async (request, response) => { await this.service.deleteProduct(pathParameter(request, 'id'), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, { message: 'Product archived.' }); });
  public readonly listCategories: RequestHandler = asyncHandler(async (_request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.listCategories(false)));
  public readonly listAdminCategories: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.listCategories(String(request.query.includeInactive) === 'true', actorFrom(request))));
  public readonly createCategory: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.CREATED, await this.service.createCategory(request.body as CreateCategoryBody as CategoryInput, actorFrom(request))));
  public readonly updateCategory: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateCategory(pathParameter(request, 'id'), request.body as UpdateCategoryBody as CategoryUpdateInput, actorFrom(request))));
  public readonly deleteCategory: RequestHandler = asyncHandler(async (request, response) => { await this.service.deleteCategory(pathParameter(request, 'id'), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, { message: 'Category archived.' }); });
}
