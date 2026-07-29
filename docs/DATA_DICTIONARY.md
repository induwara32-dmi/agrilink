# AgriLink Data Dictionary

## Conventions

- All primary and foreign keys are PostgreSQL UUIDs.
- Timestamps use timezone-aware PostgreSQL values and are stored in UTC.
- Money uses `Decimal(19,4)` plus an ISO 4217 currency code.
- Quantities use `Decimal(18,3)` to support weight and fractional units.
- `createdAt` records creation; `updatedAt` records the latest mutation. Append-only ledgers generally omit `updatedAt`.
- `deletedAt` indicates soft deletion where historical references, moderation, or recovery matter.
- Snapshot fields intentionally preserve checkout facts; they are not redundant mutable copies.

## Identity and access

### User

Authentication principal. Important fields are normalized unique `email`, optional unique `phone`, `passwordHash`, `role`, account `status`, verification times, and soft deletion. The backend must never return the password hash. One user has common and role-specific profiles and owns addresses, vehicles, commerce, communication, and audit records.

### Profile

One-to-one common identity record with name, avatar, locale, and time zone. It is cascade-deleted only when the owning user is physically removed under an approved retention operation.

### BuyerProfile

One-to-one buyer extension. It is intentionally small now and gives buyer-only settings a stable future home without polluting `User`.

### FarmerProfile

One-to-one farmer business record containing farm name, description, verification state, and verification time. It owns products and farmer order groups. Soft deletion preserves orders and catalog history.

### TransporterProfile

One-to-one logistics business record containing business/license identity, verification state, and current availability. It owns accepted platform transport jobs through its user and profile relationships.

### AdminProfile

One-to-one privileged account metadata. `createdBy` records the provisioning admin identifier for audit correlation. Admin accounts are provisioned only by trusted administration workflows.

### Address

Reusable user-owned address with recipient details, geographic hierarchy, optional coordinates, and default marker. Orders do not depend on mutable address rows; farmer groups store an immutable delivery snapshot.

## Catalog and inventory

### Category

Unique-slug hierarchical catalog category. `parentId` creates the adjacency tree. Active state, sort order, and soft deletion support controlled marketplace navigation.

### Product

Farmer-owned agricultural listing. It stores category, unique slug/SKU, unit, price, currency, minimum order quantity, publication state, and lifecycle timestamps. Product deletion is soft because order items retain a required product reference.

### ProductImage

Ordered product media reference. `storageKey` is the unique object-storage identity; `url` is the delivery location. Product and sort-order uniqueness prevents ambiguous image ordering.

### Inventory

One current balance per product. `quantityOnHand`, `quantityReserved`, and optimistic-lock `version` support safe availability calculations. Available quantity is derived as on-hand minus reserved.

### InventoryMovement

Append-only inventory ledger entry with movement type, signed quantity, balance after the event, actor, and optional domain reference. `referenceType` and `referenceId` connect reservations, sales, returns, and adjustments without coupling the ledger to one workflow.

## Buyer collections

### Cart

Buyer-owned working basket. It can retain an optional selected reusable delivery address and expiration. Historical carts are allowed; a future partial index enforces one active cart per buyer.

### CartItem

Unique product line in a cart with decimal quantity and provisional delivery method. Farmer grouping is derived through `Product.farmerId`, avoiding a duplicated farmer key.

### Wishlist

One buyer-owned wishlist container.

### WishlistItem

Unique product membership in a wishlist, with creation time representing when it was saved.

### RecentlyViewedItem

Latest recorded product view for one buyer/product pair. Re-viewing updates `viewedAt`; compound uniqueness prevents duplicate history rows while the timestamp index supports the recent-products view.

## Orders

### Order

Buyer checkout aggregate with human-facing unique order number, aggregate status, currency, total breakdown, and lifecycle times. It owns one or more farmer groups, the payment aggregate, coupon redemptions, and status history.

### FarmerOrder

One farmer's immutable commercial and fulfillment group inside an order. `@@unique([orderId, farmerId])` guarantees one group per farmer. It owns the single `deliveryMethod`, group status/totals, buyer notes, an immutable delivery-address snapshot, items, delivery, and reviews.

### OrderItem

