import { AccountStatus } from '@prisma/client';
import type { RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { AuthRepository } from '../repositories/auth.repository';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { jwtUtility } from '../utils/jwt';

export function createAuthenticate(authRepository: AuthRepository): RequestHandler {
  return asyncHandler(async (request, _response, next) => {
    const authorization = request.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'AUTHENTICATION_REQUIRED', 'A bearer token is required.');
    }

    try {
      const payload = jwtUtility.verifyAccessToken(authorization.slice(7).trim());
      const user = await authRepository.findSafeById(payload.userId);

      if (!user || user.status !== AccountStatus.ACTIVE || user.role !== payload.role) {
        throw new Error('Account is unavailable');
      }

      request.auth = { userId: user.id, role: user.role };
      next();
    } catch {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_ACCESS_TOKEN', 'The access token is invalid or expired.');
    }
  });
}
