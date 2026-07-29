import type { Role } from '@prisma/client';
import type { RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from '../utils/api-error';

export function authorizeRoles(...allowedRoles: readonly Role[]): RequestHandler {
  const allowed = new Set<Role>(allowedRoles);

  return (request, _response, next) => {
    if (!request.auth) {
      next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'));
      return;
    }

    if (!allowed.has(request.auth.role)) {
      next(new ApiError(HTTP_STATUS.FORBIDDEN, 'INSUFFICIENT_ROLE', 'This role cannot access the resource.'));
      return;
    }

    next();
  };
}
