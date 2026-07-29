import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/authentication';

function signToken<TPayload extends object>(
  payload: TPayload,
  secret: string,
  expiresIn: NonNullable<SignOptions['expiresIn']>,
): string {
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn });
}

export const jwtUtility = {
  signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
    return signToken(
      { ...payload, type: 'access' as const },
      env.JWT_ACCESS_SECRET,
      env.JWT_ACCESS_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
    );
  },

  signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
    return signToken(
      { ...payload, type: 'refresh' as const },
      env.JWT_REFRESH_SECRET,
      env.JWT_REFRESH_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
    );
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as AccessTokenPayload;
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as RefreshTokenPayload;
  },
};
