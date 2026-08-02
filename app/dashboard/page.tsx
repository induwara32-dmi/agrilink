'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { dashboardPathForRole } from '@/config/access-control';
import { useAuth } from '@/providers/auth-provider';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? dashboardPathForRole(user.role) : '/auth/sign-in');
  }, [isLoading, router, user]);

  return <main className="p-6" aria-label="Authorizing workspace"><LoadingSkeleton /></main>;
}
