'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useAuth } from '@/providers/auth-provider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const requiredRole = pathname.startsWith('/buyer') ? 'BUYER' : pathname.startsWith('/farmer') ? 'FARMER' : pathname.startsWith('/transporter') ? 'TRANSPORTER' : pathname.startsWith('/admin') ? 'ADMIN' : null;

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/sign-in');
    else if (!isLoading && user && requiredRole && user.role !== requiredRole) router.replace(`/${user.role.toLowerCase()}`);
  }, [isLoading, requiredRole, router, user]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    return <div className="p-6"><LoadingSkeleton /></div>;
  }
  return children;
}
