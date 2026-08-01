import { apiRequest } from './client';
import { clearSession, getSession, setSession } from './session';
import type { AuthSession, AuthUser } from './types';

export type PublicRegistrationRole = 'BUYER' | 'FARMER' | 'TRANSPORTER';

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: PublicRegistrationRole;
  farmName?: string;
  businessName?: string;
};

export async function register(input: RegistrationInput): Promise<{ user: AuthUser; message: string }> {
  const response = await apiRequest<{ user: AuthUser; message: string }>('/auth/register', {
    method: 'POST',
    body: input,
  });
  return response.data;
}

export async function verifyEmail(token: string): Promise<AuthUser> {
  const response = await apiRequest<{ user: AuthUser }>('/auth/verify-email', {
    method: 'POST',
    body: { token },
  });
  return response.data.user;
}

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
