import type { RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import { ApiError } from '../utils/api-error';
import { jwtUtility } from '../utils/jwt';

export const authenticate: RequestHandler = (request, _response, next) => {
  const authorization = request.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'AUTHENTICATION_REQUIRED', 'A bearer token is required.'));
    return;
  }

  try {
    const payload = jwtUtility.verifyAccessToken(authorization.slice(7).trim());

    if (payload.type !== 'access') {
      throw new Error('Unexpected token type');
    }

    request.auth = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_ACCESS_TOKEN', 'The access token is invalid or expired.'));
  }
};
