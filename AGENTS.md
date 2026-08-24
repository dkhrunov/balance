# AGENTS.md — Balance

Personal multi-user finance tracking web app. **One financial space**, 1–n users; offline-first, multi-currency, sync across users.

| File                                     | Purpose                            |
| ---------------------------------------- | ---------------------------------- |
| **This file**                            | How to work (agent rules)          |
| [`TASKS.md`](./TASKS.md)                 | What to do next (task queue)       |
| [`SPEC.md`](./docs/requirements/SPEC.md) | Full product and architecture spec |

## Role

Senior/Staff engineer: architecture integrity, FE↔BE type-safety, offline-first, correct sync, financial precision. Do not rewrite working code without need.

## Before Changing Code

1. Read the chosen task in `TASKS.md` and the cited sections of `docs/requirements/SPEC.md` (start with §1 Product Scope).
2. Study existing architecture and analogs in the repo; do not invent a new pattern when a suitable one already exists.
3. Respect Nx dependency boundaries.
4. Assess impact: domain, contracts, DB schema, sync, offline storage, authz, multi-user attribution, money/currency, user preferences (locale/theme). Do not add a second financial space or account membership in MVP (SPEC §9).
5. If the task is Post-MVP, do not pull MVP work into scope (and vice versa: do not pre-build Post-MVP tables/APIs).
6. If multiple layers are affected — short plan first.
7. After implementation: typecheck, lint, relevant tests.

## Hard Constraints

- Offline-first: client works without network; server is authoritative after sync.
- Desktop-first UI (MVP): design and accept against a wide viewport (Carbon `lg+`). A dedicated mobile/tablet layout is Post-MVP; do not spend MVP time on a phone layout.
- API contract-first: shared TypeScript contracts in `libs/contracts`; do not duplicate DTOs between FE and BE. Feature delivery is **contracts → backend → frontend**; do not start feature UI before that feature’s contract and API exist.
- Money: never use JS `number` in calculations; decimal-safe `Money` (`amount: string` + currency); in PostgreSQL — `NUMERIC` (or agreed minor units).
- Mutations are idempotent (`operationId`); for concurrently mutable entities — optimistic concurrency (`version`).
- For sync entities — soft delete / tombstone (`deletedAt`).
- Prefer correction/reversal over silent in-place edit of financial operations where possible.
- No `last-write-wins` for financial data under concurrent multi-user edits without explicit conflict handling.
- Authorization on every backend request (auth + permission); FE checks are not a security boundary.
- UI: Carbon Design System / Carbon Charts / Carbon MCP instead of custom primitives when Carbon covers the need. Design-in-app review (+ Figma only on request): [`.cursor/rules/carbon-ui-figma.mdc`](./.cursor/rules/carbon-ui-figma.mdc).
- No silent hacks or workarounds. If the proper API/pattern does not fit, stop, describe the gap, propose options, and wait for the next instruction (see **Hacks and workarounds**).
- Do not add Redis/queues/WebSockets “for later” without a concrete need and an evaluation against Postgres/NestJS.
- Locale and theme are user preferences persisted on the backend (cross-session, cross-browser); see SPEC §4 and §8.

## Target Stack

| Layer         | Technologies                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Monorepo      | Nx                                                                                             |
| Web           | React, TypeScript, Carbon (`@carbon/react`), PWA, Service Worker, IndexedDB; **desktop-first** (MVP) |
| Styles        | **SCSS** + **CSS Modules** (`.module.scss`); Carbon via `@use '@carbon/react'`                 |
| i18n          | Multilingual UI (`en`, `ru`); deploy-time default + in-app switch                              |
| Theme         | Carbon-compatible `light` / `dark` / `system` (default `system`)                               |
| API           | NestJS, PostgreSQL (`pg`), `@ts-safeql/sql-tag`, Docker, JWT                                   |
| Tests (web)   | Unit/component: **Vitest** + React Testing Library; E2E: **Playwright**                        |
| Tests (api)   | Unit/integration: **Jest** (+ Nest testing / supertest); E2E of critical flows: **Playwright** |
| Shared        | `libs/contracts`, `libs/domain` (+ feature/sync libs as needed)                                |
| Env / secrets | Only in `apps/web` and `apps/api` (`.env`); not a shared lib                                   |

Adapt paths to the actual workspace layout.

## Dependency Direction

```text
apps → features → application → domain
                              ↑
                    infrastructure implementations
```

Forbidden: UI → PostgreSQL / NestJS internals; Domain → React / browser APIs; contracts that depend on Nest/React.

## Working the Task Queue

1. Open `TASKS.md`. Take the **first unchecked** task in the highest non-empty priority (`P0` → `P1` → `P2` → `P3`) that has no unresolved `**Blocked by**`. Prefer finishing MVP (`P1`) before Post-MVP (`P2`/`P3`); see SPEC §1. Work **feature by feature**: backend (contracts + API) for that feature, then its frontend, then the next feature. Do not batch all backend before any frontend.
2. Claim the task line with an `(@agent-id)` suffix while working; remove the claim if you stop unfinished.
3. Stay within that task’s scope. For complex tasks fill in `**Plan**` before coding; remove `**Plan**` when done.
4. When **Acceptance** is met — mark `- [x]`. After merge, prefer deleting completed tasks (history lives in git).
5. Do not start a task with unfinished blockers.
6. Ambiguity that risks financial data loss or sync conflicts — stop and ask.
7. A needed hack/workaround is a stop: highlight it, propose options, wait (see **Hacks and workarounds**).

