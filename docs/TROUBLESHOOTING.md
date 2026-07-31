# AgriLink Troubleshooting

## Quick diagnosis

Start with versions, configuration, health, and logs:

```bash
node --version
npm --version
npm run prisma:validate
npm run backend:typecheck
npm run lint
```

Check `GET /api/v1/health` for process liveness and `GET /api/v1/readiness` for database readiness. Use the request ID from an error response/log to correlate Pino records. Never paste secrets or full tokens into issues.

## Installation and scripts

### PowerShell blocks `npm.ps1`

Use `npm.cmd` (for example, `npm.cmd run build`) or configure an appropriate signed-script execution policy according to your organization’s security rules. Do not disable system-wide protections just for this repository.

### Dependency or generated-client errors

Use the committed lockfile and regenerate Prisma:

```bash
npm ci
npm run prisma:generate
```

If schema validation needs an environment variable, ensure `.env` contains a valid PostgreSQL `DATABASE_URL`.

## Frontend

### API requests fail from the browser

- Confirm the API is running on port 4000.
- Set `NEXT_PUBLIC_API_URL` to the public base ending in `/api/v1` before building the frontend.
- Add the exact frontend origin to `CORS_ORIGIN`; schemes, hosts, and ports must match.
- Confirm HTTPS frontend builds call an HTTPS API in production.
- Inspect the structured API error rather than assuming a network failure.

### Login loops or refresh fails

Clear stale local session state, log in again, and confirm the frontend/API use matching environments. Refresh tokens rotate; an old token cannot be reused. Check system clock drift and JWT secret consistency across API replicas.

### Next.js build consumes stale output

Stop development processes, remove only generated `.next` output through a safe workspace-scoped operation, then run `npm run build`. Do not delete source directories or reset the Git worktree.

## Backend and database

### Readiness returns `503`

- Verify PostgreSQL is reachable from the API network.
- Check `DATABASE_URL`, TLS parameters, credentials, database name, and connection limits.
- Run `npm run prisma:validate` and `npm run prisma:deploy` in the intended environment.
- For managed/serverless PostgreSQL, use the provider’s pooled URL for application traffic where recommended.

### Prisma reports missing tables or drift

Use migrations rather than `prisma db push` outside disposable development databases:

```bash
npm run prisma:deploy
```

Confirm the deployment job and API target the same database. Never run development migration commands against production.

### API starts locally but production validation fails

Production intentionally rejects placeholder JWT secrets, HTTP frontend/CORS origins, wildcard CORS, and insecure cookies. Set `NODE_ENV=production`, explicit HTTPS URLs, independent secrets, `COOKIE_SECURE=true`, and the correct proxy depth.

### Requests return `401`, `403`, or `409`

- `401`: missing, expired, malformed, or revoked bearer token.
- `403`: role passed/failed or ownership, assignment, verification, account, or lifecycle rules deny access.
- `409`: current stock or resource state conflicts with the requested transition.

Do not work around these responses in the frontend. Inspect the response code/details and correct credentials or resource state.

## Media and email

### Upload is rejected

Use JPEG, PNG, or WebP. Limits are 5 MiB per product image (five/request, eight/product), 3 MiB per avatar, and 8 MiB per proof image. Confirm the multipart field is `images` for products and `image` for avatar/proof. Delivery proof also requires `receiverName` and a permitted delivery lifecycle state.

### Cloudinary operation fails

Verify all three backend-only Cloudinary variables, account restrictions, quota, and outbound connectivity. Do not prefix the API secret with `NEXT_PUBLIC_`. Database failure after upload triggers best-effort asset cleanup; review structured logs for cleanup errors.

### Email is not delivered

Check SMTP host/port/TLS mode, credentials, verified sender, and provider logs. Local development commonly uses a mail catcher on port 1025. Production requires a real provider plus SPF, DKIM, and DMARC. Email failure does not roll back the original business transaction.

## Docker

### Validate configuration without starting services

```bash
npm run docker:validate
docker compose config
docker compose -f docker-compose.prod.yml config
```

The repository validator checks YAML structure and Dockerfile stages; the native Docker commands additionally resolve Compose interpolation and engine behavior.

### Containers cannot reach each other

Inside Compose, use service DNS names rather than `localhost` (for example, database host `database` and API host `backend`). Browser-facing `NEXT_PUBLIC_API_URL` must still be reachable from the user’s browser.

### Frontend has the wrong API URL

`NEXT_PUBLIC_API_URL` is embedded at build time. Rebuild the frontend image after changing it; restarting the existing image is insufficient.

## Tests and coverage

See [Testing](TESTING.md). Keep `TEST_DATABASE_URL` isolated, regenerate Prisma after schema changes, and ensure mocks prevent real Cloudinary/SMTP calls. Coverage is written to ignored `coverage/` output.

## Getting help

When opening an issue, include the commit hash, operating system, Node/npm versions, command, sanitized error, relevant request ID, and minimal reproduction. State whether the problem occurs locally, in Docker, or on a named deployment provider. Redact database URLs, credentials, tokens, cookies, email addresses, and personal order data.
