import type { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { AuthService } from '../services/auth.service';
import type { RequestContext } from '../types/auth-input';
import type {
  ForgotPasswordBody,
  LoginBody,
  RefreshBody,
  RegisterBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from '../validators/auth.validators';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

function requestContext(request: Request): RequestContext {
  const userAgent = request.header('user-agent');
  return {
    ...(request.ip ? { ipAddress: request.ip } : {}),
    ...(userAgent ? { userAgent: userAgent.slice(0, 500) } : {}),
  };
}

export class AuthController extends BaseController {
  public constructor(private readonly authService: AuthService) {
    super();
  }

  public readonly register: RequestHandler = asyncHandler(async (request, response) => {
    const body = request.body as RegisterBody;
    const user = await this.authService.register({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      ...(body.phone ? { phone: body.phone } : {}),
      ...(body.farmName ? { farmName: body.farmName } : {}),
      ...(body.businessName ? { businessName: body.businessName } : {}),
    });
    return sendSuccess(response, HTTP_STATUS.CREATED, { user, message: 'Check your email to verify your account.' });
  });

  public readonly login: RequestHandler = asyncHandler(async (request, response) => {
    const body = request.body as LoginBody;
    return sendSuccess(
      response,
      HTTP_STATUS.OK,
      await this.authService.login(body.email, body.password, requestContext(request)),
    );
  });

  public readonly logout: RequestHandler = asyncHandler(async (request, response) => {
    const body = request.body as RefreshBody;
    await this.authService.logout(body.refreshToken, requestContext(request));
    return sendSuccess(response, HTTP_STATUS.OK, { message: 'Logged out successfully.' });
  });

  public readonly refresh: RequestHandler = asyncHandler(async (request, response) => {
    const body = request.body as RefreshBody;
    return sendSuccess(
      response,
      HTTP_STATUS.OK,
      await this.authService.refresh(body.refreshToken, requestContext(request)),
    );
  });

  public readonly verifyEmail: RequestHandler = asyncHandler(async (request, response) => {
    const body = request.body as VerifyEmailBody;
    return sendSuccess(response, HTTP_STATUS.OK, { user: await this.authService.verifyEmail(body.token) });
  });

  public readonly forgotPassword: RequestHandler = asyncHandler(async (request, response) => {
    const body = request.body as ForgotPasswordBody;
    await this.authService.forgotPassword(body.email);
    return sendSuccess(response, HTTP_STATUS.OK, {
      message: 'If the account exists, password reset instructions have been sent.',
    });
  });

  public readonly resetPassword: RequestHandler = asyncHandler(async (request, response) => {
    const body = request.body as ResetPasswordBody;
    await this.authService.resetPassword(body.token, body.password);
    return sendSuccess(response, HTTP_STATUS.OK, { message: 'Password reset successfully.' });
  });

  public readonly currentUser: RequestHandler = asyncHandler(async (request, response) => {
    return sendSuccess(response, HTTP_STATUS.OK, {
      user: await this.authService.getCurrentUser(request.auth!.userId),
    });
  });
}
