# AgriLink Business Rules

## Role and account rules

1. Every user has exactly one role: `BUYER`, `FARMER`, `TRANSPORTER`, or `ADMIN`.
2. A user may have only the specialized profile matching that role. Profile consistency is enforced transactionally and later reinforced with database constraints/triggers if selected.
3. Public registration may create only buyer, farmer, or transporter accounts. It must reject `ADMIN` regardless of client payload.
4. Admin accounts are provisioned by an authorized admin/bootstrap process, require audit logging, and record provisioning provenance.
5. Farmers and transporters cannot publish/fulfill or accept jobs until their verification and account states permit it.
6. Suspended, disabled, or soft-deleted users cannot authenticate or start new business operations. Historical records remain intact.
7. Authorization always combines role, ownership/assignment, account state, and resource lifecycle state.
8. Access tokens are short-lived signed JWTs. Refresh JWTs are stored only as SHA-256 hashes and rotated on every use.
9. Reuse of a revoked refresh token revokes its entire token family. Logout is idempotent and revokes the presented session.
10. Email-verification and password-reset tokens are cryptographically random, stored only as hashes, expire, and are consumed once.
11. Password-reset responses never reveal whether an email exists. A successful reset revokes all refresh sessions.

## Product and inventory rules

1. Only an active, approved farmer may create or manage their own products and inventory.
2. Product prices and quantities are positive decimals; currency is a supported ISO 4217 code and unit is selected from an approved unit catalog/configuration.
3. Products referenced by orders are soft-deleted/archived, not physically deleted.
4. Available stock equals `quantityOnHand - quantityReserved` and may never be negative.
5. Every inventory change occurs in a database transaction that updates `Inventory` and appends one `InventoryMovement`.
6. Reservation movements reduce availability without immediately reducing on-hand stock. Sale movements finalize the reserved quantity; cancellation/expiry releases it.
7. Checkout locks or optimistic-version-checks inventory rows in a deterministic order to prevent overselling and deadlocks.
8. Inventory movements are immutable. Corrections use compensating `ADJUSTMENT` records rather than edits.
9. Movement quantity sign and resulting balance must match the movement type; check constraints are added in the first reviewed migration.

## Cart and checkout rules

1. Only buyers own carts and wishlists.
2. A buyer has at most one active cart. Historical/converted carts may remain inactive.
3. A cart contains at most one line per product; adding an existing product adjusts its decimal quantity.
4. Cart grouping by farmer is derived from the product owner.
5. A line-level delivery preference is provisional. At checkout, all items belonging to one farmer must resolve to exactly one delivery method.
6. Checkout validates account state, product publication, farmer verification, minimum quantity, current price, stock, coupon eligibility, delivery feasibility, and address requirements.
7. Checkout creates the order, farmer groups, item snapshots, inventory reservations, coupon redemption, initial histories, delivery records, and payment aggregate atomically where possible.

## Order rules

1. One `Order` represents one buyer checkout and contains one or more `FarmerOrder` groups.
2. There is exactly one farmer group per farmer per order. Every item in the group must belong to that farmer.
3. `FarmerOrder.deliveryMethod` is the authoritative method for the entire group and must match its `Delivery.method`.
4. Order and farmer-order numbers are unique, stable, non-secret human references. UUIDs remain API/database identities.
5. Item name, SKU, unit, unit price, and monetary totals are immutable checkout snapshots.
6. Currency must be consistent within an order. Multi-currency checkout is out of scope until explicitly designed.
7. Parent totals equal the sum of child-group totals and applied order-level adjustments. Totals are computed server-side using decimal arithmetic.
8. Aggregate order status is derived from farmer-group states under a documented transition table; clients cannot set it arbitrarily.
9. Every aggregate order status change appends `OrderStatusHistory` in the same transaction.
10. Delivered, rejected, and cancelled terminal states cannot transition without a privileged, audited correction workflow.
11. Cancellation releases unconsumed inventory reservations and initiates void/refund processing as required.
12. Physical deletion of orders, farmer groups, items, histories, payments, and deliveries is prohibited during normal operation.

## Delivery and transport rules

