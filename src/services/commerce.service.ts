import { Prisma, ProductStatus, VerificationStatus } from '@prisma/client';
import { HTTP_STATUS } from '../constants/application';
import type { CommerceRepository } from '../repositories/commerce.repository';
import type { CartItemInput, CartItemUpdate, CheckoutInput, CheckoutPreviewInput, CommerceActor, OrderQuery } from '../types/commerce';
import { ApiError } from '../utils/api-error';
import { createTokenId } from '../utils/token';
import { BaseService } from './base.service';
import type { DomainEventPublisher } from '../types/domain-events';
import { logger } from '../config/logger';

const pageMeta = (query: OrderQuery, total: number) => ({ ...query, total, totalPages: Math.ceil(total / query.pageSize) });

export class CommerceService extends BaseService {
  public constructor(private readonly repository: CommerceRepository, private readonly events: DomainEventPublisher) { super(); }

  public async getCart(actor: CommerceActor) { return this.groupCart(await this.repository.getOrCreateCart(actor.userId)); }

  public async addItem(input: CartItemInput, actor: CommerceActor) {
    const product = await this.repository.findProductForCart(input.productId);
    const cart = await this.repository.getOrCreateCart(actor.userId);
    const existing = cart.items.find(item => item.productId === input.productId);
    this.validateProduct(product, new Prisma.Decimal(input.quantity).add(existing?.quantity ?? 0));
    try { return this.groupCart(await this.repository.addItem(actor.userId, input, actor.requestId)); } catch (error) { this.translate(error); }
  }

  public async updateItem(itemId: string, input: CartItemUpdate, actor: CommerceActor) {
    const cart = await this.repository.getOrCreateCart(actor.userId);
    const current = cart.items.find(item => item.id === itemId);
    if (!current) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
    if (input.quantity) this.validateProduct(await this.repository.findProductForCart(current.productId), new Prisma.Decimal(input.quantity));
    try { return this.groupCart(await this.repository.updateItem(actor.userId, itemId, input, actor.requestId)); } catch (error) { this.translate(error); }
  }

  public async removeItem(itemId: string, actor: CommerceActor): Promise<void> { try { await this.repository.removeItem(actor.userId, itemId, actor.requestId); } catch (error) { this.translate(error); } }
  public clearCart(actor: CommerceActor): Promise<void> { return this.repository.clearCart(actor.userId, actor.requestId); }

  public async previewCheckout(input: CheckoutPreviewInput, actor: CommerceActor) { try { return await this.repository.previewCheckout(actor.userId, input); } catch (error) { this.translate(error); } }

  public async checkout(input: CheckoutInput, actor: CommerceActor) {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const orderNumber = `AGR-${date}-${createTokenId().slice(0, 8).toUpperCase()}`;
    try { const order = await this.repository.checkout(actor.userId, input, orderNumber, actor.requestId); await this.events.publish({ type: 'ORDER_CREATED', recipientIds: [order.buyerId, ...order.farmerOrders.map(group => group.farmer.userId)], data: { orderId: order.id, orderNumber: order.orderNumber, total: order.grandTotal.toString(), currency: order.currency } }); try { const products = await this.repository.stockAlertsForOrder(order.id); for (const { product } of products) { if (!product.inventory) continue; const available = product.inventory.quantityOnHand.sub(product.inventory.quantityReserved); if (available.isZero()) await this.events.publish({ type: 'PRODUCT_OUT_OF_STOCK', recipientIds: [product.farmer.userId], data: { productId: product.id, productName: product.name } }); else if (product.inventory.reorderLevel && available.lessThanOrEqualTo(product.inventory.reorderLevel)) await this.events.publish({ type: 'PRODUCT_LOW_STOCK', recipientIds: [product.farmer.userId], data: { productId: product.id, productName: product.name, available: available.toString() } }); } } catch (eventError) { logger.error({ err: eventError, orderId: order.id }, 'Post-checkout stock notification evaluation failed'); } return order; } catch (error) { this.translate(error); }
  }

