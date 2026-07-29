# AgriLink Database Plan

## Purpose

This document identifies the planned data model and relationships. It is not the final schema: table names, columns, constraints, indexes, enums, and migration files must be finalized during the database design phase.

## Planned entities

### Identity and access

- **User:** login identity, contact details, account state, and timestamps.
- **Role / UserRole:** buyer, farmer, transporter, and admin assignments.
- **Profile:** shared personal and contact information.
- **FarmerProfile:** farm identity, verification state, service locations, and business details.
- **TransporterProfile:** logistics identity, verification state, capabilities, and availability.
- **Address:** reusable billing, delivery, pickup, and farm addresses.
- **Session / Credential:** secure authentication records as required by the selected auth solution.

### Catalog and inventory

- **Category:** hierarchical product classification.
- **Product:** farmer-owned listing with name, description, category, unit, and publication state.
- **ProductMedia:** ordered image or media references stored outside the database.
- **Inventory:** available and reserved quantity for a product or stock lot.
- **Price:** current or time-bounded product pricing.
- **WishlistItem:** a buyer-to-product saved relationship.
- **RecentlyViewedItem:** a buyer's recent product activity with a timestamp.

### Commerce

- **Cart / CartItem:** a buyer's pending selections and quantities.
- **Order:** buyer, lifecycle state, totals, delivery choice, and immutable checkout snapshot.
- **OrderItem:** product, farmer, quantity, unit price, and line total captured at purchase time.
- **OrderAddress:** immutable delivery or pickup address snapshot.
- **OrderStatusHistory:** ordered audit trail of order state changes.
- **Payment:** provider, amount, currency, state, and provider reference.
- **Refund:** payment reversal record when supported.

### Logistics

- **Delivery:** fulfillment method, route endpoints, estimated times, and state.
- **DeliveryAssignment:** delivery-to-transporter/driver assignment history.
- **Vehicle:** transporter vehicle and capacity information.
- **TrackingEvent:** timestamped delivery location or state event.
- **ProofOfDelivery:** handoff evidence and verification metadata.

### Platform operations

- **Notification:** in-app notification state and delivery metadata.
- **Message / Conversation:** optional buyer, farmer, and transporter communication records.
- **VerificationRequest:** farmer or transporter review workflow.
- **AuditLog:** security- and administration-relevant actor actions.

## Planned relationships

- A user has one or more roles and may have a role-specific profile.
- A farmer owns many products; each product belongs to a category and has inventory, prices, and media.
- A buyer has one active cart, many wishlist items, recent views, and orders.
- A cart has many items; each item references a product and requested quantity.
- An order belongs to one buyer and has many order items. Items may involve multiple farmers, so fulfillment boundaries must be decided before the final schema.
- An order has status-history records, payment records, and one or more delivery records depending on fulfillment design.
- A delivery can have assignment history, tracking events, and proof of delivery.
- Admin and verification actions produce auditable records.

## Design decisions required

- Single-order versus farmer-specific sub-order model
- Inventory reservation timing and oversell prevention
- Currency and monetary precision strategy
- Status transition rules and cancellation boundaries
- Soft deletion, retention, and anonymization policy
- Geographic data representation and search requirements
- Product price history and promotion model
- Conversation scope and message retention
- Authentication provider and session storage model
- Multi-tenancy or organization support, if required

## Data quality and operational requirements

- Use database constraints for identifiers, required relationships, uniqueness, and valid quantities.
- Use transactions for inventory reservation, order creation, payment updates, and state transitions.
- Preserve checkout snapshots so later catalog edits do not change historical orders.
- Add indexes only after mapping primary query patterns.
- Record timestamps consistently in UTC.
- Encrypt sensitive data in transit and at rest; minimize stored personal data.
- Define backups, restore testing, migrations, seed data, and retention before production.

