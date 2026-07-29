import { DeliveryMethod, OrderStatus } from '@prisma/client';
import { z } from 'zod';

const empty = z.object({}).strict();
const uuid = z.string().uuid();
const quantity = z.string().regex(/^\d+(\.\d{1,3})?$/, 'Must be a positive decimal with up to three decimal places.').refine(value => Number(value) > 0, 'Quantity must be greater than zero.');
const request = <B extends z.ZodType, P extends z.ZodType, Q extends z.ZodType>(body: B, params: P, query: Q) => z.object({ body, params, query });
const itemParams = z.object({ itemId: uuid });

export const cartSchema = request(empty, empty, empty);
export const addCartItemSchema = request(z.object({ productId: uuid, quantity, deliveryMethod: z.nativeEnum(DeliveryMethod).optional() }), empty, empty);
export const updateCartItemSchema = request(z.object({ quantity: quantity.optional(), deliveryMethod: z.nativeEnum(DeliveryMethod).nullable().optional(), savedForLater: z.boolean().optional() }).refine(value => Object.keys(value).length > 0), itemParams, empty);
export const cartItemSchema = request(empty, itemParams, empty);
const deliveryAddress = z.object({ recipientName: z.string().trim().min(1).max(180), recipientPhone: z.string().trim().min(7).max(32), line1: z.string().trim().min(1).max(255), line2: z.string().trim().max(255).optional(), city: z.string().trim().min(1).max(120), district: z.string().trim().max(120).optional(), region: z.string().trim().max(120).optional(), countryCode: z.string().trim().length(2).transform(value => value.toUpperCase()) });
const checkoutGroups = z.array(z.object({ farmerId: uuid, deliveryMethod: z.nativeEnum(DeliveryMethod), deliveryAddressId: uuid.optional(), deliveryAddress: deliveryAddress.optional(), buyerNotes: z.string().trim().max(2000).optional() }).refine(group => !(group.deliveryAddressId && group.deliveryAddress), 'Use either a saved address or delivery information, not both.')).min(1).refine(groups => new Set(groups.map(group => group.farmerId)).size === groups.length, 'Each farmer may appear only once.');
export const checkoutPreviewSchema = request(z.object({
  groups: checkoutGroups,
  couponCode: z.string().trim().min(1).max(64).transform(value => value.toUpperCase()).optional(),
}), empty, empty);
export const checkoutSchema = request(z.object({
  groups: checkoutGroups,
  couponCode: z.string().trim().min(1).max(64).transform(value => value.toUpperCase()).optional(),
  paymentProvider: z.string().trim().min(2).max(80),
}), empty, empty);
export const orderListSchema = request(empty, empty, z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().min(1).max(120).optional(), status: z.nativeEnum(OrderStatus).optional() }));
export const orderIdSchema = request(empty, z.object({ orderId: uuid }), empty);

export type AddCartItemBody = z.infer<typeof addCartItemSchema>['body'];
export type UpdateCartItemBody = z.infer<typeof updateCartItemSchema>['body'];
export type CheckoutBody = z.infer<typeof checkoutSchema>['body'];
export type CheckoutPreviewBody = z.infer<typeof checkoutPreviewSchema>['body'];
