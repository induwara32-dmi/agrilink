import type { AuthenticatedUser } from './authentication';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedUser;
      requestId: string;
    }
  }
}

export {};
