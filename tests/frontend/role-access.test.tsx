// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { navigationForRole, workspaceLabels } from '../../components/layout/navigation-data';
import { dashboardPathForRole, requiredRoleForPath } from '../../config/access-control';
import type { AuthUser, UserRole } from '../../lib/api/types';

const { replace, navigationState, authState } = vi.hoisted(() => ({
  replace: vi.fn(),
  navigationState: { pathname: '/farmer' },
  authState: { user: null as AuthUser | null, isLoading: false },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigationState.pathname,
  useRouter: () => ({ replace }),
}));
vi.mock('../../providers/auth-provider', () => ({ useAuth: () => authState }));

import { ProtectedRoute } from '../../components/features/auth/protected-route';

const roles: UserRole[] = ['BUYER', 'FARMER', 'TRANSPORTER', 'ADMIN'];
const expectedNavigation: Record<UserRole, string[]> = {
  FARMER: ['Farmer Dashboard', 'Products', 'Inventory', 'Add Product', 'Orders', 'Marketplace', 'Notifications', 'Profile'],
  BUYER: ['Buyer Dashboard', 'Marketplace', 'Cart', 'Orders', 'Wishlist', 'Recently Viewed', 'Notifications', 'Profile'],
  TRANSPORTER: ['Transporter Dashboard', 'Available Jobs', 'Active Deliveries', 'Delivery History', 'Vehicle', 'Earnings', 'Notifications', 'Profile'],
  ADMIN: ['Admin Dashboard', 'Users', 'Categories', 'Products', 'Orders', 'Approvals', 'Analytics', 'Notifications', 'Profile'],
};

function user(role: UserRole): AuthUser {
  return { id: `${role.toLowerCase()}-id`, email: `${role.toLowerCase()}@example.test`, phone: null, role, status: 'ACTIVE', emailVerifiedAt: null, profile: null };
}

describe('role navigation definitions', () => {
  it.each(roles)('contains only the allowed %s navigation items', (role) => {
    expect(navigationForRole(role).map(item => item.label)).toEqual(expectedNavigation[role]);
  });

  it('provides the correct workspace identity for each role', () => {
    expect(workspaceLabels).toEqual({ BUYER: 'Buyer workspace', FARMER: 'Farmer workspace', TRANSPORTER: 'Transporter workspace', ADMIN: 'Admin workspace' });
  });
});

describe('role route policy', () => {
  it.each(roles)('maps %s to its own dashboard', (role) => {
    expect(dashboardPathForRole(role)).toBe(`/${role.toLowerCase()}`);
  });

  it.each(roles.flatMap(role => roles.map(target => [role, target] as const)))('%s access to the %s namespace follows the role boundary', (role, target) => {
    expect(requiredRoleForPath(`/${target.toLowerCase()}/nested`)).toBe(target);
    expect(role === target).toBe(requiredRoleForPath(`/${target.toLowerCase()}`) === role);
  });
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    replace.mockReset();
    navigationState.pathname = '/farmer';
    authState.user = null;
    authState.isLoading = false;
  });
  afterEach(cleanup);

  it('redirects unauthenticated users without rendering protected content', async () => {
    render(<ProtectedRoute><div>Private dashboard</div></ProtectedRoute>);
    expect(screen.queryByText('Private dashboard')).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/auth/sign-in'));
  });

  it.each(roles.flatMap(role => roles.filter(target => target !== role).map(target => [role, target] as const)))('redirects %s away from the %s namespace without flashing content', async (role, target) => {
    authState.user = user(role);
    navigationState.pathname = `/${target.toLowerCase()}`;
    render(<ProtectedRoute><div>Unauthorized dashboard content</div></ProtectedRoute>);
    expect(screen.queryByText('Unauthorized dashboard content')).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith(dashboardPathForRole(role)));
  });

  it('does not render dashboard content while authorization is loading', () => {
    authState.isLoading = true;
    render(<ProtectedRoute><div>Protected dashboard content</div></ProtectedRoute>);
    expect(screen.queryByText('Protected dashboard content')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Authorizing workspace')).toBeVisible();
    expect(replace).not.toHaveBeenCalled();
  });
});
