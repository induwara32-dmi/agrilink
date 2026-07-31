# AgriLink Deployment Guide

## Deployment topology

AgriLink deploys as three independently managed resources:

- Next.js frontend on port `3000`
- Express API on port `4000`
- PostgreSQL database

Cloudinary stores images and SMTP delivers email. Production traffic must terminate TLS before reaching either application. The API trusts the configured reverse proxy and exposes `/api/v1/health`, `/api/v1/readiness`, and `/api/v1/version` for monitoring.

## Production environment variables

Start from `.env.example`, store real values in the deployment provider's secret manager, and never commit `.env` or `.env.production`.

| Variable | Production guidance |
| --- | --- |
| `NODE_ENV` | Must be `production`. |
| `PORT` | API listener; providers commonly inject this. |
| `DATABASE_URL` | PostgreSQL connection with TLS, pooling, and least-privilege credentials. |
| `CORS_ORIGIN` | Comma-separated explicit HTTPS frontend origins; wildcards are rejected. |
| `FRONTEND_URL` | Canonical HTTPS frontend URL used in email links. |
| `NEXT_PUBLIC_API_URL` | Public HTTPS URL ending in `/api/v1`; injected during the frontend build. |
| `TRUST_PROXY` | Express trust-proxy value; normally `1` behind one managed proxy. |
| `RATE_LIMIT_WINDOW_MS` | API rate-limit window, default `900000`. |
| `RATE_LIMIT_MAX` | General requests per window, default `300`. |
| `AUTH_RATE_LIMIT_MAX` | Authentication requests per window, default `20`. |
| `SHUTDOWN_TIMEOUT_MS` | Maximum graceful shutdown period, default `10000`. |
| `COOKIE_SECURE` | Must be `true` in production. |
| `COOKIE_SAME_SITE` | `lax` or `strict`; use `none` only for a required cross-site HTTPS cookie flow. |
| `COOKIE_DOMAIN` | Optional cookie domain. Current authentication uses bearer tokens and does not issue cookies. |
| `JWT_ACCESS_SECRET` | Independent, randomly generated value of at least 32 characters. |
| `JWT_REFRESH_SECRET` | Different independent random value of at least 32 characters. |
| `JWT_ACCESS_EXPIRES_IN` | Short access lifetime, default `15m`. |
| `JWT_REFRESH_EXPIRES_IN` | Refresh lifetime, default `7d`. |
| `BCRYPT_SALT_ROUNDS` | `12` is the current default; benchmark before increasing. |
| `LOG_LEVEL` | Usually `info`; use `warn` only when operational visibility remains adequate. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Provider SMTP endpoint and TLS mode. |
| `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | SMTP credentials and verified sender identity. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary account credentials; the secret is backend-only. |

Production validation rejects HTTP frontend/CORS URLs, wildcard CORS, insecure cookie configuration, and example JWT secrets.

## Local deployment

1. Install Node.js 22 and PostgreSQL 16.
2. Copy `.env.example` to `.env` and replace every placeholder.
3. Run `npm ci`, `npm run prisma:generate`, and `npm run prisma:deploy`.
4. Build with `npm run backend:build` and `npm run build`.
5. Start the API with `npm run backend:start:production` and the frontend with `npm start` in separate processes.
6. Confirm health, readiness, and version endpoints before accepting traffic.

## Docker deployment

For development, copy `.env.example` to `.env`, fill the external-service values, and run:

```sh
docker compose up --build
```

For the production template, provide `.env.production` plus Compose interpolation variables and run:

```sh
docker compose -f docker-compose.prod.yml up --build -d
```

The production stack runs `prisma migrate deploy` once, waits for completion, then starts the API. The frontend waits for API readiness. Do not expose the PostgreSQL port publicly.

## Railway

Create PostgreSQL, backend, and frontend services from the same repository. Use `Dockerfile.backend` for the API and `Dockerfile` for the frontend. Attach Railway PostgreSQL's private `DATABASE_URL`, configure all secrets, set the frontend build argument `NEXT_PUBLIC_API_URL`, and map health checks to `/api/v1/readiness`. Run `npm run prisma:deploy` as a pre-deploy command or one-off release job.

## Render

Create a managed PostgreSQL database, a Docker web service using `Dockerfile.backend`, and a Docker web service using `Dockerfile`. Configure the backend health path as `/api/v1/readiness`. Use a pre-deploy command of `npm run prisma:deploy`, and provide the frontend API URL as a build argument. Keep services in the same region as the database.

## Vercel

Deploy the Next.js frontend to Vercel and deploy the long-running Express API separately on Railway, Render, or another container host. Set `NEXT_PUBLIC_API_URL` before the Vercel build. Add every Vercel production and preview hostname that should call the API to `CORS_ORIGIN`; do not use `*`.

## Neon PostgreSQL

Create separate production, staging, and test branches/databases. Use Neon's pooled TLS connection string for application traffic and a direct connection when the migration workflow requires it. Set connection limits appropriate to the API replica count. Apply migrations with `npm run prisma:deploy`, never `prisma db push`, in production.

## Cloudinary

Create a dedicated production cloud or restricted upload preset, configure the three Cloudinary variables, restrict administrative access, and monitor storage/transformation usage. The API key and secret must never use a `NEXT_PUBLIC_` prefix. Back up database media references; Cloudinary retention and backup policies should match business requirements.

## SMTP

Use a production transactional-email provider with a verified domain. Configure SPF, DKIM, and DMARC, use TLS, rotate SMTP credentials, and monitor bounces and complaints. Do not use development mail-catcher credentials outside local environments.

## SSL and proxy considerations

- Terminate TLS at the managed load balancer or reverse proxy and redirect HTTP to HTTPS there.
- Forward `X-Forwarded-Proto` and client IP headers only from trusted proxies.
- Keep `TRUST_PROXY` scoped to the real proxy topology.
- Helmet enables HSTS with subdomains and preload in production.
- Secure, HTTP-only, SameSite cookie defaults are configured even though current auth tokens are bearer tokens.
- Restrict inbound API traffic and database networking using provider firewalls/private networks.

## Migration and seed strategy

- Commit immutable Prisma migration directories and review their SQL.
- CI validates the schema; a single release job runs `prisma migrate deploy` before new application replicas start.
- Never run `prisma migrate dev` or `prisma db push` against production.
- Production seed operations must be explicit, idempotent, and limited to reference data or the initial audited admin bootstrap. Test factories and `tests/utils/seed.ts` are never production seeds.
- Test restore procedures on staging before each high-risk schema release.

## Backup and restore

Enable managed point-in-time recovery and daily encrypted snapshots with retention appropriate to legal and business requirements. Store backups in a separate failure domain and restrict restore permissions.

Example logical backup:

```sh
pg_dump --format=custom --no-owner --file=agrilink.dump "$DATABASE_URL"
```

Example restore into an empty recovery database:

```sh
pg_restore --clean --if-exists --no-owner --dbname="$RECOVERY_DATABASE_URL" agrilink.dump
```

Validate row counts, critical order/payment relationships, media references, and application readiness after restoration. Never test restores over the production database.

## Release checklist

1. Run tests, coverage, lint, backend type checking/build, and frontend build.
2. Review dependency and container vulnerability scans.
3. Back up the database and verify rollback ownership.
4. Run migrations once and deploy API replicas.
5. Verify `/api/v1/health`, `/api/v1/readiness`, and `/api/v1/version` through the public HTTPS endpoint.
6. Deploy the frontend and perform role-based smoke tests.
7. Monitor error rate, latency, database connections, email delivery, Cloudinary failures, and rate-limit responses.
