import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const requestContextMiddleware: RequestHandler = (request, response, next) => {
  const incomingRequestId = request.header('x-request-id')?.trim();
  request.requestId = incomingRequestId || randomUUID();
  response.setHeader('x-request-id', request.requestId);
  next();
};
