import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from '../utils/api-error';
import { sendError } from '../utils/response';
import multer from 'multer';

export const errorMiddleware: ErrorRequestHandler = (error: unknown, request, response, _next) => {
  void _next;
  const apiError = error instanceof multer.MulterError
    ? new ApiError(error.code === 'LIMIT_FILE_SIZE' ? HTTP_STATUS.PAYLOAD_TOO_LARGE : HTTP_STATUS.UNPROCESSABLE_ENTITY, 'UPLOAD_VALIDATION_ERROR', error.code === 'LIMIT_FILE_SIZE' ? 'The selected image exceeds the upload size limit.' : 'The image upload is invalid.', { field: error.field, reason: error.code })
    :
    ApiError.is(error)
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
