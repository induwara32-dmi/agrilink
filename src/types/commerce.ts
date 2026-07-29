import type { DeliveryMethod, Role } from '@prisma/client';

export interface CommerceActor { userId: string; role: Role; requestId: string }
export interface CartItemInput { productId: string; quantity: string; deliveryMethod?: DeliveryMethod }
export interface CartItemUpdate { quantity?: string; deliveryMethod?: DeliveryMethod | null; savedForLater?: boolean }
export interface CheckoutGroupInput { farmerId: string; deliveryMethod: DeliveryMethod; deliveryAddressId?: string; buyerNotes?: string }
export interface CheckoutInput { groups: CheckoutGroupInput[]; couponCode?: string; paymentProvider: string }
export interface OrderQuery { page: number; pageSize: number }
