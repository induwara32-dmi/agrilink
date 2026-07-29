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
export type OrderStatusCode = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';
export type DeliveryStatusCode = 'PENDING' | 'AWAITING_ASSIGNMENT' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'PICKUP_SCHEDULED' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
export type OrderItem = { id: string; productId: string; productName: string; sku: string | null; unit: string; quantity: string; unitPrice: string; lineTotal: string };
export type DeliveryStatusHistory = { id: string; fromStatus: DeliveryStatusCode | null; toStatus: DeliveryStatusCode; note: string | null; latitude: string | null; longitude: string | null; occurredAt: string };
export type OrderDelivery = { id: string; method: DeliveryMethodCode; status: DeliveryStatusCode; scheduledPickupAt: string | null; estimatedDeliveryAt: string | null; pickedUpAt: string | null; deliveredAt: string | null; recipientName: string | null; recipientNote: string | null; proofStorageKey: string | null; statusHistory: DeliveryStatusHistory[]; transportJob: { id: string; status: string; transporterId: string | null; vehicleId: string | null } | null };
export type FarmerOrder = { id: string; farmerOrderNumber: string; status: string; deliveryMethod: DeliveryMethodCode; subtotal: string; deliveryFee: string; discountTotal: string; total: string; deliveryRecipientName: string | null; deliveryRecipientPhone: string | null; deliveryLine1: string | null; deliveryLine2: string | null; deliveryCity: string | null; deliveryDistrict: string | null; deliveryRegion: string | null; buyerNotes: string | null; farmer: { id: string; farmName: string; userId: string }; items: OrderItem[]; delivery: OrderDelivery | null };
export type CheckoutOrder = { id: string; orderNumber: string; status: OrderStatusCode; currency: string; subtotal: string; deliveryFee: string; discountTotal: string; grandTotal: string; createdAt: string; placedAt: string | null; cancelledAt: string | null; farmerOrders: FarmerOrder[]; statusHistory: Array<{ id: string; fromStatus: OrderStatusCode | null; toStatus: OrderStatusCode; reason: string | null; createdAt: string }>; payment: { status: string; provider: string; amount: string } | null };

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
export const listOrders = (query: { page: number; pageSize: number; search?: string; status?: OrderStatusCode }) => { const params = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize) }); if (query.search) params.set('search', query.search); if (query.status) params.set('status', query.status); return apiRequest<CheckoutOrder[]>(`/orders?${params.toString()}`, { authenticated: true }); };
export const cancelOrder = (orderId: string) => apiRequest<CheckoutOrder>(`/orders/${encodeURIComponent(orderId)}/cancel`, { method: 'POST', authenticated: true });
