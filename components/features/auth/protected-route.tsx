'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { dashboardPathForRole, requiredRoleForPath } from '@/config/access-control';
import type { UserRole } from '@/lib/api/types';
import { useAuth } from '@/providers/auth-provider';

export function ProtectedRoute({ children, role, roles }: { children: React.ReactNode; role?: UserRole; roles?: readonly UserRole[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const requiredRole = role ?? requiredRoleForPath(pathname);
  const isAuthorized = user !== null && (!requiredRole || user.role === requiredRole) && (!roles || roles.includes(user.role));

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/sign-in');
    else if (!isLoading && user && !isAuthorized) router.replace(dashboardPathForRole(user.role));
  }, [isAuthorized, isLoading, router, user]);

  if (isLoading || !isAuthorized) {
    return <div className="p-6" aria-label="Authorizing workspace"><LoadingSkeleton /></div>;
  }
  return children;
}
