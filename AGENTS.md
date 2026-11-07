# AGENTS.md — Balance

Personal multi-user finance tracking web app. **One financial space**, 1–n users; online desktop app, multi-currency.

| File                                                           | Purpose                             |
| -------------------------------------------------------------- | ----------------------------------- |
| **This file**                                                  | How to work (agent rules)           |
| [`TASKS.md`](./TASKS.md)                                       | What to do next (task queue)        |
| [`docs/requirements/README.md`](./docs/requirements/README.md) | Requirements index and layout       |
| [`docs/architecture/adr/`](./docs/architecture/adr/)           | Architecture Decision Records (why) |

## Role

Senior/Staff engineer: architecture integrity, FE↔BE type-safety, concurrent multi-user correctness, financial precision. Do not rewrite working code without need. Work only the current `TASKS.md` queue.

## Working the Task Queue

1. Open `TASKS.md`. Take the **first unchecked** task from the top that has no unresolved `**Blocked by**`. Work **feature by feature**: backend (dto + API) for that feature, then its frontend, then the next feature. Do not batch all backend before any frontend. Product boundary is [`scope.md`](./docs/requirements/scope.md).
2. Follow the spec-driven skill before coding. Claim the task line with an `(@agent-id)` suffix while working; remove the claim if you stop unfinished.
3. Stay within that task’s scope. For complex tasks fill in `**Plan**` before coding; remove `**Plan**` when done.
4. When **Acceptance** is met — mark `- [x]`. After merge, prefer deleting completed tasks (history lives in git).
5. Do not start a task with unfinished blockers.
6. Ambiguity that risks financial data loss or concurrent-edit conflicts — stop and ask.
7. A needed hack/workaround is a stop: highlight it, propose options, wait (see **Hacks and workarounds**).

## Spec-driven

The cycle is `[.cursor/skills/spec-driven/SKILL.md](./.cursor/skills/spec-driven/SKILL.md)`. Read it before a task that changes behavior, a contract, or an invariant.

Requirements and `TASKS.md` are Russian for meaning; established terms stay English (DTO, JWT, soft-delete, operationId, optimistic concurrency, NUMERIC, Carbon, Money). This file stays English.

## Skills (read before coding)

- A task that changes behavior, a contract, or an invariant: read `[.cursor/skills/spec-driven/SKILL.md](./.cursor/skills/spec-driven/SKILL.md)`
- `apps/server/**`, Nest modules, use cases, ports, repositories, migrations touching feature modules: read `[.cursor/skills/hexagonal-architecture/SKILL.md](./.cursor/skills/hexagonal-architecture/SKILL.md)`
- `apps/server/**`, SQL queries, repositories, migrations / schema design: read `[.cursor/skills/raw-postgresql/SKILL.md](./.cursor/skills/raw-postgresql/SKILL.md)`
- `apps/web/**`, React UI structure, FSD layers/slices, placement of auth/layout/pages: read `[.cursor/skills/feature-sliced-design/SKILL.md](./.cursor/skills/feature-sliced-design/SKILL.md)`
- `apps/web/**`, React performance (waterfalls, bundle, re-renders, data fetching): read `[.cursor/skills/vercel-react-best-practices/SKILL.md](./.cursor/skills/vercel-react-best-practices/SKILL.md)`
- `apps/web/**`, Carbon / IBM Products UI (components, tokens, charts): read `[.cursor/skills/carbon-builder/SKILL.md](./.cursor/skills/carbon-builder/SKILL.md)` and verify against Carbon MCP / docs before inventing custom UI

Do not apply FSD or Vercel React rules to `apps/server`. Do not apply Nest hexagonal layout to `apps/web`.

## Before Changing Code

1. Read the chosen task in `TASKS.md` and the requirements files it cites. A missing spec is handled by `[.cursor/skills/spec-driven/SKILL.md](./.cursor/skills/spec-driven/SKILL.md)`.
2. Study existing architecture and analogs in the repo; do not invent a new pattern when a suitable one already exists.
3. Respect Nx dependency boundaries: UI does not import the server or PostgreSQL; domain does not import React, Nest, or browser APIs; `libs/dto` does not depend on React or Nest.
4. Assess impact: domain, dto, DB schema, authz, multi-user attribution, money/currency, user preferences (locale/theme).
5. If multiple layers are affected — short plan first.
6. If creating or changing `apps/web` UI — run the Carbon Foundations / Components / Patterns check (Hard Constraints → UI) before considering the change done.
7. After implementation: typecheck, lint, relevant tests.
8. If behavior, a contract, or an invariant changed, update the specs as `[.cursor/skills/spec-driven/SKILL.md](./.cursor/skills/spec-driven/SKILL.md)` describes.

## Hard Constraints

