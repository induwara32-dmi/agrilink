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

  /**
   * Recognize operational API errors even when the runtime has loaded more than
   * one copy of this module. `instanceof` alone is not reliable across module
   * or JavaScript realm boundaries.
   */
  public static is(error: unknown): error is ApiError {
    if (error instanceof ApiError) return true;
    if (!(error instanceof Error) || error.name !== 'ApiError') return false;

    const candidate = error as Error & Partial<ApiError>;
    return Number.isInteger(candidate.statusCode)
      && candidate.statusCode !== undefined
      && candidate.statusCode >= 400
      && candidate.statusCode <= 599
      && typeof candidate.code === 'string'
      && candidate.code.length > 0
      && candidate.isOperational === true;
  }
}