Purchased product line owned by a farmer group. Quantity and monetary values are decimal. Product name, SKU, unit, and price are immutable checkout snapshots; `productId` remains for traceability.

### OrderStatusHistory

Append-only buyer-order status transition with optional previous state, required next state, actor, reason, and structured metadata. It provides an aggregate audit trail; group fulfillment progress remains on `FarmerOrder` and delivery history.

### FarmerOrderStatusHistory

Append-only farmer-group preparation/fulfillment transition with actor, reason, and metadata. It preserves group-level decisions independently of the parent order aggregate and physical delivery timeline.

## Logistics

### Delivery

One-to-one fulfillment record for a farmer group. It mirrors the group's delivery method, tracks lifecycle timestamps and proof metadata, and optionally references a direct farmer/buyer vehicle. Pickup codes are stored only as hashes.

### DeliveryStatusHistory

Append-only tracking timeline with status transition, actor, note, occurrence time, and optional location coordinates. `occurredAt` is the business event time; `createdAt` is ingestion time.

### Vehicle

User-owned vehicle shared by farmer, buyer, and transporter use cases. It stores registration, type, optional physical details/capacity, active state, and soft deletion. Service authorization validates the owner's role and assignment.

### TransportJob

One platform logistics offer for one delivery. It records offered fee, status, accepting transporter/profile, accepting user, and assigned platform vehicle. Nullable assignment fields allow an open job before acceptance.

### RoutePlan

One route snapshot for a delivery, containing human-readable endpoints, optional coordinates, estimated distance/time, encoded path, and provider reference.

## Payments and promotions

### Payment

One payment aggregate per order. It stores provider, provider reference, expected amount, paid/refunded totals, status, and lifecycle timestamps. Provider operations are represented by child transactions.

### PaymentTransaction

Append-oriented authorization, charge, capture, refund, or void attempt. Unique idempotency and provider transaction identifiers prevent duplicate financial effects. The provider payload is retained only after redaction under the security policy.

### Coupon

Promotion definition with unique code, percentage or fixed value, optional currency/minimum/maximum discount, usage limits, active interval, state, and soft deletion.

### CouponRedemption

Immutable link among coupon, buyer, and order with the actual discount applied. Uniqueness prevents applying the same coupon twice to one order; buyer indexes support per-buyer limits.

## Trust, communication, and operations

### Review

Verified-purchase review tied to a farmer group, author, and subject user. A buyer can review the farmer and, where applicable, transporter as separate subjects. Visibility and soft deletion support moderation while uniqueness prevents duplicates.

### Notification

User notification with business type, delivery/read status, content, optional structured navigation data, and delivery timestamps.

### Conversation

Messaging container with optional order/farmer-group context identifiers, lifecycle timestamps, and soft deletion. Membership is normalized through `ConversationParticipant`.

### ConversationParticipant

Join entity for conversation membership, join/leave times, and per-user read position. The compound unique key prevents duplicate active identities in a conversation.

### Message

Conversation entry with sender, type, body, optional attachment, sent/edited times, and soft deletion. A nullable sender retains system/account-deletion history.

### AuditLog

Append-only security and administration event. It records actor, action, entity reference, request context, and optional redacted before/after JSON. Audit records must be access-restricted and protected by retention policy.

## Enumerations

- `Role`: buyer, farmer, transporter, admin.
- `AccountStatus`: account onboarding and enforcement states.
- `VerificationStatus`: farmer/transporter review lifecycle.
- `ProductStatus`: listing lifecycle.
- `OrderStatus`: aggregate buyer-order lifecycle.
- `FarmerOrderStatus`: farmer-group preparation and fulfillment lifecycle.
- `DeliveryMethod`: farmer delivery, buyer pickup, or platform transporter.
- `DeliveryStatus`: delivery assignment and tracking lifecycle.
- `PaymentStatus`: aggregate financial lifecycle.
- `PaymentTransactionType` and `PaymentTransactionStatus`: provider operation classification and result.
- `VehicleType`: supported transport form factors.
- `InventoryMovementType`: stock ledger event classification.
- `TransportJobStatus`: platform job lifecycle.
- `NotificationType` and `NotificationStatus`: notification purpose and delivery/read state.
- `MessageType`: text, image, file, or system message.
- `CouponType`: percentage or fixed-amount discount.
