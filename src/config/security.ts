import type { CookieOptions } from 'express';
import { env } from './env';

export const corsOrigins = Object.freeze(env.CORS_ORIGIN.split(',').map(origin => origin.trim()));
export const trustProxy = /^\d+$/.test(env.TRUST_PROXY) ? Number(env.TRUST_PROXY) : env.TRUST_PROXY;
export const secureCookieOptions: Readonly<CookieOptions> = Object.freeze({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
});