1. Each farmer order has at most one delivery record in this version. Split shipments require a future approved schema change.
2. `FARMER_DELIVERY` may use an active vehicle owned by the fulfilling farmer user. It does not create a platform transport job.
3. `BUYER_PICKUP` may use an active vehicle owned by the buyer. It does not create a platform transport job.
4. `PLATFORM_TRANSPORTER` creates exactly one open transport job and does not use `Delivery.vehicleId`; the accepted job owns the assigned transporter vehicle.
5. Only active, approved transporter accounts may accept open jobs. A job is accepted atomically so two transporters cannot win it.
6. An assigned platform vehicle must be active and owned by the accepting transporter user.
7. Pickup verification values are secrets; store only a secure hash, rate-limit attempts, and never log the plaintext code.
8. Every delivery transition appends `DeliveryStatusHistory`. Tracking events are ordered by `occurredAt`, with `createdAt` retained for ingestion auditing.
9. Delivery transitions must follow an approved state machine. Failed/cancelled/delivered states are terminal except through audited administration.
10. Proof-of-delivery files live in protected object storage; the database stores only storage identity and safe metadata.
11. Location data is collected only when necessary, access-controlled, retained for a defined period, and never exposed to unrelated users.
12. Automatic assignment selects only active, available, approved transporters and compatible active vehicles; manual assignment applies the same eligibility and capacity checks.
13. A driver or vehicle may have only one active transport assignment. Acceptance marks both unavailable, and terminal completion, failure, cancellation, or reassignment releases them.
14. Driver rejection is recorded append-only and the rejected driver is excluded from subsequent automatic selection for that job.
15. Delivery completion requires photo or signature proof metadata and atomically finalizes reserved inventory and fulfillment histories.

## Payment and coupon rules

1. One payment aggregate belongs to one order; provider attempts and refunds are separate `PaymentTransaction` rows.
2. The payment amount and currency must match server-calculated order obligations.
3. Every provider operation requires a unique idempotency key. Duplicate webhooks/requests return the existing result without repeating financial effects.
4. Provider references are unique when present. Webhook signatures are verified before any state change.
5. Payment status changes are derived from successful transactions; clients cannot mark an order paid.
6. Financial updates, resulting order actions, and audit events occur transactionally or through a retryable outbox workflow in the backend phase.
7. Raw card/bank credentials are never stored. Provider payloads must be allow-listed/redacted before persistence.
8. Refund totals cannot exceed captured/paid totals. All refunds reference the payment and are auditable.
9. Coupon validity considers active dates, type, currency, minimum order, global usage, per-buyer usage, and maximum discount.
10. Percentage/fixed values and calculated discounts must be positive and within configured/check-constrained limits.
11. A coupon may be redeemed at most once per order. Redemptions are created only with a successful checkout transaction and reversed/invalidated under an explicit cancellation policy.

## Review rules

1. Only a buyer associated with a delivered farmer order may submit a review for that purchase.
2. The review subject must be the fulfilling farmer or the transporter assigned to that farmer order.
3. Ratings are integers from 1 through 5; the database migration adds a check constraint.
4. One author may review a given subject once per farmer order.
5. Reviews are not physically deleted during moderation. Visibility and soft deletion preserve fraud/audit evidence.
6. Aggregate ratings are computed from visible, non-deleted reviews. They may be cached later but are not a second source of truth.
7. Users cannot review themselves, and admins cannot create customer reviews on behalf of users.

## Notification and messaging rules

1. Notifications are private to their recipient. Read status updates require ownership.
2. Notification creation is driven by domain events and is idempotent in the future job system.
3. Only active conversation participants may read or send messages, subject to support/admin policy.
4. Order-linked conversations may include only users with a legitimate relationship to that order/group plus authorized support staff.
5. Messages are soft-deleted or redacted; conversation integrity and audit requirements are retained.
6. Attachments use protected object storage, validated file types/sizes, malware scanning, and expiring access URLs.
7. System messages have no user sender and can be created only by trusted backend workflows.

## Analytics and audit rules

1. Operational analytics are derived from transactional records or privacy-safe projections; dashboards must not write competing totals into core tables.
2. Expensive reporting should use read replicas/materialized views/warehouse pipelines when justified, without weakening transactional integrity.
3. Admin changes, verification decisions, authentication security events, financial actions, and manual state corrections create append-only audit logs.
4. Audit JSON is redacted and must not contain passwords, tokens, payment credentials, plaintext pickup codes, or unnecessary personal data.
5. Audit access is restricted, monitored, and governed by retention policy.

## Delete behavior and retention

1. `Restrict` is the default for commercial and audit relationships so parent deletion cannot erase history.
2. `Cascade` is limited to true owned dependents whose removal cannot destroy commercial evidence, such as product images, wishlist lines, notification records, and conversation join rows.
3. `SetNull` is used for actors/senders where the event must survive account removal.
4. Soft-deleted rows are excluded from normal queries but remain available to authorized recovery, moderation, and compliance processes.
5. Physical deletion/anonymization is a separate retention workflow with dependency review, legal requirements, backups, and audit evidence.

## Transaction and concurrency boundaries

- **Inventory adjustment:** balance update plus movement append.
- **Checkout:** validate/reprice, create aggregates/snapshots, reserve inventory, apply coupon, create histories/delivery/payment.
- **Transport acceptance:** conditionally claim open job and validate transporter/vehicle.
- **Status transition:** validate state machine, update current state, append history, enqueue event.
- **Payment webhook:** claim idempotency identity, append/update transaction, recalculate payment state, enqueue consequences.

The future backend must implement these boundaries with database transactions and retry handling for serialization/deadlock conflicts.
