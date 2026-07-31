import { AccountStatus, DeliveryMethod, DeliveryStatus, FarmerOrderStatus, InventoryMovementType, OrderStatus, Prisma, Role, TransportJobStatus, VerificationStatus, type PrismaClient } from '@prisma/client';
import { ACTIVE_DELIVERY_STATUSES, DEFAULT_DELIVERY_MINUTES } from '../constants/logistics';
import type { AssignmentInput, DeliveryTransitionInput, LogisticsActor, PageQuery, ScheduleInput, VehicleInput, VehicleUpdateInput } from '../types/logistics';
import { BaseRepository } from './base.repository';

const jobInclude = { delivery: { include: { farmerOrder: { include: { items: true, farmer: true, order: { select: { buyerId: true, orderNumber: true } } } }, routePlan: true, statusHistory: { orderBy: { occurredAt: 'asc' as const } } } }, transporter: { include: { user: { select: { id: true, profile: true } } } }, vehicle: true, rejections: { orderBy: { createdAt: 'desc' as const } } } satisfies Prisma.TransportJobInclude;
const deliveryInclude = { farmerOrder: { include: { farmer: true, order: true, items: true } }, transportJob: { include: { transporter: true, vehicle: true } }, vehicle: true, routePlan: true, statusHistory: { orderBy: { occurredAt: 'asc' as const } } } satisfies Prisma.DeliveryInclude;
const activeJobStatuses = [TransportJobStatus.ASSIGNED, TransportJobStatus.ACCEPTED, TransportJobStatus.IN_PROGRESS];

export class LogisticsRepository extends BaseRepository {
  public constructor(database: PrismaClient) { super(database); }

