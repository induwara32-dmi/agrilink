# AgriLink CI/CD

## Overview

AgriLink uses GitHub Actions for pull-request validation, manually approved deployment templates, and tag-based releases. The workflows do not contain real credentials and do not change application business behavior.

| Workflow | File | Trigger | Purpose |
| --- | --- | --- | --- |
| Continuous Integration | `.github/workflows/ci.yml` | Every push and pull request | Validate Prisma/docs/workflows, lint, typecheck, build, test, and upload coverage |
| Continuous Deployment Template | `.github/workflows/deploy.yml` | Manual dispatch | Verify a revision, then deploy to Vercel, Railway, Render, or all selected targets |
| Release | `.github/workflows/release.yml` | Tags matching `v*` | Reverify source, package frontend/backend/API artifacts, checksum, and publish a GitHub release |

Run `npm run ci:validate` locally to parse all workflow YAML and verify required triggers, jobs, permissions, deployment environments, coverage upload, release checksums, and credential policy.

## Continuous integration

CI uses Node.js 22 and lockfile-aware npm caching through `actions/setup-node`. Jobs are separated so failures are visible by responsibility and independent work can run in parallel:

- **Prisma and generated contracts:** installs dependencies, generates Prisma Client, validates/formats the schema, verifies regenerated OpenAPI/Postman files, and validates workflow syntax/policy.
- **ESLint:** runs the repository-wide lint configuration.
- **Backend:** generates Prisma Client, runs strict backend TypeScript checking, and compiles the Express API.
- **Frontend:** generates Prisma Client and builds the Next.js production bundle.
- **Tests:** starts an isolated PostgreSQL 16 service, applies committed migrations, runs the complete Vitest suite with V8 coverage, and uploads `coverage/` for 14 days.

CI uses explicit non-production placeholder environment values. It never connects to staging/production, Cloudinary, or SMTP. External media/email calls remain mocked by the test suite.

Recommended required status checks on `main` are all five CI jobs. Enable “Require branches to be up to date,” at least one approving review, resolved conversations, and disallow direct pushes/force pushes.

## Required GitHub environments

Create protected GitHub environments named `staging` and `production`. Configure environment-specific secrets independently, restrict which branches/tags may deploy, and require reviewer approval for production. Environment protection is the approval boundary used by deployment jobs.

Repository secrets are inherited only when an environment does not override them. Prefer environment-level secrets so staging and production cannot accidentally share targets.

## Required GitHub secrets and variables

### Vercel frontend

| Name | Type | Purpose |
| --- | --- | --- |
| `VERCEL_TOKEN` | Secret | Scoped Vercel deployment token |
| `VERCEL_ORG_ID` | Secret | Vercel team/account identifier |
| `VERCEL_PROJECT_ID` | Secret | Linked frontend project identifier |
| `NEXT_PUBLIC_API_URL` | Environment variable | Public API base ending in `/api/v1` |

Application environment variables for the frontend remain configured in the Vercel project. The workflow pulls the selected Vercel environment and deploys a prebuilt output.

### Railway backend

| Name | Type | Purpose |
| --- | --- | --- |
| `RAILWAY_TOKEN` | Secret | Environment-scoped Railway project token |
| `RAILWAY_PROJECT_ID` | Secret | Target Railway project identifier |
| `RAILWAY_SERVICE` | Secret | Target backend service name or identifier |
| `RAILWAY_ENVIRONMENT` | Secret | Target Railway environment name or identifier |

Configure backend runtime secrets, `DATABASE_URL`, migrations/pre-deploy command, health path, Dockerfile, and region in Railway. The environment-scoped project token permits the pinned Railway CLI to upload the workflow’s checked-out revision without exposing runtime secrets to GitHub.

### Render backend

| Name | Type | Purpose |
| --- | --- | --- |
| `RENDER_DEPLOY_HOOK_URL` | Secret | Environment-specific Render deploy hook |

Configure runtime secrets, database, pre-deploy migration, health path, Dockerfile, branch, and region in Render. The hook must point to the intended staging or production service.

