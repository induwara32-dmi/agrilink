import { DeliveryStatus } from '@prisma/client';

export const DEFAULT_DELIVERY_MINUTES = 120;
export const ACTIVE_DELIVERY_STATUSES = [DeliveryStatus.ASSIGNED, DeliveryStatus.ACCEPTED, DeliveryStatus.PICKUP_SCHEDULED, DeliveryStatus.READY_FOR_PICKUP, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT] as const;

export const DELIVERY_TRANSITIONS: Readonly<Record<DeliveryStatus, readonly DeliveryStatus[]>> = {
  PENDING: [DeliveryStatus.PICKUP_SCHEDULED, DeliveryStatus.CANCELLED],
  AWAITING_ASSIGNMENT: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED, DeliveryStatus.FAILED],
  ASSIGNED: [DeliveryStatus.ACCEPTED, DeliveryStatus.REJECTED, DeliveryStatus.CANCELLED],
  ACCEPTED: [DeliveryStatus.PICKUP_SCHEDULED, DeliveryStatus.CANCELLED, DeliveryStatus.FAILED],
  REJECTED: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED],
  PICKUP_SCHEDULED: [DeliveryStatus.READY_FOR_PICKUP, DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED, DeliveryStatus.FAILED],
  READY_FOR_PICKUP: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED, DeliveryStatus.FAILED],
  PICKED_UP: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
  IN_TRANSIT: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
};
