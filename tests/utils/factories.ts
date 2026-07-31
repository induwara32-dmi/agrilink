import { Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export const ids = { user: () => randomUUID(), product: () => randomUUID(), farmer: () => randomUUID(), order: () => randomUUID(), delivery: () => randomUUID() };
export function userFactory(overrides: Partial<{ id: string; email: string; role: Role }> = {}) { return { id: overrides.id ?? ids.user(), email: overrides.email ?? `user-${randomUUID()}@example.com`, role: overrides.role ?? Role.BUYER, status: 'ACTIVE' as const }; }
export function productFactory(overrides: Partial<{ id: string; farmerId: string; price: string; stock: string }> = {}) { return { id: overrides.id ?? ids.product(), farmerId: overrides.farmerId ?? ids.farmer(), unitPrice: overrides.price ?? '12.50', available: overrides.stock ?? '100.000' }; }
export function checkoutFactory(farmerIds: string[]) { return { groups: farmerIds.map(farmerId => ({ farmerId, deliveryMethod: 'BUYER_PICKUP' as const })), paymentProvider: 'test-provider' }; }
