'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/providers/auth-provider';
import { SignupProvider } from '@/providers/signup-provider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SignupProvider>{children}</SignupProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
