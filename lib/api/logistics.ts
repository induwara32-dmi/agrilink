import { apiRequest } from './client';
import type { DeliveryMethodCode, DeliveryStatusCode, DeliveryStatusHistory } from './commerce';

export type VehicleTypeCode = 'BICYCLE' | 'MOTORCYCLE' | 'TRICYCLE' | 'CAR' | 'PICKUP_TRUCK' | 'VAN' | 'REFRIGERATED_VAN' | 'TRUCK' | 'OTHER';
export const VEHICLE_TYPE_OPTIONS: Array<{ value: VehicleTypeCode; label: string }> = [
  { value: 'BICYCLE', label: 'Bicycle' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'TRICYCLE', label: 'Tricycle' },
  { value: 'CAR', label: 'Car' },
  { value: 'PICKUP_TRUCK', label: 'Pickup truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'REFRIGERATED_VAN', label: 'Refrigerated van' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'OTHER', label: 'Other' },
];

export type DeliveryTracking = {
  id: string; method: DeliveryMethodCode; status: DeliveryStatusCode; scheduledPickupAt: string | null; estimatedDeliveryAt: string | null; pickedUpAt: string | null; deliveredAt: string | null; recipientName: string | null; recipientNote: string | null; proofStorageKey: string | null; proofUrl: string | null; proofUploadedById: string | null;
  farmerOrder: { id: string; farmerOrderNumber: string; buyerNotes: string | null; deliveryRecipientName: string | null; deliveryRecipientPhone: string | null; deliveryLine1: string | null; deliveryLine2: string | null; deliveryCity: string | null; deliveryDistrict: string | null; deliveryRegion: string | null; farmer: { id: string; farmName: string; userId: string }; order: { id: string; orderNumber: string; buyerId: string }; items: Array<{ id: string; productName: string; quantity: string; unit: string }> };
  transportJob: { id: string; status: string; transporter: { id: string; businessName: string | null; whatsappNumber: string | null; userId: string; user: { phone: string | null; profile: { firstName: string; lastName: string } | null } } | null; vehicle: { registrationNumber: string; type: string; make: string | null; model: string | null } | null } | null;
  vehicle: { registrationNumber: string; type: string; make: string | null; model: string | null } | null;
  routePlan: { originLabel: string; destinationLabel: string; distanceKm: string | null; estimatedMinutes: number | null } | null;
  statusHistory: DeliveryStatusHistory[];
};
export const trackingQueryKeys = { delivery: (id: string) => ['deliveries', id] as const };
export const getDelivery = (deliveryId: string) => apiRequest<DeliveryTracking>(`/deliveries/${encodeURIComponent(deliveryId)}`, { authenticated: true });
export const scheduleDelivery = (deliveryId: string, scheduledPickupAt: string) => apiRequest<DeliveryTracking>(`/deliveries/${encodeURIComponent(deliveryId)}/schedule`, { method: 'POST', authenticated: true, body: { scheduledPickupAt } });
export const transitionDelivery = (deliveryId: string, status: DeliveryStatusCode, note?: string) => apiRequest<DeliveryTracking>(`/deliveries/${encodeURIComponent(deliveryId)}/transitions`, { method: 'POST', authenticated: true, body: note ? { status, note } : { status } });
export type TransportJob = { id: string; status: string; offeredFee: string; currency: string; requiredCapacity: string | null; capacityUnit: string | null; delivery: { id: string; status: DeliveryStatusCode; farmerOrder: { farmerOrderNumber: string; items: Array<{ productName: string; quantity: string; unit: string }>; farmer: { farmName: string }; order: { orderNumber: string } }; routePlan: { originLabel: string; destinationLabel: string; estimatedMinutes: number | null } | null } };
export type JobStatusBucketCode = 'open' | 'active' | 'history';
export type TransportJobDetail = {
  id: string; status: string; offeredFee: string; currency: string; requiredCapacity: string | null; capacityUnit: string | null;
  transporter: { id: string; businessName: string | null; userId: string } | null;
  vehicle: { id: string; registrationNumber: string; type: string; make: string | null; model: string | null } | null;
  delivery: {
    id: string; status: DeliveryStatusCode; scheduledPickupAt: string | null; estimatedDeliveryAt: string | null; pickedUpAt: string | null; deliveredAt: string | null; proofUrl: string | null;
    farmerOrder: {
      id: string; farmerOrderNumber: string; buyerNotes: string | null;
      deliveryRecipientName: string | null; deliveryRecipientPhone: string | null;
      deliveryLine1: string | null; deliveryLine2: string | null; deliveryCity: string | null; deliveryDistrict: string | null; deliveryRegion: string | null; deliveryCountryCode: string | null;
      items: Array<{ id: string; productName: string; quantity: string; unit: string }>;
      farmer: { id: string; farmName: string; userId: string; whatsappNumber: string | null; user: { phone: string | null; addresses: Array<{ line1: string; line2: string | null; city: string; district: string | null; region: string | null }> } };
      order: { id: string; orderNumber: string; buyerId: string };
    };
    routePlan: { originLabel: string; destinationLabel: string; distanceKm: string | null; estimatedMinutes: number | null } | null;
  };
};
export type VehicleRecord = { id: string; type: VehicleTypeCode; registrationNumber: string; make: string | null; model: string | null; color: string | null; capacity: string | null; capacityUnit: string | null; isActive: boolean; isAvailable: boolean };
export const listDeliveries = (page = 1, pageSize = 10) => apiRequest<DeliveryTracking[]>(`/deliveries?page=${page}&pageSize=${pageSize}`, { authenticated: true });
export const listTransportJobs = (page = 1, pageSize = 10, status?: JobStatusBucketCode) => apiRequest<TransportJob[]>(`/transport-jobs?page=${page}&pageSize=${pageSize}${status ? `&status=${status}` : ''}`, { authenticated: true });
export const getTransportJob = (jobId: string) => apiRequest<TransportJobDetail>(`/transport-jobs/${encodeURIComponent(jobId)}`, { authenticated: true });
export const acceptTransportJob = (jobId: string) => apiRequest<TransportJobDetail>(`/transport-jobs/${encodeURIComponent(jobId)}/accept`, { method: 'POST', authenticated: true, body: {} });
export const rejectTransportJob = (jobId: string, reason?: string) => apiRequest<TransportJobDetail>(`/transport-jobs/${encodeURIComponent(jobId)}/reject`, { method: 'POST', authenticated: true, body: reason ? { reason } : {} });
export const listVehicles = (page = 1, pageSize = 20) => apiRequest<VehicleRecord[]>(`/vehicles?page=${page}&pageSize=${pageSize}`, { authenticated: true });
export type VehicleInput = { type: VehicleTypeCode; registrationNumber: string; make?: string; model?: string; color?: string; capacity?: string; capacityUnit?: string };
export type VehicleUpdateInput = Partial<VehicleInput> & { isActive?: boolean };
export const createVehicle = (input: VehicleInput) => apiRequest<VehicleRecord>('/vehicles', { method: 'POST', authenticated: true, body: input });
export const updateVehicle = (vehicleId: string, input: VehicleUpdateInput) => apiRequest<VehicleRecord>(`/vehicles/${encodeURIComponent(vehicleId)}`, { method: 'PATCH', authenticated: true, body: input });
