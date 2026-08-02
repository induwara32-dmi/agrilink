import { Suspense } from 'react';
import { DashboardShell } from '@/components/features/dashboard/dashboard-shell';
import { ProtectedRoute } from '@/components/features/auth/protected-route';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><Suspense fallback={<div className="p-6"><LoadingSkeleton /></div>}><DashboardShell>{children}</DashboardShell></Suspense></ProtectedRoute>;
}
