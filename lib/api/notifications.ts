import { apiRequest } from './client';

export type NotificationStatusCode = 'UNREAD' | 'READ' | 'ARCHIVED';
export type NotificationRecord = { id: string; type: string; channels: Array<'IN_APP' | 'EMAIL'>; status: NotificationStatusCode; title: string; body: string; data: unknown; readAt: string | null; archivedAt: string | null; createdAt: string };
export const notificationQueryKeys = { all: ['notifications'] as const, list: (page: number, status?: NotificationStatusCode) => [...notificationQueryKeys.all, 'list', page, status] as const, unread: () => [...notificationQueryKeys.all, 'unread-count'] as const };
export const listNotifications = (page = 1, status?: NotificationStatusCode) => { const params = new URLSearchParams({ page: String(page), pageSize: '20' }); if (status) params.set('status', status); return apiRequest<NotificationRecord[]>(`/notifications?${params.toString()}`, { authenticated: true }); };
export const getUnreadCount = () => apiRequest<{ count: number }>('/notifications/unread-count', { authenticated: true });
export const markNotificationRead = (id: string) => apiRequest<NotificationRecord>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST', authenticated: true });
export const markAllNotificationsRead = () => apiRequest<{ updated: number }>('/notifications/mark-all-read', { method: 'POST', authenticated: true });
export const archiveNotification = (id: string) => apiRequest<NotificationRecord>(`/notifications/${encodeURIComponent(id)}`, { method: 'PATCH', authenticated: true, body: { status: 'ARCHIVED' } });
export const deleteNotification = (id: string) => apiRequest<{ message: string }>(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE', authenticated: true });
