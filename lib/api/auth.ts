import { apiRequest } from './client';
import { clearSession, getSession, setSession } from './session';
import type { AuthSession, AuthUser } from './types';

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setSession(response.data);
  return response.data;
}

export async function logout(): Promise<void> {
  const session = getSession();
  try {
    if (session?.refreshToken) {
      await apiRequest<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: { refreshToken: session.refreshToken },
      });
    }
  } finally {
    clearSession();
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<{ user: AuthUser }>('/auth/me', { authenticated: true });
  return response.data.user;
}
