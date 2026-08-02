import type { UserRole } from '@/lib/api/types';

export const siteNavItems = [
  { label: 'Features', href: '/#features' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Why AgriLink', href: '/#why-agrilink' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export type DashboardNavigationItem =
  | { label: string; href: string; action?: never }
  | { label: string; action: 'profile'; href?: never };

export const dashboardNavigationByRole: Record<UserRole, readonly DashboardNavigationItem[]> = {
  FARMER: [
    { label: 'Farmer Dashboard', href: '/farmer' },
    { label: 'Products', href: '/farmer/products' },
    { label: 'Inventory', href: '/farmer/inventory' },
    { label: 'Add Product', href: '/farmer/products/new' },
    { label: 'Orders', href: '/orders' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Profile', action: 'profile' },
  ],
  BUYER: [
    { label: 'Buyer Dashboard', href: '/buyer' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Cart', href: '/cart' },
    { label: 'Orders', href: '/orders' },
    { label: 'Wishlist', href: '/marketplace/wishlist' },
    { label: 'Recently Viewed', href: '/marketplace/recently-viewed' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Profile', action: 'profile' },
  ],
  TRANSPORTER: [
    { label: 'Transporter Dashboard', href: '/transporter' },
    { label: 'Available Jobs', href: '/transporter?view=available-jobs' },
    { label: 'Active Deliveries', href: '/transporter?view=active-deliveries' },
    { label: 'Delivery History', href: '/transporter?view=delivery-history' },
    { label: 'Vehicle', href: '/transporter?view=vehicle' },
    { label: 'Earnings', href: '/transporter?view=earnings' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Profile', action: 'profile' },
  ],
  ADMIN: [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin?view=users' },
    { label: 'Categories', href: '/admin/categories' },
    { label: 'Products', href: '/admin?view=products' },
    { label: 'Orders', href: '/admin?view=orders' },
    { label: 'Approvals', href: '/admin?view=approvals' },
    { label: 'Analytics', href: '/admin?view=analytics' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Profile', action: 'profile' },
  ],
};

export const workspaceLabels: Record<UserRole, string> = {
  BUYER: 'Buyer workspace',
  FARMER: 'Farmer workspace',
  TRANSPORTER: 'Transporter workspace',
  ADMIN: 'Admin workspace',
};

export function navigationForRole(role: UserRole): readonly DashboardNavigationItem[] {
  return dashboardNavigationByRole[role];
}
