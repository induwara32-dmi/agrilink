# AgriLink Project Rules

## Project overview

AgriLink is an agricultural marketplace that connects buyers, farmers, transporters, and platform administrators. The current repository contains the stabilized frontend experience. Backend services, persistent storage, payments, and production integrations are planned but are not yet implemented.

These rules apply to every contributor and AI agent working in this repository.

## Tech stack

- Next.js 16 App Router
- React 19 and React Server Components by default
- TypeScript in strict mode
- Tailwind CSS 4
- Lucide React icons
- Radix Slot and class-variance-authority for reusable UI primitives
- React Hook Form and Zod for planned validated forms
- TanStack Query for planned server-state integration
- Recharts for dashboard visualization
- ESLint with the Next.js configuration

Do not replace the established stack or add dependencies without a demonstrated need and approval.

## Design system rules

- Reuse the CSS variables and design tokens defined in `app/globals.css` and `config/theme.ts`.
- Preserve the established color palette, typography, spacing, rounded corners, borders, shadows, and responsive behavior.
- Use components from `components/ui` and existing feature components before creating new primitives.
- Use Lucide icons consistently; do not introduce a second icon system.
- Every interactive element must have visible keyboard focus and an accessible name.
- Use semantic links for navigation and semantic buttons for actions.
- New layouts must avoid horizontal page overflow and work at mobile, tablet, and desktop widths.
- Do not redesign completed modules without explicit approval.

## Folder and routing conventions

- `app/` contains App Router layouts, pages, loading states, error boundaries, and not-found states.
- Route groups such as `app/(dashboard)` organize shared layouts without changing public URLs.
- Dynamic route parameters use bracket folders, for example `app/orders/[orderId]`.
- `components/ui/` contains reusable, presentation-focused primitives.
- `components/features/` contains reusable components and mock data scoped to a domain.
- `components/layout/` contains shared navigation and layout definitions.
- `config/` contains centralized domain constants and design configuration.
- `lib/` contains framework-independent utilities.
- `providers/` contains application-wide React providers.
- Use the `@/` import alias for project modules.
- Every internal navigation target must correspond to an implemented route or a valid page anchor. Do not add placeholder links that lead to a 404.

## Component reuse rules

- Search for an existing component before creating one.
- Extend an existing component through typed props or variants when the change remains broadly reusable.
- Keep feature-specific behavior out of generic UI primitives.
- Keep roles, statuses, delivery methods, and navigation definitions centralized.
- Keep each mock dataset in one canonical domain file and derive views from it rather than copying records.
- Do not rebuild or duplicate completed features.

## TypeScript and coding standards

- Keep TypeScript `strict` enabled.
- Do not use `any`; use explicit types, generics, discriminated unions, or `unknown` with narrowing.
- Prefer immutable constants and inferred literal types where they improve safety.
- Use Server Components unless browser state, effects, or event handlers require a Client Component.
- Follow the installed Next.js documentation in `node_modules/next/dist/docs/` because this project may use framework behavior newer than an agent's training data.
- Remove unused imports, unreachable code, obsolete fixtures, and commented-out implementations.
- Handle loading, empty, expected-error, unexpected-error, and not-found states where applicable.
- Preserve accessibility: labels, headings, landmarks, keyboard operation, focus states, and `aria-current`/`aria-expanded` where appropriate.

## Git commit conventions

Use focused commits following Conventional Commits:

- `feat:` new user-facing capability
- `fix:` defect correction
- `refactor:` structural improvement without a new feature
- `docs:` documentation-only change
- `test:` test-only change
- `chore:` maintenance or tooling

Commit messages use the imperative mood, remain concise, and describe one coherent change. Do not rewrite published history or discard unrelated work.

## Build and lint requirements

Before a task is considered complete:

1. Run `npm run lint` and resolve all errors and important warnings.
2. Run `npm run build` and resolve compilation and strict TypeScript failures.
3. Verify changed navigation targets and relevant UI states.
4. Confirm `git diff --check` is clean.

Do not commit generated build output, temporary logs, or local environment secrets.

## AI agent instructions

- Read this file, `CLAUDE.md`, `AGENTS.md`, `README.md`, relevant files, and recent Git history before changing the project.
- Inspect the current implementation and working tree before acting; preserve user changes and unfinished work.
- Continue from the latest completed phase instead of recreating modules.
- Make the smallest change that satisfies the request and retain the current architecture and visual language.
- Do not add product features, dependencies, routes, schemas, or APIs unless requested.
- Never redesign completed modules without explicit user approval.
- Do not claim visual, route, lint, build, or test verification that was not actually performed.
- Document assumptions and distinguish current implementation from future plans.
- Stop and request direction when a decision would materially expand scope or alter an approved architecture.

