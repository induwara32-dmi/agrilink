import type { DeliveryMethod, Role } from '@prisma/client';

export interface CommerceActor { userId: string; role: Role; requestId: string }
export interface CartItemInput { productId: string; quantity: string; deliveryMethod?: DeliveryMethod }
export interface CartItemUpdate { quantity?: string; deliveryMethod?: DeliveryMethod | null; savedForLater?: boolean }
export interface DeliveryAddressInput { recipientName: string; recipientPhone: string; line1: string; line2?: string; city: string; district?: string; region?: string; countryCode: string }
export interface CheckoutGroupInput { farmerId: string; deliveryMethod: DeliveryMethod; deliveryAddressId?: string; deliveryAddress?: DeliveryAddressInput; buyerNotes?: string }
export interface CheckoutInput { groups: CheckoutGroupInput[]; couponCode?: string; paymentProvider: string }
export type CheckoutPreviewInput = Omit<CheckoutInput, 'paymentProvider'>;
export interface OrderQuery { page: number; pageSize: number }
