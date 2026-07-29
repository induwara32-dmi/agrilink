import type { AuthSession } from './types';

const SESSION_KEY = 'agrilink.auth.session';
let memorySession: AuthSession | null = null;

function storage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function getSession(): AuthSession | null {
  if (memorySession) return memorySession;
  const raw = storage()?.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    memorySession = JSON.parse(raw) as AuthSession;
    return memorySession;
  } catch {
    storage()?.removeItem(SESSION_KEY);
    return null;
  }
}

export function setSession(session: AuthSession): void {
  memorySession = session;
  storage()?.setItem(SESSION_KEY, JSON.stringify(session));
}

export function updateTokens(accessToken: string, refreshToken: string): void {
  const current = getSession();
  if (current) setSession({ ...current, accessToken, refreshToken });
}

export function clearSession(): void {
  memorySession = null;
  storage()?.removeItem(SESSION_KEY);
}
