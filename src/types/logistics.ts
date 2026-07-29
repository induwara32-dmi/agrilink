import type { DeliveryStatus, Role, VehicleType } from '@prisma/client';

export interface LogisticsActor { userId: string; role: Role; requestId: string }
export interface PageQuery { page: number; pageSize: number }
export interface VehicleInput { ownerId?: string; type: VehicleType; registrationNumber: string; make?: string; model?: string; color?: string; capacity?: string; capacityUnit?: string; isActive?: boolean }
export type VehicleUpdateInput = Partial<Omit<VehicleInput, 'ownerId'>>;
export interface AssignmentInput { transporterId: string; vehicleId: string }
export interface ScheduleInput { scheduledPickupAt: Date; vehicleId?: string }
export interface DeliveryTransitionInput { status: DeliveryStatus; note?: string; latitude?: string; longitude?: string }
export interface ProofInput { proofStorageKey?: string; photoMetadata?: Record<string, string | number | boolean | null>; receiverName: string; receiverSignature?: string; notes?: string }
