'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type SignupDraft = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
};

type SignupContextValue = {
  draft: SignupDraft | null;
  saveDraft: (draft: SignupDraft) => void;
  clearDraft: () => void;
};

const SignupContext = createContext<SignupContextValue | null>(null);

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<SignupDraft | null>(null);
  const saveDraft = useCallback((nextDraft: SignupDraft) => setDraft(nextDraft), []);
  const clearDraft = useCallback(() => setDraft(null), []);
  const value = useMemo(() => ({ draft, saveDraft, clearDraft }), [draft, saveDraft, clearDraft]);

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
}

export function useSignup(): SignupContextValue {
  const context = useContext(SignupContext);
  if (!context) throw new Error('useSignup must be used within SignupProvider.');
  return context;
}
