import { DashboardShell } from '@/components/features/dashboard/dashboard-shell';
import { ProtectedRoute } from '@/components/features/auth/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><DashboardShell>{children}</DashboardShell></ProtectedRoute>;
}
