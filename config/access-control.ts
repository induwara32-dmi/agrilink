import type { UserRole } from '@/lib/api/types';

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  BUYER: '/buyer',
  FARMER: '/farmer',
  TRANSPORTER: '/transporter',
  ADMIN: '/admin',
};

export function dashboardPathForRole(role: UserRole): string {
  return ROLE_DASHBOARD_PATHS[role];
}

export function requiredRoleForPath(pathname: string): UserRole | null {
  if (pathname === '/buyer' || pathname.startsWith('/buyer/')) return 'BUYER';
  if (pathname === '/farmer' || pathname.startsWith('/farmer/')) return 'FARMER';
  if (pathname === '/transporter' || pathname.startsWith('/transporter/')) return 'TRANSPORTER';
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'ADMIN';
  return null;
}
