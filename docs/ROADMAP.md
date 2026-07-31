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

### 6. Payments and notifications — in progress

- Integrate the approved payment provider with idempotent webhook handling.
- Add payment status, refunds where required, and reconciliation.
- [x] Implement typed internal domain events, in-app notifications, and templated email delivery status tracking.
- Add a durable queue/outbox and retry worker during deployment hardening.
- [x] Add role-scoped operational analytics with date ranges, previous-period comparisons, and a replaceable cache abstraction.

### 7. Frontend integration — substantially completed

- [x] Replace authentication, marketplace, cart, checkout, order, tracking, notification, dashboard analytics, and media mock paths with typed API clients and server-state caching.
- [x] Connect authentication, role permissions, primary forms, mutations, and state feedback.
- [ ] Integrate wishlist, recently viewed, and remaining secondary operational controls.
- Preserve completed layouts and design tokens while adding real loading, error, empty, and optimistic states.

### 8. Testing — foundation completed

- [x] Add Vitest, Supertest, Testing Library, factories, guarded test database helpers, provider mocks, and coverage reporting.
- [ ] Expand integration tests for database transactions and APIs.
- Add end-to-end tests for critical buyer, farmer, transporter, and admin workflows.
- Run accessibility, responsive, security, performance, and recovery testing.

### 9. Deployment — preparation completed

- [x] Add production configuration validation, health/readiness endpoints, graceful shutdown, security middleware, Docker images, Compose templates, and deployment documentation.
- [ ] Establish hosted staging and production environments.
- [ ] Automate lint, type checking, tests, builds, migrations, and controlled releases in CI/CD.
- [ ] Configure live secrets, TLS, backups, monitoring, alerts, and error reporting.
- Complete staging acceptance and a production readiness review before launch.
