import { clearSession, getSession, updateTokens } from './session';
import type { ApiFailure, ApiSuccess } from './types';

const API_URL = 'https://agrilink-production-599d.up.railway.app/api/v1';
export class ApiClientError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
};

let refreshRequest: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const session = getSession();
  if (!session?.refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!response.ok) {
      clearSession();
      return false;
    }
    const payload = (await response.json()) as ApiSuccess<{ accessToken: string; refreshToken: string }>;
    updateTokens(payload.data.accessToken, payload.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiSuccess<T>> {
  const { body, authenticated = false, retryOnUnauthorized = true, headers, ...requestInit } = options;
  const session = authenticated ? getSession() : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestInit,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401 && authenticated && retryOnUnauthorized) {
    refreshRequest ??= refreshSession().finally(() => {
      refreshRequest = null;
    });
    if (await refreshRequest) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;
  if (!response.ok || !payload || !payload.success) {
    const failure = payload && !payload.success ? payload.error : null;
    throw new ApiClientError(failure?.message ?? 'Unable to complete the request.', response.status, failure?.code ?? 'REQUEST_FAILED', failure?.details);
  }
  return payload;
}

export function apiUpload<T>(path: string, method: 'POST' | 'PUT', body: FormData, onProgress?: (percent: number) => void, retryOnUnauthorized = true): Promise<ApiSuccess<T>> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method, `${API_URL}${path}`);
    request.setRequestHeader('Accept', 'application/json');
    const session = getSession();
    if (session?.accessToken) request.setRequestHeader('Authorization', `Bearer ${session.accessToken}`);
    request.upload.addEventListener('progress', event => { if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100)); });
    request.addEventListener('load', async () => {
      if (request.status === 401 && retryOnUnauthorized && await refreshSession()) {
        apiUpload<T>(path, method, body, onProgress, false).then(resolve, reject);
        return;
      }
      let payload: ApiSuccess<T> | ApiFailure | null = null;
      try { payload = JSON.parse(request.responseText) as ApiSuccess<T> | ApiFailure; } catch { /* handled below */ }
      if (request.status < 200 || request.status >= 300 || !payload || !payload.success) { const failure = payload && !payload.success ? payload.error : null; reject(new ApiClientError(failure?.message ?? 'Unable to upload the image.', request.status, failure?.code ?? 'UPLOAD_FAILED', failure?.details)); return; }
      resolve(payload);
    });
    request.addEventListener('error', () => reject(new ApiClientError('The upload connection failed.', 0, 'NETWORK_ERROR')));
    request.send(body);
  });
}
