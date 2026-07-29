import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from '../utils/api-error';

interface RequestInput {
  body: unknown;
  params: unknown;
  query: unknown;
}

export function validateRequest(schema: ZodType<RequestInput>): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse({ body: request.body, params: request.params, query: request.query });

    if (!result.success) {
      next(
        new ApiError(
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          'VALIDATION_ERROR',
          'The request data is invalid.',
          result.error.flatten(),
        ),
      );
      return;
    }

    request.body = result.data.body;
    next();
  };
}
