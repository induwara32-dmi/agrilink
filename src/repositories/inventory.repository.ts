import { InventoryMovementType, Prisma, type PrismaClient } from '@prisma/client';
import type { InventoryAdjustmentInput, PageQuery } from '../types/catalog';
import { BaseRepository } from './base.repository';

export class InventoryRepository extends BaseRepository {
  public constructor(database: PrismaClient) { super(database); }
  public findByProduct(productId: string) { return this.database.inventory.findUnique({ where: { productId }, include: { product: { include: { farmer: true } } } }); }

  public async adjust(productId: string, input: InventoryAdjustmentInput, actorId: string, requestId: string) {
    return this.database.$transaction(async transaction => {
      const inventory = await transaction.inventory.findUniqueOrThrow({ where: { productId } });
      const delta = new Prisma.Decimal(input.quantity);
      const decreases = input.type === InventoryMovementType.DAMAGE || input.type === InventoryMovementType.EXPIRY;
      const signedDelta = decreases && delta.isPositive() ? delta.negated() : delta;
      const balanceAfter = inventory.quantityOnHand.add(signedDelta);
      if (balanceAfter.isNegative() || balanceAfter.lessThan(inventory.quantityReserved)) throw new Error('INSUFFICIENT_INVENTORY');
      const updated = await transaction.inventory.updateMany({ where: { id: inventory.id, version: inventory.version }, data: { quantityOnHand: balanceAfter, version: { increment: 1 } } });
      if (updated.count !== 1) throw new Error('INVENTORY_CONFLICT');
      const movement = await transaction.inventoryMovement.create({ data: { inventoryId: inventory.id, actorId, type: input.type, quantity: signedDelta, balanceAfter, ...(input.reason ? { reason: input.reason } : {}) } });
      await transaction.auditLog.create({ data: { actorId, action: 'INVENTORY_ADJUSTED', entityType: 'Inventory', entityId: inventory.id, requestId, before: { quantityOnHand: inventory.quantityOnHand.toString() }, after: { quantityOnHand: balanceAfter.toString(), movementId: movement.id } } });
      return transaction.inventory.findUniqueOrThrow({ where: { id: inventory.id }, include: { product: true } });
    });
  }

  public async updateSettings(productId: string, reorderLevel: string | null, actorId: string, requestId: string) {
    return this.database.$transaction(async transaction => {
      const inventory = await transaction.inventory.update({ where: { productId }, data: { reorderLevel: reorderLevel === null ? null : new Prisma.Decimal(reorderLevel) }, include: { product: true } });
      await transaction.auditLog.create({ data: { actorId, action: 'INVENTORY_SETTINGS_UPDATED', entityType: 'Inventory', entityId: inventory.id, requestId, after: { reorderLevel: inventory.reorderLevel?.toString() ?? null } } });
      return inventory;
    });
  }

  public async history(productId: string, query: PageQuery) {
    const inventory = await this.database.inventory.findUnique({ where: { productId } });
    if (!inventory) return null;
    const where = { inventoryId: inventory.id };
    const [items, total] = await this.database.$transaction([this.database.inventoryMovement.findMany({ where, include: { actor: { select: { id: true, email: true, role: true } } }, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.database.inventoryMovement.count({ where })]);
    return { items, total };
  }

  public async lowStock(farmerId: string | undefined, query: PageQuery) {
    const where: Prisma.InventoryWhereInput = { reorderLevel: { not: null }, product: { deletedAt: null, ...(farmerId ? { farmerId } : {}) } };
    const candidates = await this.database.inventory.findMany({ where, include: { product: true }, orderBy: { updatedAt: 'desc' } });
    const low = candidates.filter(item => item.reorderLevel !== null && item.quantityOnHand.sub(item.quantityReserved).lessThanOrEqualTo(item.reorderLevel));
    return { items: low.slice((query.page - 1) * query.pageSize, query.page * query.pageSize), total: low.length };
  }
}
