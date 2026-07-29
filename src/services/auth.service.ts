import { AccountStatus, Prisma, Role } from '@prisma/client';
import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/application';
import { toSafeUser, type AuthRepository, type AuthUser, type SafeUser } from '../repositories/auth.repository';
import type { EmailService } from './email.service';
import type { RegisterInput, RequestContext } from '../types/auth-input';
import { ApiError } from '../utils/api-error';
import { jwtUtility } from '../utils/jwt';
import { passwordUtility } from '../utils/password';
import { createOpaqueToken, createTokenId, durationFromNow, hashToken } from '../utils/token';
import { BaseService } from './base.service';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends TokenPair {
  user: SafeUser;
}

function ensureLoginAllowed(user: AuthUser): void {
  if (user.deletedAt || user.status === AccountStatus.DISABLED || user.status === AccountStatus.SUSPENDED) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'ACCOUNT_UNAVAILABLE', 'This account is not available.');
  }
  if (!user.emailVerifiedAt || user.status === AccountStatus.PENDING_VERIFICATION) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'EMAIL_NOT_VERIFIED', 'Verify your email before signing in.');
  }
}

export class AuthService extends BaseService {
  public constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  public async register(input: RegisterInput): Promise<SafeUser> {
    if (![Role.BUYER, Role.FARMER, Role.TRANSPORTER].includes(input.role)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'ROLE_NOT_REGISTERABLE', 'This role cannot use public registration.');
    }
    if (input.role === Role.FARMER && !input.farmName) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'FARM_NAME_REQUIRED', 'Farm name is required for farmers.');
    }
    if (await this.authRepository.findByEmail(input.email)) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'EMAIL_ALREADY_REGISTERED', 'An account already uses this email.');
    }

    const rawVerificationToken = createOpaqueToken();
    const passwordHash = await passwordUtility.hash(input.password);

    try {
      const user = await this.authRepository.createUser(
        input,
        passwordHash,
        hashToken(rawVerificationToken),
        durationFromNow(env.EMAIL_VERIFICATION_EXPIRES_IN),
      );
      await this.emailService.sendEmailVerification(user.email, rawVerificationToken);
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'ACCOUNT_CONFLICT', 'The email or phone is already registered.');
      }
      throw error;
    }
  }

  public async login(email: string, password: string, context: RequestContext): Promise<AuthResult> {
    const user = await this.authRepository.findByEmail(email);
    const passwordMatches = user ? await passwordUtility.verify(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }

    ensureLoginAllowed(user);
    await this.authRepository.updateLastLogin(user.id);
    const tokens = await this.createSession(user.id, user.role, context);
    return { user: toSafeUser(user), ...tokens };
  }

  public async logout(refreshToken: string, context: RequestContext): Promise<void> {
    try {
      const payload = jwtUtility.verifyRefreshToken(refreshToken);
      const stored = await this.authRepository.findRefreshToken(payload.tokenId);
      if (stored && stored.tokenHash === hashToken(refreshToken)) {
        await this.authRepository.revokeRefreshToken(stored.id, context.ipAddress);
      }
    } catch {
      // Logout is idempotent and does not reveal token validity.
    }
  }

  public async refresh(refreshToken: string, context: RequestContext): Promise<TokenPair> {
    let payload;
    try {
      payload = jwtUtility.verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN', 'The refresh token is invalid or expired.');
    }

    const stored = await this.authRepository.findRefreshToken(payload.tokenId);
    if (!stored || stored.tokenHash !== hashToken(refreshToken) || stored.familyId !== payload.familyId) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN', 'The refresh token is invalid or expired.');
    }

    if (stored.revokedAt) {
      await this.authRepository.revokeRefreshFamily(stored.familyId, context.ipAddress);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'REFRESH_TOKEN_REUSED', 'The session has been revoked.');
    }

    ensureLoginAllowed(stored.user);
    const replacementId = createTokenId();
    const replacementToken = jwtUtility.signRefreshToken({
      userId: stored.userId,
      tokenId: replacementId,
      familyId: stored.familyId,
    });
    const rotated = await this.authRepository.rotateRefreshToken(
      stored.id,
      {
        id: replacementId,
        userId: stored.userId,
        familyId: stored.familyId,
        tokenHash: hashToken(replacementToken),
        expiresAt: durationFromNow(env.JWT_REFRESH_EXPIRES_IN),
        ...(context.ipAddress ? { createdByIp: context.ipAddress } : {}),
        ...(context.userAgent ? { userAgent: context.userAgent } : {}),
      },
      context.ipAddress,
    );

    if (!rotated) {
      await this.authRepository.revokeRefreshFamily(stored.familyId, context.ipAddress);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'REFRESH_TOKEN_REUSED', 'The session has been revoked.');
    }

    return {
      accessToken: jwtUtility.signAccessToken({ userId: stored.userId, role: stored.user.role }),
      refreshToken: replacementToken,
    };
  }

  public async verifyEmail(token: string): Promise<SafeUser> {
    const user = await this.authRepository.verifyEmail(hashToken(token));
    if (!user) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_VERIFICATION_TOKEN', 'The verification token is invalid or expired.');
    }
    return user;
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);
    if (!user || user.deletedAt || user.status === AccountStatus.DISABLED) return;

    const rawToken = createOpaqueToken();
    await this.authRepository.createPasswordResetToken(
      user.id,
      hashToken(rawToken),
      durationFromNow(env.PASSWORD_RESET_EXPIRES_IN),
    );
    await this.emailService.sendPasswordReset(user.email, rawToken);
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    const passwordHash = await passwordUtility.hash(password);
    const reset = await this.authRepository.resetPassword(hashToken(token), passwordHash);
    if (!reset) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'INVALID_RESET_TOKEN', 'The reset token is invalid or expired.');
    }
  }

  public async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await this.authRepository.findSafeById(userId);
    if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND', 'The current user was not found.');
    return user;
  }

  private async createSession(userId: string, role: Role, context: RequestContext): Promise<TokenPair> {
    const tokenId = createTokenId();
    const familyId = createTokenId();
    const refreshToken = jwtUtility.signRefreshToken({ userId, tokenId, familyId });
    await this.authRepository.createRefreshToken({
      id: tokenId,
      userId,
      familyId,
      tokenHash: hashToken(refreshToken),
      expiresAt: durationFromNow(env.JWT_REFRESH_EXPIRES_IN),
      ...(context.ipAddress ? { createdByIp: context.ipAddress } : {}),
      ...(context.userAgent ? { userAgent: context.userAgent } : {}),
    });
    return { accessToken: jwtUtility.signAccessToken({ userId, role }), refreshToken };
  }
}
