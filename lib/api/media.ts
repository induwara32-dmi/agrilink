import { apiRequest, apiUpload } from './client';
import type { ProductImage } from './types';

export type MediaImage = ProductImage & { storageKey: string; width: number; height: number; bytes: number; format: string; isPrimary: boolean };
export type ProfileMedia = { avatarUrl: string | null };
export type DeliveryProof = { id: string; proofUrl: string; proofStorageKey: string; recipientName: string; proofUploadedById: string };

export function uploadProductImages(productId: string, files: File[], altText: string, onProgress?: (percent: number) => void) { const body = new FormData(); files.forEach(file => body.append('images', file)); if (altText) body.append('altText', altText); return apiUpload<MediaImage[]>(`/products/${encodeURIComponent(productId)}/images`, 'POST', body, onProgress); }
export const reorderProductImages = (productId: string, imageIds: string[]) => apiRequest<MediaImage[]>(`/products/${encodeURIComponent(productId)}/images/reorder`, { method: 'PUT', body: { imageIds }, authenticated: true });
export const setPrimaryProductImage = (productId: string, imageId: string) => apiRequest<MediaImage>(`/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}/primary`, { method: 'PATCH', authenticated: true });
export const deleteProductImage = (productId: string, imageId: string) => apiRequest<{ message: string }>(`/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`, { method: 'DELETE', authenticated: true });
export function uploadProfileImage(file: File, onProgress?: (percent: number) => void) { const body = new FormData(); body.append('image', file); return apiUpload<ProfileMedia>('/me/avatar', 'PUT', body, onProgress); }
export const deleteProfileImage = () => apiRequest<ProfileMedia>('/me/avatar', { method: 'DELETE', authenticated: true });
export function uploadDeliveryProof(deliveryId: string, file: File, fields: { receiverName: string; receiverSignature?: string; notes?: string }, onProgress?: (percent: number) => void) { const body = new FormData(); body.append('image', file); body.append('receiverName', fields.receiverName); if (fields.receiverSignature) body.append('receiverSignature', fields.receiverSignature); if (fields.notes) body.append('notes', fields.notes); return apiUpload<DeliveryProof>(`/deliveries/${encodeURIComponent(deliveryId)}/proof`, 'POST', body, onProgress); }
