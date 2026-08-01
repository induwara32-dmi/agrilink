import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../src/utils/event-bus';
import { NotificationService } from '../../src/services/notification.service';
import type { NotificationRepository } from '../../src/repositories/notification.repository';
import type { EmailService } from '../../src/services/email.service';
import { validateRequest } from '../../src/middlewares/validation.middleware';
import { loginSchema } from '../../src/validators/auth.validators';
import { errorMiddleware } from '../../src/middlewares/error.middleware';
import { createAuthenticate } from '../../src/middlewares/authentication.middleware';
import type { AuthRepository } from '../../src/repositories/auth.repository';
import { AccountStatus, Role } from '@prisma/client';
import { testAccessToken } from '../utils/jwt';
import { ApiError } from '../../src/utils/api-error';
import { AuthController } from '../../src/controllers/auth.controller';
import type { AuthService } from '../../src/services/auth.service';
import { registerSchema } from '../../src/validators/auth.validators';

describe('event publishing and notification creation', () => {
  it('publishes once with de-duplicated recipients', async () => { const bus = new EventBus(); const handler = vi.fn(); bus.subscribe(['ORDER_CREATED'], handler); await bus.publish({ type: 'ORDER_CREATED', recipientIds: ['one', 'one', 'two'], data: { orderNumber: 'AG-1' } }); expect(handler).toHaveBeenCalledOnce(); expect(handler.mock.calls[0]![0].recipientIds).toEqual(['one', 'two']); });
  it('supports subscriber removal', async () => { const bus = new EventBus(); const handler = vi.fn(); const unsubscribe = bus.subscribe(['ORDER_CREATED'], handler); unsubscribe(); await bus.publish({ type: 'ORDER_CREATED', recipientIds: ['one'] }); expect(handler).not.toHaveBeenCalled(); });
  it('creates an in-app notification and sends its email', async () => {
    const repository = { findRecipients: vi.fn().mockResolvedValue([{ id: 'user-1', email: 'buyer@example.com' }]), createFromEvent: vi.fn().mockResolvedValue({ id: 'notification-1', emailStatus: 'PENDING' }), markEmailSent: vi.fn(), markEmailFailed: vi.fn() };
    const email = { sendNotification: vi.fn().mockResolvedValue(undefined) };
    const service = new NotificationService(repository as unknown as NotificationRepository, email as unknown as EmailService);
    await service.handleEvent({ id: 'event-1', type: 'ORDER_CREATED', recipientIds: ['user-1'], occurredAt: new Date(), data: { orderNumber: 'AG-1' } });
    expect(repository.createFromEvent).toHaveBeenCalledOnce(); expect(email.sendNotification).toHaveBeenCalledWith('buyer@example.com', 'Order created', 'Order AG-1 has been created.'); expect(repository.markEmailSent).toHaveBeenCalledWith('notification-1');
  });
  it('records email failure without rejecting event handling', async () => {
    const repository = { findRecipients: vi.fn().mockResolvedValue([{ id: 'user-1', email: 'buyer@example.com' }]), createFromEvent: vi.fn().mockResolvedValue({ id: 'notification-1', emailStatus: 'PENDING' }), markEmailSent: vi.fn(), markEmailFailed: vi.fn() };
    const email = { sendNotification: vi.fn().mockRejectedValue(new Error('SMTP unavailable')) };
    const service = new NotificationService(repository as unknown as NotificationRepository, email as unknown as EmailService);
    await expect(service.handleEvent({ id: 'event-1', type: 'ORDER_CREATED', recipientIds: ['user-1'], occurredAt: new Date() })).resolves.toBeUndefined();
    expect(repository.markEmailFailed).toHaveBeenCalledWith('notification-1', 'SMTP unavailable');
  });
});

describe('Supertest request pipeline', () => {
  const app = express(); app.use(express.json()); app.post('/login', validateRequest(loginSchema), (req, res) => res.status(200).json({ success: true, data: { email: req.body.email } })); app.use(errorMiddleware);
  it('accepts a validated login request', async () => { const response = await request(app).post('/login').send({ email: 'USER@EXAMPLE.COM', password: 'password' }); expect(response.status).toBe(200); expect(response.body.data.email).toBe('user@example.com'); });
  it('returns a structured validation error', async () => { const response = await request(app).post('/login').send({ email: 'invalid', password: '' }); expect(response.status).toBe(400); expect(response.body.error.code).toBe('VALIDATION_ERROR'); });
});

describe('registration error responses', () => {
  function registrationApp(register: AuthService['register']) {
    const service = { register } as unknown as AuthService;
    const controller = new AuthController(service);
    const app = express();
    app.use(express.json());
    app.post('/register', validateRequest(registerSchema), controller.register);
    app.use(errorMiddleware);
    return app;
  }

  const registration = {
    email: 'existing@example.com',
    password: 'SecurePass1!',
    firstName: 'Existing',
    lastName: 'Buyer',
    role: Role.BUYER,
  };

  it('preserves EMAIL_ALREADY_REGISTERED as HTTP 409 across module boundaries', async () => {
    const duplicateError = Object.assign(new Error('An account already uses this email.'), {
      name: 'ApiError',
      statusCode: 409,
      code: 'EMAIL_ALREADY_REGISTERED',
      isOperational: true,
    });
    const app = registrationApp(vi.fn().mockRejectedValue(duplicateError));

    const response = await request(app).post('/register').send(registration);

    expect(response.status).toBe(409);
    expect(response.body.error).toEqual({
      code: 'EMAIL_ALREADY_REGISTERED',
      message: 'An account already uses this email.',
    });
  });

  it('preserves ordinary ApiError status codes', async () => {
    const app = registrationApp(vi.fn().mockRejectedValue(
      new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'An account already uses this email.'),
    ));

    const response = await request(app).post('/register').send(registration);

    expect(response.status).toBe(409);
  });

  it('returns HTTP 500 only for unexpected exceptions', async () => {
    const app = registrationApp(vi.fn().mockRejectedValue(new Error('database unavailable')));

    const response = await request(app).post('/register').send(registration);

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});

describe('current-user authentication', () => {
  const userId = '11111111-1111-4111-8111-111111111111';
  const repository = { findSafeById: vi.fn().mockResolvedValue({ id: userId, role: Role.BUYER, status: AccountStatus.ACTIVE }) };
  const app = express(); app.get('/me', createAuthenticate(repository as unknown as AuthRepository), (req, res) => res.json({ success: true, data: req.auth })); app.use(errorMiddleware);
  it('returns current authenticated identity', async () => { const response = await request(app).get('/me').set('Authorization', `Bearer ${testAccessToken(userId)}`); expect(response.status).toBe(200); expect(response.body.data.userId).toBe(userId); });
  it('rejects a missing access token', async () => { const response = await request(app).get('/me'); expect(response.status).toBe(401); expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED'); });
});
