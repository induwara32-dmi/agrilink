# AgriLink System Architecture

## Current frontend architecture

AgriLink currently uses a single Next.js 16 App Router application. React Server Components are the default, with Client Components used for local interactive state such as filters, checkout steps, menus, and drawers.

- `app/` defines public, authentication, dashboard, marketplace, cart, checkout, and order routes.
- `app/(dashboard)/layout.tsx` applies the shared dashboard shell to role workspaces.
- `components/ui/` provides typed primitives and reusable loading, empty, and error states.
- `components/features/` groups domain presentation, charts, cards, and canonical mock datasets.
- `components/layout/` centralizes shared headers and navigation definitions.
- `config/` contains design and domain constants.
- `providers/` hosts application-wide client providers.

The repository includes a separate Express/TypeScript application under `src/`, with Prisma/PostgreSQL access, layered repositories/services/controllers, centralized middleware, and versioned routes under `/api/v1`. Authentication, marketplace, cart, checkout, order, delivery-tracking, and notification frontend paths now use centralized typed API clients and TanStack Query state.

Backend domain services publish typed internal events after successful business operations. A notification subscriber renders centralized templates, creates idempotent user notifications, and records email delivery outcomes without coupling business services to SMTP or notification persistence. A durable outbox/queue is still required before multi-instance production deployment.

The analytics module performs role-scoped Prisma aggregates and parameterized PostgreSQL date-bucket queries. Its service depends on a cache interface backed by a bounded in-memory implementation today, allowing Redis to replace it without changing controllers or report repositories.

## Major modules

- Public landing and product discovery
- Authentication and role selection UI
- Buyer, farmer, transporter, and admin dashboards
- Marketplace browsing, search, categories, product details, wishlist, and history
- Cart and multi-step checkout
- Orders, order details, and delivery tracking
- Shared responsive navigation and UI-state components

## User roles

- **Buyer:** discovers products, manages a cart, places orders, and tracks fulfillment.
- **Farmer:** manages products and inventory, reviews orders, and coordinates fulfillment.
- **Transporter:** accepts delivery assignments and updates logistics progress.
- **Admin:** manages platform oversight, users, categories, approvals, and reporting.

Authorization is enforced by backend role middleware and service-level ownership, assignment, account, and lifecycle checks. Hiding frontend controls is not a security boundary.

## Current data flow

1. App Router resolves a page and shared layout.
2. Server Components read static domain data where possible.
3. Client Components manage temporary browser state for interactive demonstrations.
4. Shared components render consistent state, navigation, and design tokens.

## Current backend architecture

The backend is an Express/TypeScript modular monolith that keeps transactions, deployment, and domain evolution manageable. It exposes versioned REST resources to the Next.js application and separates identity, catalog, inventory, orders, logistics, notifications, analytics, and media responsibilities through routes, controllers, services, repositories, validators, and middleware.

Implemented boundaries and infrastructure:

- PostgreSQL as the transactional source of truth through Prisma ORM
- A backend service layer containing authorization and business rules
- A repository/data-access layer with reviewed Prisma migrations
- Cloudinary object storage for product media and delivery evidence
- An in-process typed event bus for notifications and email; a durable outbox/queue remains planned
- External adapters for payment, messaging, mapping, and delivery providers
- Structured logs, health checks, metrics, and audit events

Payment processing, a durable worker/outbox, shared analytics caching, and optional real-time tracking remain future architecture decisions.

## Backend data flow

1. A user authenticates and receives a secure server-managed session.
2. The Next.js frontend requests a versioned API resource.
3. The API authenticates the session and authorizes the role and resource ownership.
4. The service layer validates input and applies domain rules.
5. The data-access layer performs a transaction and records auditable state changes.
6. The API returns a typed response; the frontend updates cached server state.
7. Asynchronous work is queued for notifications, payment events, or logistics updates.

## Deployment plan

- Build and test the Next.js frontend in continuous integration.
- Deploy frontend, backend, worker, and database as independently configurable services.
- Maintain separate development, staging, and production environments.
- Store secrets in the deployment platform, never in Git.
- Run database migrations as a controlled release step with rollback guidance.
- Use managed TLS, backups, monitoring, error reporting, and health checks.
- Validate staging with smoke tests before production promotion.
