# AgriLink Development Roadmap

## Completed: frontend UI

- [x] Landing and authentication UI
- [x] Shared role-based dashboard layout and dashboards
- [x] Marketplace discovery and product-detail experiences
- [x] Wishlist, recently viewed, cart, and checkout
- [x] Orders, order details, and order tracking
- [x] Navigation, responsiveness, accessibility, state handling, lint, and build stabilization

The completed frontend establishes the approved architecture and visual design. Future work should integrate it incrementally rather than redesigning or rebuilding it.

## Next phases

### 1. Database design — completed

- Finalize entities, relationships, lifecycle states, ownership, and audit requirements.
- Decide the transactional database and migration tooling.
- Review query patterns, indexes, retention, backups, and seed strategy.
- Produce and approve the first versioned schema.

### 2. Backend foundation — completed

- Select the backend stack and establish modular service boundaries.
- Add configuration, validation, structured errors, logging, health checks, and API documentation.
- Establish database access, migrations, test fixtures, and continuous integration.

### 3. Authentication backend — completed

- Implement registration, login, logout, verification, password recovery, and secure sessions.
- Add role and ownership authorization policies.
- Implement farmer/transporter verification and auditable admin controls.

### 4. Product and inventory APIs — completed

- Implement categories, product listings, media references, pricing, and inventory.
- Add farmer ownership checks, publication workflows, search, filtering, wishlist, and recent views.
- Define inventory reservation and concurrency behavior.

### 5. Orders and logistics — completed

- [x] Implement cart and transactional multi-farmer checkout with inventory reservation.
- [x] Implement order lifecycle rules and immutable order snapshots.
- [x] Add delivery selection, automatic/manual transporter assignment, tracking events, cancellation, and proof metadata.

### 6. Payments and notifications

- Integrate the approved payment provider with idempotent webhook handling.
- Add payment status, refunds where required, and reconciliation.
- Implement in-app and external notification delivery with background jobs and retry policies.

### 7. Frontend integration

- Replace mock datasets with typed API clients and server-state caching.
- Connect authentication, role permissions, forms, mutations, and state feedback.
- Preserve completed layouts and design tokens while adding real loading, error, empty, and optimistic states.

### 8. Testing

- Add unit tests for domain rules and validation.
- Add integration tests for database transactions and APIs.
- Add end-to-end tests for critical buyer, farmer, transporter, and admin workflows.
- Run accessibility, responsive, security, performance, and recovery testing.

### 9. Deployment

- Establish development, staging, and production environments.
- Automate lint, type checking, tests, builds, migrations, and controlled releases.
- Configure secrets, TLS, backups, monitoring, alerts, and error reporting.
- Complete staging acceptance and a production readiness review before launch.
