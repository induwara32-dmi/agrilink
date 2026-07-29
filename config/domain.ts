export const PUBLIC_USER_ROLES = ['Buyer', 'Farmer', 'Transporter'] as const;
export const USER_ROLES = [...PUBLIC_USER_ROLES, 'Admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export type PublicUserRole = (typeof PUBLIC_USER_ROLES)[number];

export const ORDER_STATUSES = ['Pending', 'Preparing', 'In Transit', 'Delivered', 'Cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DELIVERY_METHODS = ['Farmer Delivery', 'Buyer Pickup', 'Platform Transporter'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];
