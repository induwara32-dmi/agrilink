export class ApiError extends Error {
  public constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly isOperational = true,
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, ApiError);
  }
}
