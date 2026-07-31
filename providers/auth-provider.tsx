'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '@/lib/api/auth';
import { clearSession, getSession, setSession } from '@/lib/api/session';
import type { AuthUser } from '@/lib/api/types';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getSession()) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }
    getCurrentUser()
      .then((currentUser) => {
        const session = getSession();
        if (session) setSession({ ...session, user: currentUser });
        setUser(currentUser);
      })
      .catch(() => clearSession())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginRequest(email, password);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => { const currentUser = await getCurrentUser(); const session = getSession(); if (session) setSession({ ...session, user: currentUser }); setUser(currentUser); }, []);

  const value = useMemo(() => ({ user, isLoading, login, logout, refreshUser }), [user, isLoading, login, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
