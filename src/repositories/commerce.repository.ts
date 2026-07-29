import { CouponType, DeliveryMethod, DeliveryStatus, FarmerOrderStatus, InventoryMovementType, OrderStatus, Prisma, ProductStatus, Role, TransportJobStatus, VerificationStatus, type PrismaClient } from '@prisma/client';
import type { CartItemInput, CartItemUpdate, CheckoutInput, CommerceActor, OrderQuery } from '../types/commerce';
import { BaseRepository } from './base.repository';

const cartInclude = { items: { include: { product: { include: { farmer: { select: { id: true, farmName: true } }, images: { orderBy: { sortOrder: 'asc' as const }, take: 1 }, inventory: true } } }, orderBy: { createdAt: 'asc' as const } } } satisfies Prisma.CartInclude;
const orderInclude = { farmerOrders: { include: { items: true, delivery: { include: { statusHistory: { orderBy: { occurredAt: 'asc' as const } }, transportJob: true } }, statusHistory: { orderBy: { createdAt: 'asc' as const } }, farmer: { select: { id: true, farmName: true, userId: true } } } }, statusHistory: { orderBy: { createdAt: 'asc' as const } }, couponRedemptions: { include: { coupon: { select: { code: true, type: true, value: true } } } }, payment: true } satisfies Prisma.OrderInclude;
const orderIncludeFor = (actor: CommerceActor): Prisma.OrderInclude => actor.role === Role.FARMER ? { ...orderInclude, farmerOrders: { where: { farmer: { userId: actor.userId } }, include: orderInclude.farmerOrders.include } } : orderInclude;

export class CommerceRepository extends BaseRepository {
  public constructor(database: PrismaClient) { super(database); }

  public async getOrCreateCart(buyerId: string) {
    const existing = await this.database.cart.findFirst({ where: { buyerId, isActive: true }, include: cartInclude });
    return existing ?? this.database.cart.create({ data: { buyerId }, include: cartInclude });
  }

  public findProductForCart(productId: string) { return this.database.product.findFirst({ where: { id: productId, deletedAt: null }, include: { inventory: true, farmer: true, category: true } }); }

