# AgriLink API Plan

## Purpose and principles

AgriLink will use versioned REST resources for frontend integration. This plan describes intended boundaries and permissions; it does not implement endpoints or lock the project into final request/response shapes.

- Use a version prefix such as `/api/v1`.
- Authenticate every private request and enforce authorization on the server.
- Validate request payloads and return consistent typed error responses.
- Use pagination, filtering, and stable sorting for collections.
- Make payment and webhook processing idempotent.
- Avoid exposing internal database structure directly through responses.
- Record auditable mutations and attach request/correlation identifiers.

## Planned resources

Authentication, catalog, inventory, cart, checkout, orders, logistics, notifications, and role analytics resources listed below are implemented in the backend. Remaining resources are planned.

### Authentication and identity

- `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`
- `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`
- `/me`, `/users`, `/users/{userId}`
- `/farmer-profiles`, `/transporter-profiles`
- `/verification-requests`

### Catalog and discovery

- `/categories`, `/categories/{categoryId}`
- `/products`, `/products/{productId}`
- `/products/{productId}/images`
- `/products/{productId}/inventory`
- `/products/{productId}/inventory/adjustments`
- `/products/{productId}/inventory/history`
- `/inventory/low-stock`
- `/management/products`
- `/search`
- `/wishlist`, `/wishlist/{productId}`
- `/recently-viewed`

### Cart and checkout

- `/cart`, `/cart/items`, `/cart/items/{itemId}`, `/cart/items/{itemId}/save-for-later`
- `/checkout/preview`, `/checkout`
- `/orders`, `/orders/{orderId}`
- `/orders/{orderId}/cancel`
- `/orders/{orderId}/status-history`

### Logistics

- `/deliveries`, `/deliveries/{deliveryId}`
- `/deliveries/{deliveryId}/schedule`, `/deliveries/{deliveryId}/transitions`
- `/deliveries/{deliveryId}/proof`
- `/transport-jobs`, `/transport-jobs/{transportJobId}`
- `/transport-jobs/{transportJobId}/assign/automatic`, `/transport-jobs/{transportJobId}/assign/manual`
- `/transport-jobs/{transportJobId}/accept`, `/transport-jobs/{transportJobId}/reject`, `/transport-jobs/{transportJobId}/reassign`
- `/vehicles`, `/vehicles/{vehicleId}`

### Payments and communications

- `/payments`, `/payments/{paymentId}`
- `/payments/webhooks/{provider}`
- `/notifications`, `/notifications/{notificationId}`, `/notifications/{notificationId}/read`
- `/notifications/mark-all-read`, `/notifications/unread-count`
- `/conversations`, `/conversations/{conversationId}/messages`

### Administration

- `/admin/users`
- `/admin/verifications`
- `/admin/categories`
- `/admin/orders`
- `/admin/reports`
- `/admin/audit-logs`

### Analytics

- `/analytics/buyer`
- `/analytics/farmer`
- `/analytics/transporter`
- `/analytics/admin`

Analytics endpoints support `day`, `week`, `month`, `year`, and bounded `custom` UTC ranges and return the equivalent preceding-period comparison.

## Role permissions

| Resource area | Buyer | Farmer | Transporter | Admin |
| --- | --- | --- | --- | --- |
| Public catalog | Read | Read | Read | Read/manage |
| Own profile | Read/update | Read/update | Read/update | Read/manage |
| Products and inventory | Read | Manage own | Read assigned context | Manage/moderate |
| Wishlist/recent views/cart | Manage own | No access | No access | Support-only, audited |
| Orders | Create/read own | Read/update owned fulfillment | Read assigned delivery context | Read/manage |
| Deliveries | Read own order | Read owned fulfillment | Accept/update assigned | Read/manage |
| Payments | Create/read own | Read settlement context | No payment details by default | Read/manage, audited |
| Notifications | Manage own | Manage own | Manage own | System administration |
| Verification | Submit/view own | Submit/view own | Submit/view own | Review/manage |
| Reports/audit | No access | Limited own analytics | Limited own analytics | Authorized admin access |

Ownership, assignment, account state, and lifecycle state must be checked in addition to role. Admin access must be scoped and audited rather than treated as unrestricted by default.

## Response and error conventions

- Successful collections return `data` plus pagination metadata.
- Successful single-resource responses return a stable resource representation.
- Validation failures identify safe field-level issues.
- Authentication, authorization, missing-resource, conflict, rate-limit, and server failures use consistent status codes and machine-readable error codes.
- Responses never expose stack traces, secrets, credential material, or unnecessary personal data.

## Open decisions

- Backend language and framework
- Session versus token strategy
- API documentation format and code generation
- Real-time tracking transport, if needed beyond REST polling
- Search engine requirements
- Rate limits and abuse controls
- Media upload flow
- Payment and messaging providers
