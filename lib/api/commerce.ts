import { apiRequest } from './client';

export type DeliveryMethodCode = 'FARMER_DELIVERY' | 'BUYER_PICKUP' | 'PLATFORM_TRANSPORTER';

export type CartProduct = {
  id: string; name: string; unit: string; unitPrice: string; currency: string; minOrderQuantity: string; status: string;
  farmer: { id: string; farmName: string };
  images: Array<{ id: string; url: string; altText: string | null }>;
  inventory: { quantityOnHand: string; quantityReserved: string } | null;
};
export type CartItem = { id: string; productId: string; quantity: string; deliveryMethod: DeliveryMethodCode | null; savedForLater: boolean; product: CartProduct };
export type CartGroup = { farmer: { id: string; farmName: string }; items: CartItem[]; subtotal: string };
export type Cart = { id: string; groups: CartGroup[]; savedForLater: CartItem[]; currency: string | null; subtotal: string };
export type DeliveryAddressInput = { recipientName: string; recipientPhone: string; line1: string; line2?: string; city: string; district?: string; region?: string; countryCode: string };
export type CheckoutGroupInput = { farmerId: string; deliveryMethod: DeliveryMethodCode; deliveryAddress?: DeliveryAddressInput; buyerNotes?: string };
export type CheckoutPreview = { currency: string; subtotal: string; deliveryFee: string; discountTotal: string; grandTotal: string; groups: Array<{ farmerId: string; subtotal: string; deliveryFee: string; discountTotal: string; total: string }> };
export type CheckoutOrder = { id: string; orderNumber: string; currency: string; subtotal: string; deliveryFee: string; discountTotal: string; grandTotal: string; farmerOrders: Array<{ id: string; farmerOrderNumber: string; deliveryMethod: DeliveryMethodCode; subtotal: string; deliveryFee: string; discountTotal: string; total: string; farmer: { id: string; farmName: string } }> };

export const cartQueryKeys = { all: ['cart'] as const, current: () => [...cartQueryKeys.all, 'current'] as const, preview: (input: unknown) => [...cartQueryKeys.all, 'preview', input] as const };
export const getCart = () => apiRequest<Cart>('/cart', { authenticated: true });
export const addCartItem = (productId: string, quantity: string) => apiRequest<Cart>('/cart/items', { method: 'POST', authenticated: true, body: { productId, quantity } });
export const updateCartItem = (itemId: string, input: { quantity?: string; deliveryMethod?: DeliveryMethodCode | null; savedForLater?: boolean }) => apiRequest<Cart>(`/cart/items/${encodeURIComponent(itemId)}`, { method: 'PATCH', authenticated: true, body: input });
export const saveCartItem = (itemId: string) => apiRequest<Cart>(`/cart/items/${encodeURIComponent(itemId)}/save-for-later`, { method: 'POST', authenticated: true });
export const removeCartItem = (itemId: string) => apiRequest<{ message: string }>(`/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE', authenticated: true });
export const clearCart = () => apiRequest<{ message: string }>('/cart', { method: 'DELETE', authenticated: true });
export const previewCheckout = (groups: CheckoutGroupInput[], couponCode?: string) => apiRequest<CheckoutPreview>('/checkout/preview', { method: 'POST', authenticated: true, body: { groups, ...(couponCode ? { couponCode } : {}) } });
export const checkout = (groups: CheckoutGroupInput[], paymentProvider: string, couponCode?: string) => apiRequest<CheckoutOrder>('/checkout', { method: 'POST', authenticated: true, body: { groups, paymentProvider, ...(couponCode ? { couponCode } : {}) } });
export const getOrder = (orderId: string) => apiRequest<CheckoutOrder>(`/orders/${encodeURIComponent(orderId)}`, { authenticated: true });
