# AgriLink Testing Guide

## Stack and scope

AgriLink uses Vitest for test execution, Supertest for Express HTTP contracts, Testing Library with JSDOM for frontend utilities, and V8 for coverage. The current suite establishes reusable infrastructure and targeted contracts; it is not yet comprehensive end-to-end coverage of every business path.

```text
tests/
  backend/            HTTP, event, deployment, media, and database contracts
  frontend/           Testing Library component utilities
  utils/
    database.ts       guarded test database reset helper
    seed.ts           deterministic test seed helper
    factories.ts      typed domain factories
    jwt.ts            test JWT helper
    mocks.ts          Cloudinary, SMTP, and event mocks
  setup.ts            shared Vitest setup
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run the full suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run tests and generate text, JSON-summary, and HTML coverage |
| `npm run backend:typecheck` | Strict backend TypeScript check |
| `npm run backend:build` | Compile the Express application |
| `npm run lint` | Lint application, tests, and documentation tooling |
| `npm run build` | Build the production Next.js application |

Coverage output is generated under `coverage/` and is ignored by Git and ESLint. Open `coverage/index.html` locally for the annotated report.

## Test database safety

Database-backed helpers require `TEST_DATABASE_URL`. Destructive reset code refuses a connection unless the URL clearly targets a test/local database. Never point `TEST_DATABASE_URL` at staging or production.

Recommended local flow:

1. Create a dedicated PostgreSQL database whose name includes `test`.
2. Set `TEST_DATABASE_URL` separately from `DATABASE_URL`.
3. Apply the same migrations to the test database.
4. Use `tests/utils/seed.ts` and factories for deterministic setup.
5. Reset state only through the guarded helper.

Tests that do not need persistence use repository/service doubles and remain fast. External Cloudinary and SMTP calls are mocked, so normal test runs do not upload files or send email.

## Writing tests

- Test observable behavior and domain invariants, not private implementation details.
- Use typed factories with explicit overrides instead of large copied fixtures.
- Keep each test isolated and deterministic; control clocks/IDs where time or randomness matters.
- Verify both success and safe failure responses for HTTP endpoints.
- Assert role plus ownership/lifecycle authorization—not only role middleware.
- For transactional workflows, verify rollback, history/audit rows, inventory balances, and idempotency.
- Mock external boundaries, but keep Prisma integration tests for critical queries and transactions.
- Use Testing Library queries based on roles and accessible names.
- Never weaken TypeScript or introduce `any` to simplify a test.

## Priority coverage areas

The foundation covers representative authentication, products/inventory, cart/orders, transport, notifications/events, media, deployment middleware, and frontend state tests. The next expansion should prioritize:

1. Real PostgreSQL transaction tests for multi-farmer checkout and inventory contention.
2. Refresh-token replay/revocation and account-state authorization matrices.
3. Transport double-booking, reassignment, terminal status, and proof constraints.
4. Coupon boundaries and payment webhook idempotency after provider implementation.
5. Frontend integration tests for refresh retry, polling stop conditions, uploads, and checkout conflicts.
6. Browser end-to-end journeys for each role, accessibility scans, and responsive behavior.

Coverage percentage is a diagnostic, not a release guarantee. Raise thresholds only after meaningful behavior is covered; do not add low-value assertions solely to increase a number.

## Continuous integration baseline

A pull request or release pipeline should run:

```bash
npm ci
npm run prisma:generate
npm test
npm run test:coverage
npm run lint
npm run backend:typecheck
npm run backend:build
npm run build
npm run docker:validate
```

Use an isolated PostgreSQL service for database tests and inject mock/development Cloudinary and SMTP values. Do not expose secrets in command logs or uploaded artifacts.

## Troubleshooting tests

- **Database guard rejects URL:** set a dedicated `TEST_DATABASE_URL` containing `test` or using the explicitly allowed local host.
- **Prisma client mismatch:** run `npm run prisma:generate` after schema changes.
- **JSDOM errors:** confirm the test uses the configured frontend environment and imports shared setup.
- **Open handles:** close servers, timers, Prisma connections, and polling intervals in teardown.
- **Coverage changes unexpectedly:** confirm generated files, `coverage/`, build output, and declaration files remain excluded.
