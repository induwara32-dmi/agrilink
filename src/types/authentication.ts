import type { Role } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  role: Role;
}

export interface AccessTokenPayload extends AuthenticatedUser {
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}
