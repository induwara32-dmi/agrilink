import { DeliveryStatus, VehicleType } from '@prisma/client';
import { z } from 'zod';

const empty = z.object({}).strict();
const uuid = z.string().uuid();
const decimal = z.string().regex(/^\d+(\.\d{1,3})?$/).refine(value => Number(value) > 0);
const request = <B extends z.ZodType, P extends z.ZodType, Q extends z.ZodType>(body: B, params: P, query: Q) => z.object({ body, params, query });
const pages = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });
const jobParams = z.object({ jobId: uuid });
const deliveryParams = z.object({ deliveryId: uuid });
const vehicleParams = z.object({ vehicleId: uuid });

export const listJobsSchema = request(empty, empty, pages);
export const jobSchema = request(empty, jobParams, empty);
export const deliverySchema = request(empty, deliveryParams, empty);
export const manualAssignmentSchema = request(z.object({ transporterId: uuid, vehicleId: uuid }), jobParams, empty);
export const rejectJobSchema = request(z.object({ reason: z.string().trim().min(2).max(255).optional() }), jobParams, empty);
export const acceptJobSchema = request(z.object({ vehicleId: uuid.optional() }), jobParams, empty);
export const scheduleDeliverySchema = request(z.object({ scheduledPickupAt: z.coerce.date().refine(value => value.getTime() > Date.now(), 'Pickup must be in the future.'), vehicleId: uuid.optional() }), deliveryParams, empty);
export const transitionDeliverySchema = request(z.object({ status: z.nativeEnum(DeliveryStatus), note: z.string().trim().min(2).max(255).optional(), latitude: z.string().regex(/^-?\d+(\.\d{1,7})?$/).optional(), longitude: z.string().regex(/^-?\d+(\.\d{1,7})?$/).optional() }), deliveryParams, empty);
export const listVehiclesSchema = request(empty, empty, pages);
export const vehicleSchema = request(empty, vehicleParams, empty);
const vehicleBody = z.object({ ownerId: uuid.optional(), type: z.nativeEnum(VehicleType), registrationNumber: z.string().trim().min(2).max(64).transform(value => value.toUpperCase()), make: z.string().trim().max(80).optional(), model: z.string().trim().max(80).optional(), color: z.string().trim().max(50).optional(), capacity: decimal.optional(), capacityUnit: z.string().trim().min(1).max(30).optional(), isActive: z.boolean().optional() });
export const createVehicleSchema = request(vehicleBody.refine(value => Boolean(value.capacity) === Boolean(value.capacityUnit), 'Capacity and capacity unit must be provided together.'), empty, empty);
export const updateVehicleSchema = request(vehicleBody.omit({ ownerId: true, registrationNumber: true }).partial().refine(value => Object.keys(value).length > 0), vehicleParams, empty);

export type ManualAssignmentBody = z.infer<typeof manualAssignmentSchema>['body'];
export type AcceptJobBody = z.infer<typeof acceptJobSchema>['body'];
export type RejectJobBody = z.infer<typeof rejectJobSchema>['body'];
export type ScheduleDeliveryBody = z.infer<typeof scheduleDeliverySchema>['body'];
export type TransitionDeliveryBody = z.infer<typeof transitionDeliverySchema>['body'];
export type CreateVehicleBody = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleBody = z.infer<typeof updateVehicleSchema>['body'];
