import { Role } from '@prisma/client';
import { jwtUtility } from '../../src/utils/jwt';
export const testAccessToken = (userId: string, role: Role = Role.BUYER) => jwtUtility.signAccessToken({ userId, role });
export const testRefreshToken = (userId: string, tokenId: string, familyId: string) => jwtUtility.signRefreshToken({ userId, tokenId, familyId });