## Hacks and workarounds

Do **not** silently land a hack, workaround, or library-internal override to “just make it work.” That includes (not exhaustive): targeting Carbon/internal class names (`:global(.cds--…)`), fighting a design-system layout with CSS, `@ts-ignore` / `any` to paper over types, one-off flags, duplicated contracts, or bypassing an existing project pattern.

When the proper API or composition is missing, unclear, or would require a workaround:

1. **Stop.** Do not apply the hack.
2. **Highlight** the gap (what does not fit the intended API/pattern).
3. **Describe** why a workaround looks necessary.
4. **Propose options** (correct API/composition, product/UX decision, defer, accepted exception).
5. **Wait** for the next instruction before coding.

An exception is allowed only when the user explicitly chooses one of the proposed options.

## API / Schema Changes

1. Shared contract → 2. Backend (schema, API, authz, tests) → 3. Frontend client built against those contracts → 4. Tests → 5. Account for offline clients with an old queue (`schemaVersion` / sync protocol).

Do not start feature UI until step 2 exists for that feature.

Change the DB schema only via migrations.

## PostgreSQL data access (API)

- Use raw **`pg`** in `apps/api`; do not add an ORM (TypeORM, Prisma, Sequelize, etc.).
- In TypeScript under `apps/api/src`, write parameterized queries with **`sql` from `@ts-safeql/sql-tag`** and type row results explicitly, e.g. `pool.query<UserRow>(sql\`...\`)`.
- Do not interpolate user input into SQL strings; the tag generates `$1`, `$2`, … placeholders.
- `@ts-safeql/eslint-plugin` validates tagged SQL against the live Postgres schema during lint — keep Postgres up when running `nx lint api`.
- Schema changes belong in **`apps/api/migrations/*.sql`** only; apply with `npm run db:migrate`.
- **Exceptions:** CLI scripts (`apps/api/scripts/*.mjs`) and migration SQL files may use plain `$1` + values or raw SQL files without `sql`-tag; they are not covered by SafeQL lint.

Example:

```typescript
import { sql } from '@ts-safeql/sql-tag';

const result = await pool.query<UserRow>(sql`
    SELECT id, email
    FROM users
    WHERE email = ${email}
`);
```

## Priority When Requirements Conflict

1. Data integrity → 2. Security → 3. Financial correctness → 4. Sync correctness → 5. Type safety → 6. Domain consistency → 7. UX → 8. Performance → 9. Developer convenience

## Definition of Done (unless the task narrows it)

As needed: domain / contracts / schema; API then UI (UI only after the API exists); offline/pending mutation path; idempotency; authz on backend; decimal-safe money; loading/error/empty in UI; desktop UX (mobile layout is not an MVP DoD item); tests for non-trivial logic; lint + typecheck; Nx boundaries respected.

## Must NOT

- Invent architecture when a project pattern already exists
- Use floating point for money
- Store financial domain only in `localStorage`
- Rely only on frontend authorization
- Non-idempotent sync / silent overwrite of concurrent edits
- Physically delete sync entities without a tombstone when sync requires one
- Duplicate contracts; paper over gaps with `any` / `@ts-ignore`
- Silently apply hacks/workarounds (CSS against library internals, type escapes, pattern bypasses) instead of stopping to propose options
- Require network to read local data
- Treat `navigator.onLine === true` as proof of real connectivity
- Treat a mobile/tablet layout as an MVP deliverable
- Start feature UI before that feature’s contracts and backend API exist
- Introduce multiple financial spaces, per-user spaces, or account membership/roles in MVP
- Use string-concatenated or untyped SQL in `apps/api/src` when a parameterized `sql`-tag query is appropriate

## Critical Questions (sync / money)

Offline? Two users at once? Duplicate delivery? JWT expired offline? Old queue after deploy? Aggregating different currencies? Network drop mid-request?

## Commands

Requires **Node 22+** (`nvm use`, see `.nvmrc`).

```bash
# Local Postgres (required for API)
docker compose up -d   # or: npm run db:up
# apps/api/.env from apps/api/.env.example

# Dev servers
npx nx serve web    # http://localhost:4200  (/api → api :3000)
npx nx serve api    # http://localhost:3000/api

# Build / quality
npx nx build web
npx nx build api
npx nx run-many -t build --projects=web,api
npx nx run-many -t lint,typecheck,test
npx nx graph

# Single project
npx nx lint <project>      # web | api | contracts | domain
npx nx typecheck <project>
npx nx test <project>      # Vitest (web/FE) or Jest (api/BE)
npx nx e2e <project>       # Playwright (when an e2e project exists)
```

npm scripts: `npm run start:web`, `start:api`, `db:up`, `db:down`, `build`, `graph`, `lint`, `typecheck`.
