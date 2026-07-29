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
