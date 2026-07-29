import { NotificationType, type NotificationChannel } from '@prisma/client';
import type { DomainEvent, DomainEventType } from '../types/domain-events';

export interface RenderedNotification { type: NotificationType; channels: NotificationChannel[]; title: string; body: string; data?: DomainEvent['data'] }
const both = ['IN_APP', 'EMAIL'] as const;
const templates: Record<DomainEventType, { type: NotificationType; title: string; body: (data: DomainEvent['data']) => string }> = {
  AUTH_REGISTERED: { type: NotificationType.ACCOUNT, title: 'Welcome to AgriLink', body: () => 'Your AgriLink account has been registered. Please verify your email address.' },
  AUTH_EMAIL_VERIFIED: { type: NotificationType.ACCOUNT, title: 'Email verified', body: () => 'Your email address has been verified successfully.' },
  AUTH_PASSWORD_RESET: { type: NotificationType.ACCOUNT, title: 'Password changed', body: () => 'Your AgriLink password was reset. Contact support immediately if this was not you.' },
  PRODUCT_CREATED: { type: NotificationType.SYSTEM, title: 'Product created', body: data => `${String(data?.productName ?? 'Your product')} was created successfully.` },
  PRODUCT_LOW_STOCK: { type: NotificationType.SYSTEM, title: 'Low stock alert', body: data => `${String(data?.productName ?? 'A product')} is running low on stock.` },
  PRODUCT_OUT_OF_STOCK: { type: NotificationType.SYSTEM, title: 'Out of stock', body: data => `${String(data?.productName ?? 'A product')} is out of stock.` },
  ORDER_CREATED: { type: NotificationType.ORDER, title: 'Order created', body: data => `Order ${String(data?.orderNumber ?? '')} has been created.` },
  ORDER_ACCEPTED: { type: NotificationType.ORDER, title: 'Order accepted', body: data => `Order ${String(data?.orderNumber ?? '')} has been accepted.` },
  ORDER_CANCELLED: { type: NotificationType.ORDER, title: 'Order cancelled', body: data => `Order ${String(data?.orderNumber ?? '')} has been cancelled.` },
  PAYMENT_RECEIVED: { type: NotificationType.PAYMENT, title: 'Payment received', body: data => `Payment for order ${String(data?.orderNumber ?? '')} was received.` },
  DELIVERY_ASSIGNED: { type: NotificationType.DELIVERY, title: 'Delivery assigned', body: () => 'A delivery has been assigned.' },
  DELIVERY_ACCEPTED: { type: NotificationType.DELIVERY, title: 'Delivery accepted', body: () => 'The assigned driver accepted the delivery.' },
  DELIVERY_PICKED_UP: { type: NotificationType.DELIVERY, title: 'Order picked up', body: () => 'The delivery has been picked up.' },
  DELIVERY_IN_TRANSIT: { type: NotificationType.DELIVERY, title: 'Delivery in transit', body: () => 'The delivery is now in transit.' },
  DELIVERY_DELIVERED: { type: NotificationType.DELIVERY, title: 'Delivery completed', body: () => 'The delivery was completed successfully.' },
  DELIVERY_FAILED: { type: NotificationType.DELIVERY, title: 'Delivery failed', body: () => 'The delivery could not be completed.' },
  FARMER_APPROVED: { type: NotificationType.ACCOUNT, title: 'Farmer account approved', body: () => 'Your farmer profile has been approved.' },
  TRANSPORTER_APPROVED: { type: NotificationType.ACCOUNT, title: 'Transporter account approved', body: () => 'Your transporter profile has been approved.' },
};

export function renderNotification(event: DomainEvent): RenderedNotification {
  const template = templates[event.type];
  return { type: template.type, channels: [...both], title: template.title, body: template.body(event.data), ...(event.data ? { data: event.data } : {}) };
}
