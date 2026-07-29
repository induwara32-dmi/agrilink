export const DOMAIN_EVENT_TYPES = [
  'AUTH_REGISTERED', 'AUTH_EMAIL_VERIFIED', 'AUTH_PASSWORD_RESET',
  'PRODUCT_CREATED', 'PRODUCT_LOW_STOCK', 'PRODUCT_OUT_OF_STOCK',
  'ORDER_CREATED', 'ORDER_ACCEPTED', 'ORDER_CANCELLED', 'PAYMENT_RECEIVED',
  'DELIVERY_ASSIGNED', 'DELIVERY_ACCEPTED', 'DELIVERY_PICKED_UP', 'DELIVERY_IN_TRANSIT', 'DELIVERY_DELIVERED', 'DELIVERY_FAILED',
  'FARMER_APPROVED', 'TRANSPORTER_APPROVED',
] as const;

export type DomainEventType = typeof DOMAIN_EVENT_TYPES[number];
export type EventData = Record<string, string | number | boolean | null>;
export interface DomainEventInput { type: DomainEventType; recipientIds: string[]; data?: EventData }
export interface DomainEvent extends DomainEventInput { id: string; occurredAt: Date }
export type DomainEventHandler = (event: DomainEvent) => Promise<void>;
export interface DomainEventPublisher { publish(event: DomainEventInput): Promise<void> }