- Desktop-first UI: design and accept against a wide viewport (Carbon `lg+`).
- API contract-first: shared TypeScript wire DTOs in `libs/dto`; do not duplicate DTOs between FE and BE. Feature delivery is **dto → backend → frontend**; do not start feature UI before that feature’s DTO and API exist. Inside each `libs/dto` feature domain use layers `models/`, `requests/`, `responses/`, `errors/`, `constraints/` (always present; see [`contracts.md`](./docs/requirements/contracts.md)); import only via `@balance/dto/<domain>`.
- Money: never use JS `number` in calculations; decimal-safe `Money` (`amount: string` + currency). Persist money as Postgres `NUMERIC` per the SQL skill.
- Mutations are idempotent (`operationId`); for concurrently mutable entities — optimistic concurrency (`version`).
- For shared financial entities — soft delete / tombstone (`deletedAt`). Required for multi-user consistency.
- Prefer correction/reversal over silent in-place edit of financial operations where possible.
- No `last-write-wins` for financial data under concurrent multi-user edits without explicit conflict handling.
- Authorization on every backend request (auth + permission); FE checks are not a security boundary.
- UI (`apps/web/**`): Carbon Design System for components — prefer Carbon components / charts / MCP over custom primitives when Carbon covers the need. Loading skeletons use `ascii-reveal`, colored with Carbon tokens. Agents **must** follow:
  - **Foundations**:
    - [2x Grid](https://www.carbondesignsystem.com/building-blocks/foundations/2x-grid/overview)
    - [Accessibility](https://www.carbondesignsystem.com/building-blocks/foundations/accessibility/overview)
    - [Color](https://www.carbondesignsystem.com/building-blocks/foundations/color)
    - [Content](https://www.carbondesignsystem.com/building-blocks/foundations/content)
    - [Icons](https://www.carbondesignsystem.com/building-blocks/foundations/icons)
    - [Spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)
    - [Themes](https://www.carbondesignsystem.com/building-blocks/foundations/themes/overview)
    - [Typography](https://www.carbondesignsystem.com/building-blocks/foundations/typography/overview)
  - **Components** — [Carbon core components](https://www.carbondesignsystem.com/building-blocks/core/components/overview) (usage, anatomy, a11y; use ContainedList / Tile / DataTable / Modal / etc. instead of reinventing)
  - **UI/UX Patterns** — [Common actions, Dialogs, Empty states, Forms, Loading, Notifications, Filtering, …](https://www.carbondesignsystem.com/building-blocks/core/patterns/overview)
    **Always** run this Foundations / Components / Patterns check when creating or changing any `apps/web` UI (page, section, modal, shared component, styles). Check layout against the 2x Grid; spacing/type/color against tokens; interactions against the matching pattern; do not invent one-off layouts that fight Carbon. Use Carbon MCP / carbon-builder skill to verify — do not rely on memory alone.
- No silent hacks or workarounds. If the proper API/pattern does not fit, stop, describe the gap, propose options, and wait for the next instruction (see **Hacks and workarounds**).
- Do not add Redis/queues/WebSockets “for later” without a concrete need and an evaluation against Postgres/NestJS.
- Public API documentation: every **public** surface of an architectural component — exported interfaces, classes, functions, hooks, providers, domain types — must have **JSDoc** (purpose, parameters, return value; note non-obvious behavior and invariants where relevant). Private helpers need JSDoc only when the logic is complex or non-obvious.

## Must NOT

- Invent architecture when a project pattern already exists
- Use floating point for money
- Store financial domain only in `localStorage`
- Rely only on frontend authorization
- Non-idempotent mutations / silent overwrite of concurrent edits
- Physically delete shared financial entities without a tombstone (`deletedAt`)
- Duplicate DTOs; paper over gaps with `any` / `@ts-ignore`
- Silently apply hacks/workarounds (CSS against library internals, type escapes, pattern bypasses) instead of stopping to propose options
- Ship `apps/web` UI that ignores Carbon Foundations, core Components, or UI/UX Patterns when a Carbon solution exists
- Use `import type` or inline `type` in import lists
- Hard-code user-visible copy for one language when the screen is translated
- Add a dependency without a concrete need

## Critical scenarios (keep in mind)

- Two users in one space: each mutation records `createdBy`; accounts are shared, not owned. The list shows that attribution. It does not filter by author.
- Concurrent edit of the same entity → `version` conflict, no silent overwrite. Example: both read version 10; the first write stores 11; the second write sent with 10 is rejected.
- Multi-currency: per-account balances only; never sum mixed currencies without conversion.
- Duplicate delivery of the same mutation → `operationId` applied once.

When a change is risky, ask what happens if two users edit the same entity, if the same request is delivered twice, and if two amounts are in different currencies.

## Hacks and workarounds

Do **not** silently land a hack, workaround, or library-internal override to “just make it work.” That includes (not exhaustive): targeting Carbon/internal class names (`:global(.cds--…)`), fighting a design-system layout with CSS, `@ts-ignore` / `any` to paper over types, one-off flags, duplicated DTOs, or bypassing an existing project pattern.

When the proper API or composition is missing, unclear, or would require a workaround:

1. **Stop.** Do not apply the hack.
2. **Highlight** the gap (what does not fit the intended API/pattern).
3. **Describe** why a workaround looks necessary.
4. **Propose options** (correct API/composition, product/UX decision, defer, accepted exception).
5. **Wait** for the next instruction before coding.

An exception is allowed only when the user explicitly chooses one of the proposed options.

## Target Stack

| Layer          | Technologies                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo       | Nx                                                                                                                                                                              |
| Web            | React, TypeScript, IBM Carbon (`@carbon/react`, `@carbon/charts`); **SCSS** + **CSS Modules** (`.module.scss`) + carbon via `@use '@carbon/react'`; i18next for multilingual UI |
| Server         | NestJS, PostgreSQL (`pg`), `@ts-safeql/sql-tag`, Docker                                                                                                                         |
| Tests (web)    | Unit/component: **Vitest** + React Testing Library; E2E: **Playwright**                                                                                                         |
| Tests (server) | Unit/integration: **Jest** (+ Nest testing / supertest); E2E of critical flows: **Playwright**                                                                                  |
| Shared         | `libs/dto`, `libs/domain`                                                                                                                                                       |
| Env / secrets  | Only in `apps/web` and `apps/server` (`.env`); not a shared lib                                                                                                                 |

Adapt paths to the actual workspace layout.

## TypeScript style

- Use plain `import { … } from '…'` for both types and values. Do **not** use `import type { … }` or inline `type` in import lists (`import { type Foo }`).

## Design by Contract

For swappable modules (use cases, repositories, session/auth facades, and other ports):

**contract (**`interface I`**\*) → implementation → token**

- Swappable contracts use `interface I*` (`ILoginUseCase`, `ISession`). Data shapes and wire types (`LoginRequest`, `UserRecord`, `@balance/dto`) use `interface`/`type` **without** the `I` prefix; prefer `type` for data. ESLint enforces the `I` prefix only in `apps/**`.
- Resolve by **token**; consumers are typed as the `I`\* contract, not the concrete class. Define the contract first, then the implementation, then the binding.
- **Backend token:** Nest injection token (`Symbol` / string) in `*.module.ts`.
- **Frontend token:** React `Context` + Provider + hook — not Nest-style `Symbol` DI. Plain imports are fine for trivial single-implementation helpers that are not swapped in tests.
- Export the contract and the public resolve path (Nest token / React hook); do not export the implementation unless the module or tests need it.

## PostgreSQL (this repo)

SQL approach: `[.cursor/skills/raw-postgresql/SKILL.md](./.cursor/skills/raw-postgresql/SKILL.md)`. Here: queries in `apps/server/src`, migrations in `apps/server/migrations/` (`npm run db:migrate`), SafeQL on `nx lint server` (Postgres must be up). Change the schema only by a migration. Do not edit an applied migration or change the production schema by hand.

## Definition of Done (unless the task narrows it)

As needed:

- Domain / dto / schema via a migration;
- Idempotency (`operationId`);
- Optimistic concurrency (`version`) where entities are concurrently mutable;
- Authz on backend;
- Decimal-safe money and an explicit currency;
- Loading/error/empty in UI; skeletons via `ascii-reveal`, matching the final layout;
- Desktop-first UX (Carbon `lg+`);
- UI copy through i18n (`en` and `ru`) and Carbon theme tokens;
- UI aligned with Carbon Foundations / Components / Patterns (see Hard Constraints);
- Tests for non-trivial logic;
- Existing tests still pass;
- Lint + typecheck; Nx boundaries respected.

## Commands

Requires **Node 22+**.

```bash
# Local Postgres (required for server)
docker compose up -d   # or: npm run db:up
# apps/server/.env from apps/server/.env.example

# Dev servers
npx nx serve web       # http://localhost:4200  (/api → server :3000)
npx nx serve server    # http://localhost:3000/api

# Build / quality
npx nx build web
npx nx build server
npx nx run-many -t build --projects=web,server
npx nx graph

# Single project
npx nx lint <project>      # web | server | dto | domain
npx nx typecheck <project>
npx nx test <project>      # Vitest (web/FE) or Jest (server/BE)
npx nx e2e <project>       # Playwright (when an e2e project exists)
```

npm scripts: `npm run start:web`, `start:server`, `db:up`, `db:down`, `build`, `graph`, `lint`, `typecheck`.