  public async listJobs(actor: LogisticsActor, query: PageQuery) {
    const where: Prisma.TransportJobWhereInput = actor.role === Role.TRANSPORTER ? { OR: [{ status: TransportJobStatus.OPEN }, { transporter: { userId: actor.userId } }] } : {};
    const [items, total] = await this.database.$transaction([this.database.transportJob.findMany({ where, include: jobInclude, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.database.transportJob.count({ where })]);
    return { items, total };
  }

  public findJob(id: string) { return this.database.transportJob.findUnique({ where: { id }, include: jobInclude }); }
  public findDelivery(id: string) { return this.database.delivery.findUnique({ where: { id }, include: deliveryInclude }); }
  public async listDeliveries(actor: LogisticsActor, query: PageQuery) {
    const where: Prisma.DeliveryWhereInput = actor.role === Role.BUYER ? { farmerOrder: { order: { buyerId: actor.userId } } } : actor.role === Role.FARMER ? { farmerOrder: { farmer: { userId: actor.userId } } } : actor.role === Role.TRANSPORTER ? { transportJob: { transporter: { userId: actor.userId } } } : {};
    const [items, total] = await this.database.$transaction([this.database.delivery.findMany({ where, include: deliveryInclude, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.database.delivery.count({ where })]);
    return { items, total };
  }

  public async assign(jobId: string, input: AssignmentInput | null, actorId: string, requestId: string) {
    return this.database.$transaction(async transaction => {
      await transaction.$queryRaw(Prisma.sql`SELECT id FROM "TransportJob" WHERE id = ${jobId}::uuid FOR UPDATE`);
      const job = await transaction.transportJob.findUnique({ where: { id: jobId }, include: { delivery: true } });
      if (!job || job.delivery.method !== DeliveryMethod.PLATFORM_TRANSPORTER) throw new Error('JOB_NOT_FOUND');
      if (job.status !== TransportJobStatus.OPEN && job.status !== TransportJobStatus.REJECTED && job.status !== TransportJobStatus.ASSIGNED && job.status !== TransportJobStatus.ACCEPTED) throw new Error('JOB_NOT_ASSIGNABLE');

      const candidate = input ? await this.manualCandidate(transaction, input) : await this.automaticCandidate(transaction, job);
      if (!candidate) throw new Error('NO_AVAILABLE_DRIVER');
      this.validateCapacity(job, candidate.vehicle);
      const conflict = await transaction.transportJob.findFirst({ where: { id: { not: job.id }, status: { in: activeJobStatuses }, OR: [{ transporterId: candidate.transporter.id }, { vehicleId: candidate.vehicle.id }] } });
      if (conflict) throw new Error('ASSIGNMENT_CONFLICT');

      if (job.status === TransportJobStatus.ACCEPTED) {
        if (job.transporterId) await transaction.transporterProfile.update({ where: { id: job.transporterId }, data: { isAvailable: true } });
        if (job.vehicleId) await transaction.vehicle.update({ where: { id: job.vehicleId }, data: { isAvailable: true } });
      }

      const updated = await transaction.transportJob.update({ where: { id: job.id }, data: { transporterId: candidate.transporter.id, vehicleId: candidate.vehicle.id, acceptedById: null, acceptedAt: null, status: TransportJobStatus.ASSIGNED } });
      await transaction.delivery.update({ where: { id: job.deliveryId }, data: { status: DeliveryStatus.ASSIGNED } });
      await transaction.deliveryStatusHistory.create({ data: { deliveryId: job.deliveryId, actorId, fromStatus: job.delivery.status, toStatus: DeliveryStatus.ASSIGNED, note: input ? 'Manually assigned by admin' : 'Automatically assigned' } });
      await transaction.auditLog.create({ data: { actorId, action: input ? 'TRANSPORT_JOB_MANUALLY_ASSIGNED' : 'TRANSPORT_JOB_AUTO_ASSIGNED', entityType: 'TransportJob', entityId: job.id, requestId, after: { transporterId: candidate.transporter.id, vehicleId: candidate.vehicle.id } } });
      return transaction.transportJob.findUniqueOrThrow({ where: { id: updated.id }, include: jobInclude });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  public async accept(jobId: string, userId: string, vehicleId: string | undefined, requestId: string) {
    return this.database.$transaction(async transaction => {
      await transaction.$queryRaw(Prisma.sql`SELECT id FROM "TransportJob" WHERE id = ${jobId}::uuid FOR UPDATE`);
      const profile = await transaction.transporterProfile.findUnique({ where: { userId }, include: { user: true } });
      const job = await transaction.transportJob.findUnique({ where: { id: jobId }, include: { delivery: true } });
      if (!profile || !job || job.transporterId !== profile.id || job.status !== TransportJobStatus.ASSIGNED) throw new Error('JOB_NOT_ASSIGNED');
      if (!profile.isAvailable || profile.verificationStatus !== VerificationStatus.APPROVED || profile.deletedAt || profile.user.status !== AccountStatus.ACTIVE || profile.user.deletedAt) throw new Error('DRIVER_UNAVAILABLE');
      const selectedVehicleId = vehicleId ?? job.vehicleId;
      if (!selectedVehicleId) throw new Error('VEHICLE_REQUIRED');
      const vehicle = await transaction.vehicle.findFirst({ where: { id: selectedVehicleId, ownerId: userId, isActive: true, isAvailable: true, deletedAt: null } });
      if (!vehicle) throw new Error('VEHICLE_UNAVAILABLE');
      this.validateCapacity(job, vehicle);
      const conflict = await transaction.transportJob.findFirst({ where: { id: { not: job.id }, status: { in: activeJobStatuses }, OR: [{ transporterId: profile.id }, { vehicleId: vehicle.id }] } });
      if (conflict) throw new Error('ASSIGNMENT_CONFLICT');
      await transaction.transportJob.update({ where: { id: job.id }, data: { status: TransportJobStatus.ACCEPTED, acceptedById: userId, acceptedAt: new Date(), vehicleId: vehicle.id } });
      await transaction.transporterProfile.update({ where: { id: profile.id }, data: { isAvailable: false } });
      await transaction.vehicle.update({ where: { id: vehicle.id }, data: { isAvailable: false } });
      await transaction.delivery.update({ where: { id: job.deliveryId }, data: { status: DeliveryStatus.ACCEPTED } });
      await transaction.deliveryStatusHistory.create({ data: { deliveryId: job.deliveryId, actorId: userId, fromStatus: job.delivery.status, toStatus: DeliveryStatus.ACCEPTED, note: 'Driver accepted assignment' } });
      await transaction.auditLog.create({ data: { actorId: userId, action: 'TRANSPORT_JOB_ACCEPTED', entityType: 'TransportJob', entityId: job.id, requestId } });
      return transaction.transportJob.findUniqueOrThrow({ where: { id: job.id }, include: jobInclude });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  public async reject(jobId: string, userId: string, reason: string | undefined, requestId: string) {
    return this.database.$transaction(async transaction => {
      await transaction.$queryRaw(Prisma.sql`SELECT id FROM "TransportJob" WHERE id = ${jobId}::uuid FOR UPDATE`);
      const profile = await transaction.transporterProfile.findUnique({ where: { userId } });
      const job = await transaction.transportJob.findUnique({ where: { id: jobId }, include: { delivery: true } });
      if (!profile || !job || job.transporterId !== profile.id || job.status !== TransportJobStatus.ASSIGNED) throw new Error('JOB_NOT_ASSIGNED');
      await transaction.transportJobRejection.create({ data: { jobId, userId, ...(reason ? { reason } : {}) } });
      await transaction.transportJob.update({ where: { id: job.id }, data: { status: TransportJobStatus.REJECTED } });
      await transaction.delivery.update({ where: { id: job.deliveryId }, data: { status: DeliveryStatus.REJECTED } });
      await transaction.deliveryStatusHistory.create({ data: { deliveryId: job.deliveryId, actorId: userId, fromStatus: job.delivery.status, toStatus: DeliveryStatus.REJECTED, ...(reason ? { note: reason } : {}) } });
      await transaction.auditLog.create({ data: { actorId: userId, action: 'TRANSPORT_JOB_REJECTED', entityType: 'TransportJob', entityId: job.id, requestId } });
      return transaction.transportJob.findUniqueOrThrow({ where: { id: job.id }, include: jobInclude });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  public async schedule(deliveryId: string, input: ScheduleInput, vehicleId: string | undefined, actor: LogisticsActor) {
    return this.database.$transaction(async transaction => {
      const delivery = await transaction.delivery.findUnique({ where: { id: deliveryId }, include: deliveryInclude });
      if (!delivery) throw new Error('DELIVERY_NOT_FOUND');
      const estimateMinutes = delivery.routePlan?.estimatedMinutes ?? DEFAULT_DELIVERY_MINUTES;
      const estimatedDeliveryAt = new Date(input.scheduledPickupAt.getTime() + estimateMinutes * 60_000);
      if (vehicleId) await this.validateDirectVehicle(transaction, delivery, vehicleId, actor);
      await transaction.delivery.update({ where: { id: delivery.id }, data: { status: DeliveryStatus.PICKUP_SCHEDULED, scheduledPickupAt: input.scheduledPickupAt, estimatedDeliveryAt, ...(vehicleId ? { vehicleId } : {}) } });
      await transaction.deliveryStatusHistory.create({ data: { deliveryId: delivery.id, actorId: actor.userId, fromStatus: delivery.status, toStatus: DeliveryStatus.PICKUP_SCHEDULED, note: 'Pickup scheduled' } });
      await transaction.auditLog.create({ data: { actorId: actor.userId, action: 'DELIVERY_SCHEDULED', entityType: 'Delivery', entityId: delivery.id, requestId: actor.requestId, after: { scheduledPickupAt: input.scheduledPickupAt.toISOString(), estimatedDeliveryAt: estimatedDeliveryAt.toISOString() } } });
      return transaction.delivery.findUniqueOrThrow({ where: { id: delivery.id }, include: deliveryInclude });
    });
  }

  public async transition(deliveryId: string, input: DeliveryTransitionInput, actor: LogisticsActor) {
    return this.database.$transaction(async transaction => {
      const delivery = await transaction.delivery.findUnique({ where: { id: deliveryId }, include: deliveryInclude });
      if (!delivery) throw new Error('DELIVERY_NOT_FOUND');
      const now = new Date();
      await transaction.delivery.update({ where: { id: delivery.id }, data: { status: input.status, ...(input.status === DeliveryStatus.PICKED_UP ? { pickedUpAt: now } : {}), ...(input.status === DeliveryStatus.DELIVERED ? { deliveredAt: now } : {}) } });
      await transaction.deliveryStatusHistory.create({ data: { deliveryId: delivery.id, actorId: actor.userId, fromStatus: delivery.status, toStatus: input.status, ...(input.note ? { note: input.note } : {}), ...(input.latitude ? { latitude: new Prisma.Decimal(input.latitude) } : {}), ...(input.longitude ? { longitude: new Prisma.Decimal(input.longitude) } : {}) } });
      if (delivery.transportJob) await transaction.transportJob.update({ where: { id: delivery.transportJob.id }, data: { status: input.status === DeliveryStatus.DELIVERED ? TransportJobStatus.COMPLETED : input.status === DeliveryStatus.CANCELLED ? TransportJobStatus.CANCELLED : input.status === DeliveryStatus.FAILED ? TransportJobStatus.FAILED : input.status === DeliveryStatus.PICKED_UP || input.status === DeliveryStatus.IN_TRANSIT ? TransportJobStatus.IN_PROGRESS : delivery.transportJob.status, ...(input.status === DeliveryStatus.PICKED_UP ? { startedAt: now } : {}), ...(input.status === DeliveryStatus.DELIVERED ? { completedAt: now } : {}) } });
      if (input.status === DeliveryStatus.DELIVERED) await this.completeFulfillment(transaction, delivery, actor.userId);
      if (input.status === DeliveryStatus.CANCELLED) await this.cancelFulfillment(transaction, delivery, actor.userId);
      if ((input.status === DeliveryStatus.DELIVERED || input.status === DeliveryStatus.CANCELLED || input.status === DeliveryStatus.FAILED) && delivery.transportJob) {
        if (delivery.transportJob.transporterId) await transaction.transporterProfile.update({ where: { id: delivery.transportJob.transporterId }, data: { isAvailable: true } });
        if (delivery.transportJob.vehicleId) await transaction.vehicle.update({ where: { id: delivery.transportJob.vehicleId }, data: { isAvailable: true } });
      }
      await transaction.auditLog.create({ data: { actorId: actor.userId, action: `DELIVERY_${input.status}`, entityType: 'Delivery', entityId: delivery.id, requestId: actor.requestId } });
      return transaction.delivery.findUniqueOrThrow({ where: { id: delivery.id }, include: deliveryInclude });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  public async listVehicles(actor: LogisticsActor, query: PageQuery) {
    const where: Prisma.VehicleWhereInput = { deletedAt: null, ...(actor.role !== Role.ADMIN ? { ownerId: actor.userId } : {}) };
    const [items, total] = await this.database.$transaction([this.database.vehicle.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }), this.database.vehicle.count({ where })]);
    return { items, total };
  }
  public async createVehicle(ownerId: string, input: VehicleInput, actor: LogisticsActor) { return this.database.$transaction(async transaction => { const item = await transaction.vehicle.create({ data: { ownerId, type: input.type, registrationNumber: input.registrationNumber, ...(input.make ? { make: input.make } : {}), ...(input.model ? { model: input.model } : {}), ...(input.color ? { color: input.color } : {}), ...(input.capacity && input.capacityUnit ? { capacity: new Prisma.Decimal(input.capacity), capacityUnit: input.capacityUnit } : {}), ...(input.isActive !== undefined ? { isActive: input.isActive } : {}) } }); await transaction.auditLog.create({ data: { actorId: actor.userId, action: 'VEHICLE_CREATED', entityType: 'Vehicle', entityId: item.id, requestId: actor.requestId } }); return item; }); }
  public async updateVehicle(id: string, input: VehicleUpdateInput, actor: LogisticsActor) { return this.database.$transaction(async transaction => { const item = await transaction.vehicle.update({ where: { id }, data: { ...input, ...(input.capacity ? { capacity: new Prisma.Decimal(input.capacity) } : {}) } }); await transaction.auditLog.create({ data: { actorId: actor.userId, action: 'VEHICLE_UPDATED', entityType: 'Vehicle', entityId: id, requestId: actor.requestId } }); return item; }); }
  public findVehicle(id: string) { return this.database.vehicle.findFirst({ where: { id, deletedAt: null } }); }
  public findVehicleOwner(id: string) { return this.database.user.findFirst({ where: { id, deletedAt: null }, select: { id: true, role: true, status: true } }); }
  public async deleteVehicle(id: string, actor: LogisticsActor): Promise<void> { await this.database.$transaction([this.database.vehicle.update({ where: { id }, data: { deletedAt: new Date(), isActive: false, isAvailable: false } }), this.database.auditLog.create({ data: { actorId: actor.userId, action: 'VEHICLE_DELETED', entityType: 'Vehicle', entityId: id, requestId: actor.requestId } })]); }

  private async manualCandidate(transaction: Prisma.TransactionClient, input: AssignmentInput) {
    const transporter = await transaction.transporterProfile.findFirst({ where: { id: input.transporterId, verificationStatus: VerificationStatus.APPROVED, isAvailable: true, deletedAt: null, user: { status: AccountStatus.ACTIVE, deletedAt: null } } });
    if (!transporter) return null;
    const vehicle = await transaction.vehicle.findFirst({ where: { id: input.vehicleId, ownerId: transporter.userId, isActive: true, isAvailable: true, deletedAt: null } });
    return vehicle ? { transporter, vehicle } : null;
  }
  private async automaticCandidate(transaction: Prisma.TransactionClient, job: { id: string; requiredCapacity: Prisma.Decimal | null; capacityUnit: string | null }) {
    const rejected = await transaction.transportJobRejection.findMany({ where: { jobId: job.id }, select: { userId: true } });
    const transporters = await transaction.transporterProfile.findMany({ where: { verificationStatus: VerificationStatus.APPROVED, isAvailable: true, deletedAt: null, userId: { notIn: rejected.map(item => item.userId) }, user: { status: AccountStatus.ACTIVE, deletedAt: null } }, orderBy: { updatedAt: 'asc' } });
    for (const transporter of transporters) {
      const vehicles = await transaction.vehicle.findMany({ where: { ownerId: transporter.userId, isActive: true, isAvailable: true, deletedAt: null, ...(job.requiredCapacity ? { capacity: { gte: job.requiredCapacity }, capacityUnit: job.capacityUnit } : {}) }, orderBy: { capacity: 'asc' } });
      for (const vehicle of vehicles) {
        const conflict = await transaction.transportJob.findFirst({ where: { status: { in: activeJobStatuses }, OR: [{ transporterId: transporter.id }, { vehicleId: vehicle.id }] } });
        if (!conflict) return { transporter, vehicle };
      }
    }
    return null;
  }
  private validateCapacity(job: { requiredCapacity: Prisma.Decimal | null; capacityUnit: string | null }, vehicle: { capacity: Prisma.Decimal | null; capacityUnit: string | null }): void { if (job.requiredCapacity && (!vehicle.capacity || vehicle.capacity.lessThan(job.requiredCapacity) || vehicle.capacityUnit !== job.capacityUnit)) throw new Error('VEHICLE_CAPACITY'); }
  private async validateDirectVehicle(transaction: Prisma.TransactionClient, delivery: Prisma.DeliveryGetPayload<{ include: typeof deliveryInclude }>, vehicleId: string, actor: LogisticsActor) { const expectedOwner = delivery.method === DeliveryMethod.FARMER_DELIVERY ? delivery.farmerOrder.farmer.userId : delivery.farmerOrder.order.buyerId; const vehicle = await transaction.vehicle.findFirst({ where: { id: vehicleId, ownerId: expectedOwner, isActive: true, isAvailable: true, deletedAt: null } }); if (!vehicle || (actor.role !== Role.ADMIN && actor.userId !== expectedOwner)) throw new Error('VEHICLE_UNAVAILABLE'); const units = new Set(delivery.farmerOrder.items.map(item => item.unit)); if (units.size === 1) { const required = delivery.farmerOrder.items.reduce((sum, item) => sum.add(item.quantity), new Prisma.Decimal(0)); if (!vehicle.capacity || vehicle.capacity.lessThan(required) || vehicle.capacityUnit !== delivery.farmerOrder.items[0]!.unit) throw new Error('VEHICLE_CAPACITY'); } const conflict = await transaction.delivery.findFirst({ where: { id: { not: delivery.id }, vehicleId, status: { in: [...ACTIVE_DELIVERY_STATUSES] } } }); if (conflict) throw new Error('ASSIGNMENT_CONFLICT'); }
  private async completeFulfillment(transaction: Prisma.TransactionClient, delivery: Prisma.DeliveryGetPayload<{ include: typeof deliveryInclude }>, actorId: string) { for (const item of delivery.farmerOrder.items) { const inventory = await transaction.inventory.findUniqueOrThrow({ where: { productId: item.productId } }); if (inventory.quantityReserved.lessThan(item.quantity) || inventory.quantityOnHand.lessThan(item.quantity)) throw new Error('INVENTORY_RESERVATION_INVALID'); await transaction.inventory.update({ where: { id: inventory.id }, data: { quantityOnHand: { decrement: item.quantity }, quantityReserved: { decrement: item.quantity }, version: { increment: 1 } } }); await transaction.inventoryMovement.create({ data: { inventoryId: inventory.id, actorId, type: InventoryMovementType.SALE, quantity: item.quantity.negated(), balanceAfter: inventory.quantityOnHand.sub(item.quantity), referenceType: 'FarmerOrder', referenceId: delivery.farmerOrderId, reason: 'Delivery completed' } }); } await transaction.farmerOrder.update({ where: { id: delivery.farmerOrderId }, data: { status: FarmerOrderStatus.DELIVERED, completedAt: new Date() } }); await transaction.farmerOrderStatusHistory.create({ data: { farmerOrderId: delivery.farmerOrderId, actorId, fromStatus: delivery.farmerOrder.status, toStatus: FarmerOrderStatus.DELIVERED, reason: 'Delivery completed' } }); await this.updateAggregateOrder(transaction, delivery.farmerOrder.orderId, delivery.farmerOrder.order.status, actorId); }
  private async cancelFulfillment(transaction: Prisma.TransactionClient, delivery: Prisma.DeliveryGetPayload<{ include: typeof deliveryInclude }>, actorId: string) { for (const item of delivery.farmerOrder.items) { const inventory = await transaction.inventory.findUniqueOrThrow({ where: { productId: item.productId } }); if (inventory.quantityReserved.lessThan(item.quantity)) throw new Error('INVENTORY_RESERVATION_INVALID'); await transaction.inventory.update({ where: { id: inventory.id }, data: { quantityReserved: { decrement: item.quantity }, version: { increment: 1 } } }); await transaction.inventoryMovement.create({ data: { inventoryId: inventory.id, actorId, type: InventoryMovementType.RESERVATION_RELEASE, quantity: item.quantity.negated(), balanceAfter: inventory.quantityOnHand, referenceType: 'FarmerOrder', referenceId: delivery.farmerOrderId, reason: 'Delivery cancelled' } }); } await transaction.farmerOrder.update({ where: { id: delivery.farmerOrderId }, data: { status: FarmerOrderStatus.CANCELLED, cancelledAt: new Date() } }); await transaction.farmerOrderStatusHistory.create({ data: { farmerOrderId: delivery.farmerOrderId, actorId, fromStatus: delivery.farmerOrder.status, toStatus: FarmerOrderStatus.CANCELLED, reason: 'Delivery cancelled' } }); await this.updateAggregateOrder(transaction, delivery.farmerOrder.orderId, delivery.farmerOrder.order.status, actorId); }
  private async updateAggregateOrder(transaction: Prisma.TransactionClient, orderId: string, fromStatus: OrderStatus, actorId: string) { const groups = await transaction.farmerOrder.findMany({ where: { orderId }, select: { status: true } }); const terminal = groups.every(group => group.status === FarmerOrderStatus.DELIVERED || group.status === FarmerOrderStatus.CANCELLED || group.status === FarmerOrderStatus.REJECTED); if (!terminal) return; const nextStatus = groups.every(group => group.status === FarmerOrderStatus.DELIVERED) ? OrderStatus.FULFILLED : groups.every(group => group.status !== FarmerOrderStatus.DELIVERED) ? OrderStatus.CANCELLED : OrderStatus.PARTIALLY_FULFILLED; if (nextStatus === fromStatus) return; await transaction.order.update({ where: { id: orderId }, data: { status: nextStatus, ...(nextStatus === OrderStatus.CANCELLED ? { cancelledAt: new Date() } : {}) } }); await transaction.orderStatusHistory.create({ data: { orderId, actorId, fromStatus, toStatus: nextStatus, reason: 'Farmer order fulfillment aggregate updated' } }); }
}
