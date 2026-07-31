import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env';

const response = { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Try again later.' } } as const;

export const apiRateLimit = rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, limit: env.RATE_LIMIT_MAX, standardHeaders: 'draft-8', legacyHeaders: false, message: response, skip: request => request.path === '/health' || request.path === '/readiness' || request.path === '/version' });
export const authRateLimit = rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, limit: env.AUTH_RATE_LIMIT_MAX, standardHeaders: 'draft-8', legacyHeaders: false, message: response });
