import { AccountStatus, type Prisma, type PrismaClient, type RefreshToken } from '@prisma/client';
import type { RegisterInput } from '../types/auth-input';
import { BaseRepository } from './base.repository';

const userInclude = {
  profile: true,
  buyerProfile: true,
  farmerProfile: true,
  transporterProfile: true,
  adminProfile: true,
} satisfies Prisma.UserInclude;

export type AuthUser = Prisma.UserGetPayload<{ include: typeof userInclude }>;
export type SafeUser = Omit<AuthUser, 'passwordHash'>;

export function toSafeUser(user: AuthUser): SafeUser {
  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  return safeUser;
}

export interface StoredRefreshToken extends RefreshToken {
  user: AuthUser;
}

export class AuthRepository extends BaseRepository {
  public constructor(database: PrismaClient) {
    super(database);
  }

  public findByEmail(email: string): Promise<AuthUser | null> {
    return this.database.user.findUnique({ where: { email }, include: userInclude });
  }

  public async findSafeById(userId: string): Promise<SafeUser | null> {
    const user = await this.database.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: userInclude,
    });
    return user ? toSafeUser(user) : null;
  }

  public async createUser(
    input: RegisterInput,
    passwordHash: string,
    verificationTokenHash: string,
    verificationExpiresAt: Date,
  ): Promise<SafeUser> {
    const roleProfile =
      input.role === 'BUYER'
        ? { buyerProfile: { create: {} } }
        : input.role === 'FARMER'
          ? { farmerProfile: { create: { farmName: input.farmName ?? '' } } }
          : {
              transporterProfile: {
                create: { ...(input.businessName ? { businessName: input.businessName } : {}) },
              },
            };

    const data: Prisma.UserCreateInput = {
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      passwordHash,
      role: input.role,
      profile: { create: { firstName: input.firstName, lastName: input.lastName } },
      ...roleProfile,
      emailVerificationTokens: {
        create: { tokenHash: verificationTokenHash, expiresAt: verificationExpiresAt },
      },
    };

    const user: AuthUser = await this.database.user.create({
      data,
      include: userInclude,
    });
    return toSafeUser(user);
  }

  public async updateLastLogin(userId: string): Promise<void> {
    await this.database.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  }

  public createRefreshToken(data: {
    id: string;
    userId: string;
    familyId: string;
    tokenHash: string;
    expiresAt: Date;
    createdByIp?: string;
    userAgent?: string;
  }): Promise<RefreshToken> {
    return this.database.refreshToken.create({ data });
  }

  public findRefreshToken(id: string): Promise<StoredRefreshToken | null> {
    return this.database.refreshToken.findUnique({ where: { id }, include: { user: { include: userInclude } } });
  }

  public async rotateRefreshToken(
    currentId: string,
    replacement: {
      id: string;
      userId: string;
      familyId: string;
      tokenHash: string;
      expiresAt: Date;
      createdByIp?: string;
      userAgent?: string;
    },
    revokedByIp?: string,
  ): Promise<boolean> {
    return this.database.$transaction(async (transaction) => {
      const revoked = await transaction.refreshToken.updateMany({
        where: { id: currentId, revokedAt: null, expiresAt: { gt: new Date() } },
        data: { revokedAt: new Date(), ...(revokedByIp ? { revokedByIp } : {}) },
      });
      if (revoked.count !== 1) return false;

      await transaction.refreshToken.create({ data: replacement });
      await transaction.refreshToken.update({ where: { id: currentId }, data: { replacedById: replacement.id } });
      return true;
    });
  }

  public async revokeRefreshToken(id: string, revokedByIp?: string): Promise<void> {
    await this.database.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date(), ...(revokedByIp ? { revokedByIp } : {}) },
    });
  }

  public async revokeRefreshFamily(familyId: string, revokedByIp?: string): Promise<void> {
    await this.database.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date(), ...(revokedByIp ? { revokedByIp } : {}) },
    });
  }

  public async verifyEmail(tokenHash: string): Promise<SafeUser | null> {
    return this.database.$transaction(async (transaction) => {
      const token = await transaction.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });
      if (
        !token ||
        token.consumedAt ||
        token.expiresAt <= new Date() ||
        token.user.deletedAt ||
        token.user.status !== AccountStatus.PENDING_VERIFICATION
      ) return null;

      const consumed = await transaction.emailVerificationToken.updateMany({
        where: { id: token.id, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      if (consumed.count !== 1) return null;

      const user = await transaction.user.update({
        where: { id: token.userId },
        data: { emailVerifiedAt: new Date(), status: AccountStatus.ACTIVE },
        include: userInclude,
      });
      await transaction.emailVerificationToken.updateMany({
        where: { userId: token.userId, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      return toSafeUser(user);
    });
  }

  public async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.database.$transaction([
      this.database.passwordResetToken.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.database.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } }),
    ]);
  }

  public async resetPassword(tokenHash: string, passwordHash: string): Promise<boolean> {
    return this.database.$transaction(async (transaction) => {
      const token = await transaction.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });
      if (
        !token ||
        token.consumedAt ||
        token.expiresAt <= new Date() ||
        token.user.deletedAt ||
        token.user.status === AccountStatus.DISABLED
      ) return false;

      const consumed = await transaction.passwordResetToken.updateMany({
        where: { id: token.id, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      if (consumed.count !== 1) return false;

      await transaction.user.update({ where: { id: token.userId }, data: { passwordHash } });
      await transaction.passwordResetToken.updateMany({
        where: { userId: token.userId, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      await transaction.refreshToken.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return true;
    });
  }
}