  public async addItem(buyerId: string, input: CartItemInput, requestId: string) {
    return this.database.$transaction(async transaction => {
      let cart = await transaction.cart.findFirst({ where: { buyerId, isActive: true } });
      cart ??= await transaction.cart.create({ data: { buyerId } });
      const existing = await transaction.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: input.productId } } });
      const quantity = existing ? existing.quantity.add(input.quantity) : new Prisma.Decimal(input.quantity);
      const item = await transaction.cartItem.upsert({ where: { cartId_productId: { cartId: cart.id, productId: input.productId } }, create: { cartId: cart.id, productId: input.productId, quantity, ...(input.deliveryMethod ? { deliveryMethod: input.deliveryMethod } : {}) }, update: { quantity, savedForLater: false, ...(input.deliveryMethod ? { deliveryMethod: input.deliveryMethod } : {}) } });
      await transaction.auditLog.create({ data: { actorId: buyerId, action: 'CART_ITEM_ADDED', entityType: 'CartItem', entityId: item.id, requestId, after: { productId: input.productId, quantity: quantity.toString() } } });
      return transaction.cart.findUniqueOrThrow({ where: { id: cart.id }, include: cartInclude });
    });
  }

  public async updateItem(buyerId: string, itemId: string, input: CartItemUpdate, requestId: string) {
    return this.database.$transaction(async transaction => {
      const current = await transaction.cartItem.findFirst({ where: { id: itemId, cart: { buyerId, isActive: true } } });
      if (!current) throw new Error('CART_ITEM_NOT_FOUND');
      const item = await transaction.cartItem.update({ where: { id: itemId }, data: { ...(input.quantity ? { quantity: new Prisma.Decimal(input.quantity) } : {}), ...(input.deliveryMethod !== undefined ? { deliveryMethod: input.deliveryMethod } : {}), ...(input.savedForLater !== undefined ? { savedForLater: input.savedForLater } : {}) } });
      await transaction.auditLog.create({ data: { actorId: buyerId, action: input.savedForLater ? 'CART_ITEM_SAVED_FOR_LATER' : 'CART_ITEM_UPDATED', entityType: 'CartItem', entityId: item.id, requestId } });
      return transaction.cart.findUniqueOrThrow({ where: { id: current.cartId }, include: cartInclude });
    });
  }

  public async removeItem(buyerId: string, itemId: string, requestId: string): Promise<void> {
    await this.database.$transaction(async transaction => {
      const item = await transaction.cartItem.findFirst({ where: { id: itemId, cart: { buyerId, isActive: true } } });
      if (!item) throw new Error('CART_ITEM_NOT_FOUND');
      await transaction.cartItem.delete({ where: { id: item.id } });
      await transaction.auditLog.create({ data: { actorId: buyerId, action: 'CART_ITEM_REMOVED', entityType: 'CartItem', entityId: item.id, requestId } });
    });
  }

  public async clearCart(buyerId: string, requestId: string): Promise<void> {
    await this.database.$transaction(async transaction => {
      const cart = await transaction.cart.findFirst({ where: { buyerId, isActive: true } });
      if (!cart) return;
      await transaction.cartItem.deleteMany({ where: { cartId: cart.id } });
      await transaction.auditLog.create({ data: { actorId: buyerId, action: 'CART_CLEARED', entityType: 'Cart', entityId: cart.id, requestId } });
    });
  }

  public async checkout(buyerId: string, input: CheckoutInput, orderNumber: string, requestId: string) {
    return this.database.$transaction(async transaction => {
      const cart = await transaction.cart.findFirst({ where: { buyerId, isActive: true }, include: { items: { include: { product: { include: { inventory: true, farmer: true, category: true } } } } } });
      const checkoutItems = cart?.items.filter(item => !item.savedForLater) ?? [];
      if (!cart || checkoutItems.length === 0) throw new Error('CART_EMPTY');

      const inventoryIds = checkoutItems.map(item => item.product.inventory?.id).filter((id): id is string => Boolean(id)).sort();
      if (inventoryIds.length !== checkoutItems.length) throw new Error('INVENTORY_UNAVAILABLE');
      await transaction.$queryRaw(Prisma.sql`SELECT id FROM "Inventory" WHERE id IN (${Prisma.join(inventoryIds.map(id => Prisma.sql`${id}::uuid`))}) ORDER BY id FOR UPDATE`);

      const groupInputs = new Map(input.groups.map(group => [group.farmerId, group]));
      const currencies = new Set(checkoutItems.map(item => item.product.currency));
      if (currencies.size !== 1) throw new Error('MULTI_CURRENCY_CART');
      const currency = checkoutItems[0]!.product.currency;
      const grouped = new Map<string, typeof checkoutItems>();
      for (const item of checkoutItems) {
        const product = item.product;
        if (product.status !== ProductStatus.ACTIVE || product.deletedAt || !product.category.isActive || product.category.deletedAt || product.farmer.deletedAt || product.farmer.verificationStatus !== VerificationStatus.APPROVED) throw new Error('PRODUCT_UNAVAILABLE');
        if (item.quantity.lessThan(product.minOrderQuantity)) throw new Error('MINIMUM_QUANTITY');
        if (!product.inventory || product.inventory.quantityOnHand.sub(product.inventory.quantityReserved).lessThan(item.quantity)) throw new Error('INSUFFICIENT_STOCK');
        const group = groupInputs.get(product.farmerId);
        if (!group) throw new Error('DELIVERY_METHOD_REQUIRED');
        if (item.deliveryMethod && item.deliveryMethod !== group.deliveryMethod) throw new Error('DELIVERY_METHOD_CONFLICT');
        grouped.set(product.farmerId, [...(grouped.get(product.farmerId) ?? []), item]);
      }
      if (grouped.size !== input.groups.length) throw new Error('INVALID_FARMER_GROUP');

      const addresses = new Map<string, Awaited<ReturnType<typeof transaction.address.findFirst>>>();
      for (const group of input.groups) {
        if (group.deliveryMethod !== DeliveryMethod.BUYER_PICKUP) {
          if (!group.deliveryAddressId) throw new Error('DELIVERY_ADDRESS_REQUIRED');
          const address = await transaction.address.findFirst({ where: { id: group.deliveryAddressId, userId: buyerId, deletedAt: null } });
          if (!address) throw new Error('DELIVERY_ADDRESS_INVALID');
          addresses.set(group.farmerId, address);
        }
      }

      const subtotal = checkoutItems.reduce((sum, item) => sum.add(item.product.unitPrice.mul(item.quantity)), new Prisma.Decimal(0)).toDecimalPlaces(4);
      let coupon: Awaited<ReturnType<typeof transaction.coupon.findUnique>> = null;
      let discount = new Prisma.Decimal(0);
      if (input.couponCode) {
        coupon = await transaction.coupon.findUnique({ where: { code: input.couponCode } });
        const now = new Date();
        if (!coupon || !coupon.isActive || coupon.deletedAt || coupon.startsAt > now || coupon.endsAt < now) throw new Error('COUPON_INVALID');
        if (coupon.currency && coupon.currency !== currency) throw new Error('COUPON_CURRENCY');
        if (coupon.minimumOrderAmount && subtotal.lessThan(coupon.minimumOrderAmount)) throw new Error('COUPON_MINIMUM');
        const [globalUses, buyerUses] = await Promise.all([transaction.couponRedemption.count({ where: { couponId: coupon.id } }), transaction.couponRedemption.count({ where: { couponId: coupon.id, buyerId } })]);
        if ((coupon.usageLimit !== null && globalUses >= coupon.usageLimit) || (coupon.perBuyerLimit !== null && buyerUses >= coupon.perBuyerLimit)) throw new Error('COUPON_LIMIT');
        discount = coupon.type === CouponType.PERCENTAGE ? subtotal.mul(coupon.value).div(100) : coupon.value;
        if (coupon.maximumDiscount && discount.greaterThan(coupon.maximumDiscount)) discount = coupon.maximumDiscount;
        if (discount.greaterThan(subtotal)) discount = subtotal;
        discount = discount.toDecimalPlaces(4);
      }

      const order = await transaction.order.create({ data: { orderNumber, buyerId, status: OrderStatus.PENDING, currency, subtotal, discountTotal: discount, grandTotal: subtotal.sub(discount), placedAt: new Date() } });
      await transaction.orderStatusHistory.create({ data: { orderId: order.id, actorId: buyerId, toStatus: OrderStatus.PENDING, reason: 'Checkout completed' } });

      let allocatedDiscount = new Prisma.Decimal(0);
      const farmerEntries = [...grouped.entries()];
      for (const [index, [farmerId, items]] of farmerEntries.entries()) {
        const groupInput = groupInputs.get(farmerId)!;
        const groupSubtotal = items.reduce((sum, item) => sum.add(item.product.unitPrice.mul(item.quantity)), new Prisma.Decimal(0)).toDecimalPlaces(4);
        const groupDiscount = index === farmerEntries.length - 1 ? discount.sub(allocatedDiscount) : discount.mul(groupSubtotal).div(subtotal).toDecimalPlaces(4);
        allocatedDiscount = allocatedDiscount.add(groupDiscount);
        const address = addresses.get(farmerId);
        const farmerOrder = await transaction.farmerOrder.create({ data: { farmerOrderNumber: `${orderNumber}-F${index + 1}`, orderId: order.id, farmerId, status: FarmerOrderStatus.PENDING, deliveryMethod: groupInput.deliveryMethod, currency, subtotal: groupSubtotal, discountTotal: groupDiscount, total: groupSubtotal.sub(groupDiscount), ...(groupInput.buyerNotes ? { buyerNotes: groupInput.buyerNotes } : {}), ...(address ? { deliveryRecipientName: address.recipientName, deliveryRecipientPhone: address.recipientPhone, deliveryLine1: address.line1, deliveryLine2: address.line2, deliveryCity: address.city, deliveryDistrict: address.district, deliveryRegion: address.region, deliveryCountryCode: address.countryCode } : {}) } });
        await transaction.farmerOrderStatusHistory.create({ data: { farmerOrderId: farmerOrder.id, actorId: buyerId, toStatus: FarmerOrderStatus.PENDING, reason: 'Checkout completed' } });
        const deliveryStatus = groupInput.deliveryMethod === DeliveryMethod.PLATFORM_TRANSPORTER ? DeliveryStatus.AWAITING_ASSIGNMENT : DeliveryStatus.PENDING;
        const delivery = await transaction.delivery.create({ data: { farmerOrderId: farmerOrder.id, method: groupInput.deliveryMethod, status: deliveryStatus, ...(address ? { recipientName: address.recipientName } : {}) } });
        await transaction.deliveryStatusHistory.create({ data: { deliveryId: delivery.id, actorId: buyerId, toStatus: deliveryStatus, note: 'Delivery created at checkout' } });
        if (groupInput.deliveryMethod === DeliveryMethod.PLATFORM_TRANSPORTER) {
          const capacityUnits = new Set(items.map(item => item.product.unit));
          const requiredCapacity = capacityUnits.size === 1 ? items.reduce((sum, item) => sum.add(item.quantity), new Prisma.Decimal(0)) : null;
          await transaction.transportJob.create({ data: { deliveryId: delivery.id, status: TransportJobStatus.OPEN, offeredFee: 0, currency, ...(requiredCapacity ? { requiredCapacity, capacityUnit: items[0]!.product.unit } : {}) } });
        }
        for (const item of items) {
          const lineTotal = item.product.unitPrice.mul(item.quantity).toDecimalPlaces(4);
          await transaction.orderItem.create({ data: { farmerOrderId: farmerOrder.id, productId: item.productId, productName: item.product.name, sku: item.product.sku, unit: item.product.unit, quantity: item.quantity, unitPrice: item.product.unitPrice, lineTotal } });
          const inventory = item.product.inventory!;
          await transaction.inventory.update({ where: { id: inventory.id }, data: { quantityReserved: { increment: item.quantity }, version: { increment: 1 } } });
          await transaction.inventoryMovement.create({ data: { inventoryId: inventory.id, actorId: buyerId, type: InventoryMovementType.RESERVATION, quantity: item.quantity, balanceAfter: inventory.quantityOnHand, referenceType: 'Order', referenceId: order.id, reason: 'Checkout reservation' } });
        }
      }
      if (coupon) await transaction.couponRedemption.create({ data: { couponId: coupon.id, buyerId, orderId: order.id, discountAmount: discount } });
      await transaction.payment.create({ data: { orderId: order.id, provider: input.paymentProvider, currency, amount: order.grandTotal } });
      await transaction.cart.update({ where: { id: cart.id }, data: { isActive: false } });
      const savedItemIds = cart.items.filter(item => item.savedForLater).map(item => item.id);
      if (savedItemIds.length > 0) {
        const nextCart = await transaction.cart.create({ data: { buyerId } });
        await transaction.cartItem.updateMany({ where: { id: { in: savedItemIds } }, data: { cartId: nextCart.id } });
      }
      await transaction.auditLog.create({ data: { actorId: buyerId, action: 'ORDER_CREATED', entityType: 'Order', entityId: order.id, requestId, after: { orderNumber, subtotal: subtotal.toString(), discount: discount.toString(), total: order.grandTotal.toString() } } });
      return transaction.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5_000, timeout: 15_000 });
  }

  public async listOrders(actor: CommerceActor, query: OrderQuery) {
    const where: Prisma.OrderWhereInput = actor.role === Role.BUYER ? { buyerId: actor.userId } : actor.role === Role.FARMER ? { farmerOrders: { some: { farmer: { userId: actor.userId } } } } : {};
    const [items, total] = await this.database.$transaction([this.database.order.findMany({ where, include: orderIncludeFor(actor), orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.database.order.count({ where })]);
    return { items, total };
  }

  public findOrder(orderId: string, actor: CommerceActor) {
    const access: Prisma.OrderWhereInput = actor.role === Role.BUYER ? { buyerId: actor.userId } : actor.role === Role.FARMER ? { farmerOrders: { some: { farmer: { userId: actor.userId } } } } : {};
    return this.database.order.findFirst({ where: { id: orderId, ...access }, include: orderIncludeFor(actor) });
  }
  public stockAlertsForOrder(orderId: string) { return this.database.orderItem.findMany({ where: { farmerOrder: { orderId } }, select: { product: { select: { id: true, name: true, farmer: { select: { userId: true } }, inventory: true } } } }); }
}
