import { apiRequest } from './client';
import type { DeliveryMethodCode, DeliveryStatusCode, DeliveryStatusHistory } from './commerce';

export type DeliveryTracking = {
  id: string; method: DeliveryMethodCode; status: DeliveryStatusCode; scheduledPickupAt: string | null; estimatedDeliveryAt: string | null; pickedUpAt: string | null; deliveredAt: string | null; recipientName: string | null; recipientNote: string | null; proofStorageKey: string | null;
  farmerOrder: { id: string; farmerOrderNumber: string; buyerNotes: string | null; deliveryRecipientName: string | null; deliveryRecipientPhone: string | null; deliveryLine1: string | null; deliveryLine2: string | null; deliveryCity: string | null; deliveryDistrict: string | null; deliveryRegion: string | null; farmer: { id: string; farmName: string; userId: string }; order: { id: string; orderNumber: string; buyerId: string }; items: Array<{ id: string; productName: string; quantity: string; unit: string }> };
  transportJob: { id: string; status: string; transporter: { id: string; businessName: string | null; userId: string } | null; vehicle: { registrationNumber: string; type: string; make: string | null; model: string | null } | null } | null;
  vehicle: { registrationNumber: string; type: string; make: string | null; model: string | null } | null;
  routePlan: { originLabel: string; destinationLabel: string; distanceKm: string | null; estimatedMinutes: number | null } | null;
  statusHistory: DeliveryStatusHistory[];
};
export const trackingQueryKeys = { delivery: (id: string) => ['deliveries', id] as const };
export const getDelivery = (deliveryId: string) => apiRequest<DeliveryTracking>(`/deliveries/${encodeURIComponent(deliveryId)}`, { authenticated: true });
export type TransportJob = { id: string; status: string; offeredFee: string; currency: string; requiredCapacity: string | null; capacityUnit: string | null; delivery: { id: string; status: DeliveryStatusCode; farmerOrder: { farmerOrderNumber: string; items: Array<{ productName: string; quantity: string; unit: string }>; farmer: { farmName: string }; order: { orderNumber: string } }; routePlan: { originLabel: string; destinationLabel: string; estimatedMinutes: number | null } | null } };
export type VehicleRecord = { id: string; type: string; registrationNumber: string; make: string | null; model: string | null; capacity: string | null; capacityUnit: string | null; isActive: boolean; isAvailable: boolean };
export const listDeliveries = (page = 1, pageSize = 10) => apiRequest<DeliveryTracking[]>(`/deliveries?page=${page}&pageSize=${pageSize}`, { authenticated: true });
export const listTransportJobs = (page = 1, pageSize = 10) => apiRequest<TransportJob[]>(`/transport-jobs?page=${page}&pageSize=${pageSize}`, { authenticated: true });
export const listVehicles = (page = 1, pageSize = 20) => apiRequest<VehicleRecord[]>(`/vehicles?page=${page}&pageSize=${pageSize}`, { authenticated: true });
