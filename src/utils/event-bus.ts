import { logger } from '../config/logger';
import type { DomainEvent, DomainEventHandler, DomainEventInput, DomainEventPublisher, DomainEventType } from '../types/domain-events';
import { createTokenId } from './token';

export class EventBus implements DomainEventPublisher {
  private readonly handlers = new Map<DomainEventType, Set<DomainEventHandler>>();

  public subscribe(types: readonly DomainEventType[], handler: DomainEventHandler): () => void {
    for (const type of types) {
      const handlers = this.handlers.get(type) ?? new Set<DomainEventHandler>();
      handlers.add(handler);
      this.handlers.set(type, handlers);
    }
    return () => { for (const type of types) this.handlers.get(type)?.delete(handler); };
  }

  public async publish(input: DomainEventInput): Promise<void> {
    const event: DomainEvent = { ...input, id: createTokenId(), occurredAt: new Date(), recipientIds: [...new Set(input.recipientIds)] };
    const results = await Promise.allSettled([...(this.handlers.get(event.type) ?? [])].map(handler => handler(event)));
    for (const result of results) if (result.status === 'rejected') logger.error({ err: result.reason, eventId: event.id, eventType: event.type }, 'Domain event subscriber failed');
  }
}