No real value belongs in workflow YAML, repository variables, logs, artifacts, pull-request comments, or documentation. Provider runtime variables are listed in [Deployment](DEPLOYMENT.md#production-environment-variables).

## Branch strategy

AgriLink follows a protected-trunk strategy:

1. `main` is always releasable and protected from direct/force pushes.
2. Work occurs on short-lived `feature/*`, `fix/*`, `docs/*`, or `chore/*` branches.
3. Pull requests require CI, review, and resolved discussions before squash/merge or a focused Conventional Commit merge.
4. Staging deployments use an approved commit from `main` through manual workflow dispatch.
5. Production releases use annotated semantic-version tags such as `v1.2.0` created from a verified `main` commit.
6. Hotfixes branch from the current production tag, pass the same pull-request checks, merge to `main`, and receive a new patch tag.

Do not deploy unreviewed pull-request code to production environments, and do not move or reuse published version tags.

## Deployment flow

1. Merge a reviewed pull request only after every CI job succeeds.
2. Dispatch **Continuous Deployment Template**, select `staging`, and choose one provider or `all`.
3. The workflow rebuilds, lints, tests, and typechecks the exact selected commit before any deployment job begins.
4. GitHub environment rules request the required approval.
5. Vercel receives the frontend prebuilt output; Railway receives the checked-out source through its pinned CLI; Render receives a deploy hook with the exact Git commit reference. Provider-side pre-deploy steps own production migrations.
6. Verify `/api/v1/health`, `/api/v1/readiness`, `/api/v1/version`, authentication, marketplace, and one safe role-based smoke journey.
7. Tag the approved `main` commit with `v*`. The release workflow creates versioned frontend, backend, and API-contract archives plus `SHA256SUMS.txt`, uploads a workflow artifact, and creates release notes.
8. Dispatch production deployment against the same tagged/verified commit and monitor error rate, latency, database connections, media/email outcomes, and rate limits.

The deployment workflow is intentionally manual until live providers, smoke tests, observability, and rollback drills are configured. Repository activation requires creating GitHub environments and secrets; no template job can deploy without them.

## Database migrations

CI applies migrations only to its disposable PostgreSQL service. Production migrations run once as a Railway/Render pre-deploy task or controlled release job using `npm run prisma:deploy`. Never run `prisma migrate dev` or `prisma db push` in deployment workflows.

Use backward-compatible expand/migrate/contract changes when application versions may overlap. Back up the database before high-risk migrations and verify restore ownership. A failed migration blocks the application rollout; do not bypass it by starting new replicas against an incompatible schema.

## Release artifacts

For every `v*` tag, GitHub receives:

- `agrilink-frontend-<tag>.tar.gz`: Next.js standalone runtime, static assets, and public assets
- `agrilink-backend-<tag>.tar.gz`: compiled API, Prisma schema/migrations, and npm manifests
- `agrilink-api-contract-<tag>.tar.gz`: OpenAPI and Postman contracts
- `SHA256SUMS.txt`: SHA-256 checksums for integrity verification

Artifacts contain no `.env` files, dependency caches, coverage, local database data, or provider credentials. Container images are still the preferred deployment unit; archives support inspection and controlled recovery.

## Rollback strategy

Application rollback and database recovery are separate decisions:

1. Stop promotion and record the failed commit/tag, environment, request IDs, and symptoms.
2. Roll back Vercel by promoting the last known-good deployment. Roll back Railway or Render through provider deployment history/redeploy of the last known-good immutable commit/image.
3. Verify health/readiness/version and role smoke tests after rollback.
4. Do not reverse a successfully applied database migration automatically. Prefer a forward fix when the schema remains compatible.
5. For destructive or corrupted data changes, stop writes, restore into a separate recovery database from point-in-time backup, validate commercial relationships, and switch only through an approved incident procedure.
6. Rotate any credential exposed during an incident and preserve sanitized audit/log evidence.
7. Follow with a tested patch release and post-incident review.

Maintain a release ledger mapping version tags to frontend/backend deployments and migration versions. Exercise rollback and database restore procedures in staging before production launch.

## Pipeline maintenance

- Review and update action major versions deliberately; prefer commit-SHA pinning when organization policy requires it.
- Keep Node/PostgreSQL versions aligned with Docker and deployment documentation.
- Review npm and container advisories before release.
- Keep artifact retention short unless compliance requires longer storage.
- Add provider smoke checks only after stable deployment URLs and authentication fixtures exist.
- Add container publishing/signing and provenance when a registry is selected.
