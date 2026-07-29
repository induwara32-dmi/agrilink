import type { Response } from 'express';
import type { ApiFailure, ApiSuccess } from '../types/response';

export function sendSuccess<T>(
  response: Response,
  statusCode: number,
  data: T,
  meta?: Record<string, unknown>,
): Response<ApiSuccess<T>> {
  const body: ApiSuccess<T> = meta ? { success: true, data, meta } : { success: true, data };
  return response.status(statusCode).json(body);
}

export function sendError(
  response: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response<ApiFailure> {
  const error = details === undefined ? { code, message } : { code, message, details };
  return response.status(statusCode).json({ success: false, error });
}
