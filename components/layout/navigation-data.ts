export const siteNavItems = [
  { label: 'Features', href: '/#features' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export const dashboardNavItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Buyer workspace', href: '/buyer' },
  { label: 'Farmer workspace', href: '/farmer' },
  { label: 'Transporter workspace', href: '/transporter' },
  { label: 'Admin workspace', href: '/admin' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Notifications', href: '/notifications' },
] as const;

export const farmerNavItems = [
  { label: 'Farmer dashboard', href: '/farmer' },
  { label: 'Products', href: '/farmer/products' },
  { label: 'Inventory', href: '/farmer/inventory' },
  { label: 'Add Product', href: '/farmer/products/new' },
] as const;

export const adminNavItems = [
  { label: 'Admin dashboard', href: '/admin' },
  { label: 'Categories', href: '/admin/categories' },
] as const;
