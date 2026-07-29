import type { RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from '../utils/api-error';

export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, 'ROUTE_NOT_FOUND', `Route ${request.method} ${request.path} was not found.`));
};
