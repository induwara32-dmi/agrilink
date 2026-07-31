# AgriLink Security

## Security model

AgriLink applies defense in depth across transport, middleware, authentication, authorization, validation, persistence, external providers, and deployment. This document describes the implemented controls and the production responsibilities that remain with operators. It is not a claim of formal certification or an independent security audit.

## Authentication and sessions

- Passwords are hashed with bcrypt; the cost is configurable and defaults to 12 rounds.
- Password validation requires 12–128 characters with lowercase, uppercase, numeric, and symbol characters.
- Access and refresh JWTs use separate secrets and configurable short/long lifetimes.
- Refresh tokens are stored as SHA-256 hashes and rotate on use.
- Reuse of a revoked refresh token revokes its token family.
- Logout revokes the presented session and is idempotent.
- Email verification and password reset use cryptographically random, single-use, hashed, expiring tokens.
- Password reset revokes active refresh sessions and does not reveal whether an email exists.
- Public registration cannot create admin accounts.

JWT secrets must be independent random values of at least 32 characters. They must live in a managed secret store and be rotated through a planned session-invalidating procedure.

## Authorization

Express authenticates bearer tokens before protected handlers. Role middleware provides the first authorization gate. Services then enforce ownership, assignment, account verification/status, resource visibility, and lifecycle state. Frontend route guards and hidden controls improve user experience but are never treated as security controls.

High-risk examples include farmer ownership of products, admin-only category and transport assignment, recipient-only notifications, assigned transporter acceptance/proof, and buyer-only cart/checkout. Administrative and sensitive domain mutations produce audit records.

## Request protection

- Zod validates bodies, route parameters, and query strings before controllers.
- Unknown or malformed fields are rejected where contracts are strict.
- JSON and URL-encoded bodies are limited to 1 MiB.
- Multer uses memory storage and allow-lists JPEG, PNG, and WebP with endpoint-specific size/count limits.
- General and authentication-specific rate limiters return `429` when exceeded.
- Helmet sets security headers and enables production HSTS.
- CORS accepts only configured origins, credentials, approved methods, and approved headers.
- Express disables `X-Powered-By` and uses a scoped `trust proxy` value.
- Request IDs and structured Pino logs support incident correlation.

Production configuration rejects wildcard/non-HTTPS CORS, insecure cookie settings, and placeholder JWT secrets. TLS must terminate at a trusted proxy or load balancer.

## Data protection

- PostgreSQL connections must use TLS and least-privilege application credentials in production.
- Raw passwords, JWTs, reset/verification tokens, pickup codes, provider secrets, and payment credentials must never be stored in logs or audit metadata.
- Money and quantity use exact decimal types; server calculations are authoritative.
- Commercial records and histories favor `Restrict` or soft deletion to preserve evidence.
- Inventory and checkout use database transactions and concurrency checks to prevent overselling.
- Payment provider payloads must be allow-listed/redacted when payment integration is added.
- Backups require encryption, access control, retention rules, and tested restores.

## Media security

Cloudinary secrets are backend-only and must never use a `NEXT_PUBLIC_` prefix. Upload authorization combines role, ownership/assignment, and lifecycle checks. The API stores safe media metadata and Cloudinary public IDs rather than local files. If persistence fails after upload, cleanup prevents orphan assets. Production Cloudinary access, retention, transformations, and backups require provider-side controls.

MIME/type and size validation reduce risk but do not replace malware/content scanning. Add scanning and moderation before permitting general file attachments or untrusted non-image formats.

## Email and events

Use a transactional SMTP provider with TLS, a verified sender domain, SPF, DKIM, and DMARC. Email failures do not roll back successful business operations. The current internal event bus is in-process; production horizontal scaling requires a transactional outbox and durable retry worker to avoid lost or duplicated post-commit work.

## Secrets and environment handling

- Commit `.env.example` only; never commit `.env`, `.env.production`, credentials, database dumps, or provider exports.
- Store production values in Railway, Render, Vercel, or the selected secret manager.
- Scope credentials per environment and rotate after suspected exposure.
- Keep `NEXT_PUBLIC_API_URL` public by design; all other provider/database/JWT values stay server-side.
- Review Git history as well as the working tree during secret-response incidents.

## Dependency and container hygiene

Run dependency audits and container-image vulnerability scans in CI and before releases. Review advisories against the deployed versions and test upgrades. Pin lockfile-resolved dependencies through `npm ci`; rebuild base images regularly. Use non-root container users and do not expose PostgreSQL publicly.

## Security checklist

Before production:

1. Configure HTTPS, explicit CORS origins, secure cookies, correct proxy trust, and HSTS.
2. Generate independent JWT secrets and production-only database/provider credentials.
3. Apply reviewed migrations through `prisma migrate deploy`.
4. Verify role, ownership, lifecycle, rate-limit, upload, and error-path tests.
5. Enable database point-in-time recovery and perform a staging restore.
6. Add centralized monitoring/alerts and redact sensitive log fields.
7. Add an outbox/queue before running multiple API replicas.
8. Complete threat modeling and independent security review before processing real payments or sensitive production data.

## Reporting vulnerabilities

Do not publish exploitable details in a public issue. Report privately to the repository maintainer through the security contact or private vulnerability-reporting channel configured on the Git hosting platform. Include the affected version/commit, reproduction steps, impact, and any safe remediation suggestion. Never include real credentials or personal data.
