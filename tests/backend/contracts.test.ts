import { describe, expect, it } from 'vitest';
import { DeliveryMethod, DeliveryStatus, InventoryMovementType, Role, VehicleType } from '@prisma/client';
import { registerSchema, loginSchema, refreshSchema, logoutSchema, forgotPasswordSchema, resetPasswordSchema } from '../../src/validators/auth.validators';
import { createProductSchema, updateProductSchema, productListSchema, inventoryAdjustmentSchema } from '../../src/validators/catalog.validators';
import { addCartItemSchema, updateCartItemSchema, checkoutSchema, checkoutPreviewSchema } from '../../src/validators/commerce.validators';
import { acceptJobSchema, manualAssignmentSchema, transitionDeliverySchema } from '../../src/validators/logistics.validators';
import { productUploadSchema, reorderImagesSchema, proofUploadSchema } from '../../src/validators/media.validators';

const empty = { params: {}, query: {} };
const id = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';
const password = 'StrongPassword!1';

describe('authentication contracts', () => {
  it('accepts buyer registration', () => expect(registerSchema.safeParse({ ...empty, body: { email: 'BUYER@example.com', password, firstName: 'Ada', lastName: 'Buyer', role: Role.BUYER } }).success).toBe(true));
  it('requires a farm name for farmer registration', () => expect(registerSchema.safeParse({ ...empty, body: { email: 'farmer@example.com', password, firstName: 'Ada', lastName: 'Farmer', role: Role.FARMER } }).success).toBe(false));
  it('prevents public admin registration', () => expect(registerSchema.safeParse({ ...empty, body: { email: 'admin@example.com', password, firstName: 'A', lastName: 'B', role: Role.ADMIN } }).success).toBe(false));
  it('accepts login credentials', () => expect(loginSchema.safeParse({ ...empty, body: { email: 'USER@example.com', password } }).success).toBe(true));
  it('requires refresh token for refresh', () => expect(refreshSchema.safeParse({ ...empty, body: { refreshToken: '' } }).success).toBe(false));
  it('requires refresh token for logout', () => expect(logoutSchema.safeParse({ ...empty, body: { refreshToken: 'token' } }).success).toBe(true));
  it('normalizes forgot-password email', () => expect(forgotPasswordSchema.parse({ ...empty, body: { email: 'USER@EXAMPLE.COM' } }).body.email).toBe('user@example.com'));
  it('validates reset-password token and password', () => expect(resetPasswordSchema.safeParse({ ...empty, body: { token: 'a'.repeat(64), password } }).success).toBe(true));
  it('rejects weak reset passwords', () => expect(resetPasswordSchema.safeParse({ ...empty, body: { token: 'a'.repeat(64), password: 'weak' } }).success).toBe(false));
});

describe('product and inventory contracts', () => {
  const product = { categoryId: id, name: 'Fresh tomatoes', description: 'Fresh produce from our farm', unit: 'kg', unitPrice: '12.5000', currency: 'usd', minOrderQuantity: '1' };
  it('accepts product creation and normalizes currency', () => expect(createProductSchema.parse({ ...empty, body: product }).body.currency).toBe('USD'));
  it('rejects invalid product prices', () => expect(createProductSchema.safeParse({ ...empty, body: { ...product, unitPrice: '-1' } }).success).toBe(false));
  it('accepts product updates', () => expect(updateProductSchema.safeParse({ body: { name: 'Updated produce' }, params: { id }, query: {} }).success).toBe(true));
  it('accepts partial product updates without requiring create fields', () => expect(updateProductSchema.safeParse({ body: { description: 'Updated farm product details' }, params: { id }, query: {} }).success).toBe(true));
  it('supports product search and sorting', () => expect(productListSchema.parse({ body: {}, params: {}, query: { search: 'tomato', sort: 'priceAsc' } }).query.sort).toBe('priceAsc'));
  it('accepts inventory adjustments', () => expect(inventoryAdjustmentSchema.safeParse({ body: { type: InventoryMovementType.STOCK_IN, quantity: '10.000' }, params: { id }, query: {} }).success).toBe(true));
  it('rejects reservation as a manual adjustment', () => expect(inventoryAdjustmentSchema.safeParse({ body: { type: InventoryMovementType.RESERVATION, quantity: '1' }, params: { id }, query: {} }).success).toBe(false));
});

describe('cart, checkout, and orders contracts', () => {
  it('accepts a cart item', () => expect(addCartItemSchema.safeParse({ ...empty, body: { productId: id, quantity: '2.500' } }).success).toBe(true));
  it('rejects a zero cart quantity', () => expect(addCartItemSchema.safeParse({ ...empty, body: { productId: id, quantity: '0' } }).success).toBe(false));
  it('supports save for later', () => expect(updateCartItemSchema.safeParse({ body: { savedForLater: true }, params: { itemId: id }, query: {} }).success).toBe(true));
  it('accepts multi-farmer checkout', () => expect(checkoutSchema.safeParse({ ...empty, body: { groups: [{ farmerId: id, deliveryMethod: DeliveryMethod.BUYER_PICKUP }, { farmerId: id2, deliveryMethod: DeliveryMethod.PLATFORM_TRANSPORTER }], paymentProvider: 'test' } }).success).toBe(true));
  it('rejects duplicate farmer groups', () => expect(checkoutSchema.safeParse({ ...empty, body: { groups: [{ farmerId: id, deliveryMethod: DeliveryMethod.BUYER_PICKUP }, { farmerId: id, deliveryMethod: DeliveryMethod.FARMER_DELIVERY }], paymentProvider: 'test' } }).success).toBe(false));
  it('normalizes coupon validation input', () => expect(checkoutPreviewSchema.parse({ ...empty, body: { groups: [{ farmerId: id, deliveryMethod: DeliveryMethod.BUYER_PICKUP }], couponCode: ' harvest ' } }).body.couponCode).toBe('HARVEST'));
});

describe('transport contracts', () => {
  it('accepts manual assignment', () => expect(manualAssignmentSchema.safeParse({ body: { transporterId: id, vehicleId: id2 }, params: { jobId: id }, query: {} }).success).toBe(true));
  it('accepts driver acceptance with vehicle', () => expect(acceptJobSchema.safeParse({ body: { vehicleId: id2 }, params: { jobId: id }, query: {} }).success).toBe(true));
  it('accepts delivery completion transition', () => expect(transitionDeliverySchema.safeParse({ body: { status: DeliveryStatus.DELIVERED }, params: { deliveryId: id }, query: {} }).success).toBe(true));
  it('rejects malformed assignment identifiers', () => expect(manualAssignmentSchema.safeParse({ body: { transporterId: 'bad', vehicleId: id2 }, params: { jobId: id }, query: {} }).success).toBe(false));
});

describe('media contracts', () => {
  it('accepts product upload metadata', () => expect(productUploadSchema.safeParse({ body: { altText: 'Produce' }, params: { id }, query: {} }).success).toBe(true));
  it('rejects duplicate image reorder IDs', () => expect(reorderImagesSchema.safeParse({ body: { imageIds: [id, id] }, params: { id }, query: {} }).success).toBe(false));
  it('accepts complete image reorder IDs', () => expect(reorderImagesSchema.safeParse({ body: { imageIds: [id, id2] }, params: { id }, query: {} }).success).toBe(true));
  it('requires a receiver for proof upload', () => expect(proofUploadSchema.safeParse({ body: { receiverName: '' }, params: { deliveryId: id }, query: {} }).success).toBe(false));
  it('keeps supported vehicle type available for assignment factories', () => expect(VehicleType.TRUCK).toBe('TRUCK'));
});
