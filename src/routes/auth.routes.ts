import { Router, type RequestHandler } from 'express';
import type { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validators';

export function createAuthRouter(controller: AuthController, authenticate: RequestHandler): Router {
  const router = Router();
  router.post('/register', validateRequest(registerSchema), controller.register);
  router.post('/login', validateRequest(loginSchema), controller.login);
  router.post('/logout', validateRequest(logoutSchema), controller.logout);
  router.post('/refresh', validateRequest(refreshSchema), controller.refresh);
  router.post('/verify-email', validateRequest(verifyEmailSchema), controller.verifyEmail);
  router.post('/forgot-password', validateRequest(forgotPasswordSchema), controller.forgotPassword);
  router.post('/reset-password', validateRequest(resetPasswordSchema), controller.resetPassword);
  router.get('/me', authenticate, controller.currentUser);
  return router;
}