  public async listOrders(query: OrderQuery, actor: CommerceActor) { const result = await this.repository.listOrders(actor, query); return { ...result, meta: pageMeta(query, result.total) }; }
  public async getOrder(orderId: string, actor: CommerceActor) { const order = await this.repository.findOrder(orderId, actor); if (!order) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'ORDER_NOT_FOUND', 'Order not found.'); return order; }

  private groupCart<T extends { items: Array<{ quantity: Prisma.Decimal; product: { unitPrice: Prisma.Decimal; currency: string; farmer: { id: string; farmName: string } }; savedForLater: boolean }> }>(cart: T) {
    const groups = new Map<string, { farmer: { id: string; farmName: string }; items: T['items']; subtotal: string }>();
    const savedForLater: T['items'] = [];
    for (const item of cart.items) {
      if (item.savedForLater) { savedForLater.push(item); continue; }
      const existing = groups.get(item.product.farmer.id);
      if (existing) {
        existing.items.push(item);
        existing.subtotal = new Prisma.Decimal(existing.subtotal).add(item.product.unitPrice.mul(item.quantity)).toString();
      } else groups.set(item.product.farmer.id, { farmer: item.product.farmer, items: [item] as T['items'], subtotal: item.product.unitPrice.mul(item.quantity).toString() });
    }
    const activeItems = [...groups.values()].flatMap(group => group.items);
    const subtotal = activeItems.reduce((sum, item) => sum.add(item.product.unitPrice.mul(item.quantity)), new Prisma.Decimal(0));
    return { ...cart, items: undefined, groups: [...groups.values()], savedForLater, currency: activeItems[0]?.product.currency ?? null, subtotal: subtotal.toString() };
  }

  private validateProduct(product: Awaited<ReturnType<CommerceRepository['findProductForCart']>>, quantity: Prisma.Decimal): void {
    if (!product || product.status !== ProductStatus.ACTIVE || !product.category.isActive || product.farmer.verificationStatus !== VerificationStatus.APPROVED) throw new ApiError(HTTP_STATUS.CONFLICT, 'PRODUCT_UNAVAILABLE', 'The product is not available for ordering.');
    if (quantity.lessThan(product.minOrderQuantity)) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'MINIMUM_QUANTITY', `The minimum order quantity is ${product.minOrderQuantity.toString()}.`);
    if (!product.inventory || product.inventory.quantityOnHand.sub(product.inventory.quantityReserved).lessThan(quantity)) throw new ApiError(HTTP_STATUS.CONFLICT, 'INSUFFICIENT_STOCK', 'The requested quantity is not available.');
  }

  private translate(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2034')) throw new ApiError(HTTP_STATUS.CONFLICT, 'CHECKOUT_CONFLICT', 'The cart or inventory changed; retry the request.');
    const code = error instanceof Error ? error.message : '';
    const errors: Record<string, [number, string]> = {
      CART_EMPTY: [HTTP_STATUS.BAD_REQUEST, 'The cart has no active items.'], CART_EXPIRED: [HTTP_STATUS.CONFLICT, 'The cart expired; refresh it before checking out.'], CART_ITEM_NOT_FOUND: [HTTP_STATUS.NOT_FOUND, 'Cart item not found.'], INVENTORY_UNAVAILABLE: [HTTP_STATUS.CONFLICT, 'Inventory is unavailable.'], PRODUCT_UNAVAILABLE: [HTTP_STATUS.CONFLICT, 'A product is no longer available.'], MINIMUM_QUANTITY: [HTTP_STATUS.BAD_REQUEST, 'An item is below its minimum order quantity.'], INSUFFICIENT_STOCK: [HTTP_STATUS.CONFLICT, 'An item no longer has enough stock.'], MULTI_CURRENCY_CART: [HTTP_STATUS.BAD_REQUEST, 'A checkout must use one currency.'], DELIVERY_METHOD_REQUIRED: [HTTP_STATUS.BAD_REQUEST, 'Select a delivery method for every farmer.'], DELIVERY_METHOD_CONFLICT: [HTTP_STATUS.BAD_REQUEST, 'Cart delivery preferences conflict within a farmer group.'], INVALID_FARMER_GROUP: [HTTP_STATUS.BAD_REQUEST, 'The checkout contains an invalid farmer group.'], DELIVERY_ADDRESS_REQUIRED: [HTTP_STATUS.BAD_REQUEST, 'A delivery address is required.'], DELIVERY_ADDRESS_INVALID: [HTTP_STATUS.BAD_REQUEST, 'The delivery address is invalid.'], COUPON_INVALID: [HTTP_STATUS.BAD_REQUEST, 'The coupon is invalid or expired.'], COUPON_CURRENCY: [HTTP_STATUS.BAD_REQUEST, 'The coupon currency does not match the order.'], COUPON_MINIMUM: [HTTP_STATUS.BAD_REQUEST, 'The order does not meet the coupon minimum.'], COUPON_LIMIT: [HTTP_STATUS.CONFLICT, 'The coupon usage limit has been reached.'],
    };
    const mapped = errors[code];
    if (mapped) throw new ApiError(mapped[0], code, mapped[1]);
    throw error;
  }
}
