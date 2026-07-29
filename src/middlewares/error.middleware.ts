import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from '../utils/api-error';
import { sendError } from '../utils/response';

export const errorMiddleware: ErrorRequestHandler = (error: unknown, request, response, _next) => {
  void _next;
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          'INTERNAL_SERVER_ERROR',
          'An unexpected error occurred.',
          undefined,
          false,
        );

  const logContext = {
    requestId: request.requestId,
    method: request.method,
    path: request.path,
    statusCode: apiError.statusCode,
    code: apiError.code,
    error,
  };

  if (apiError.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(logContext, apiError.message);
  } else {
    logger.warn(logContext, apiError.message);
  }

  const details = env.NODE_ENV === 'production' && !apiError.isOperational ? undefined : apiError.details;
  sendError(response, apiError.statusCode, apiError.code, apiError.message, details);
};
