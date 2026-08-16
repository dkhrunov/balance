# Tasks

<!-- Balance implementation queue. Companion to AGENTS.md (how) and docs/requirements/SPEC.md (spec).
     Spec: https://github.com/tasksmd/tasks.md
     policy: Work one unblocked task at a time; claim with (@agent-id) on the task line.
     policy: Before coding, read AGENTS.md and the SPEC sections named in Details.
     policy: Contracts → backend → frontend → tests for API changes. Migrations for all schema changes.
     policy: No floating-point money. Idempotent mutations. Soft-delete synced entities.
     policy: Mark Acceptance met before checking the box. Prefer deleting completed tasks on merge.
     policy: P1 = MVP income/expense (+ offline). P2/P3 = Post-MVP. Do not start P2 until MVP path is usable. -->

## P0

<!-- Empty while greenfield: nothing production-broken yet. Promote blockers here when the app runs. -->

## P1 — MVP (income / expense + offline)

<!-- policy: Implement in listed order. Do not skip ahead past Blocked by.
     Goal: log in, manage accounts/categories, record income/expense/transfer with attribution,
     work offline and sync. No budgets, analytics charts, debts, or savings goals here. -->

- [x] Scaffold Nx monorepo with `apps/web` and `apps/api`
  - **ID**: scaffold-nx-monorepo
  - **Tags**: infra, nx
  - **Details**: Initialize Nx workspace; React+TS web app; NestJS API app; baseline libs layout (`contracts`, `domain` stubs OK; env in apps, no shared `libs/config`). Align with SPEC §1, §3–5. Update AGENTS.md Commands with real targets.
  - **Acceptance**: `npx nx graph` works; `web` and `api` projects build; Node version matches `.nvmrc`; README notes how to start both apps.
  - **Estimate**: 2-4h

- [x] Docker Compose PostgreSQL for local API
  - **ID**: docker-postgres
  - **Tags**: infra, database
  - **Details**: `docker-compose` (or equivalent) with Postgres; `.env.example` for connection; documented start command. SPEC §5, §40.
  - **Acceptance**: `docker compose up -d` yields a reachable DB; API can connect via env; secrets not committed.
  - **Blocked by**: scaffold-nx-monorepo
  - **Estimate**: 1h

- [ ] Shared `libs/contracts` package skeleton
  - **ID**: contracts-skeleton
  - **Tags**: contracts
  - **Details**: Workspace TS library; MVP folders only: auth, users, accounts, transactions, categories, currencies, sync, common errors/pagination. No budgets/debts/analytics stubs. SPEC §1, §6, §65.
  - **Acceptance**: Both `api` and `web` can import from contracts; empty/placeholder types compile; Nx boundary enforced.
  - **Blocked by**: scaffold-nx-monorepo
  - **Estimate**: 1-2h

- [ ] Money + currency domain primitives
  - **ID**: money-currency-domain
  - **Tags**: domain, money
  - **Details**: Decimal-safe `Money` (`amount: string` + currency); RUB/USD/EUR; precision helpers; unit tests. Never use JS number for arithmetic. SPEC §11–12.
  - **Acceptance**: Unit tests cover add/subtract/compare and reject unsafe number usage paths; contracts export Money/CurrencyCode types.
  - **Blocked by**: contracts-skeleton
  - **Estimate**: 2-3h

- [ ] Users schema + admin seed (no public registration)
  - **ID**: users-schema
  - **Tags**: backend, auth, database
  - **Details**: User entity with password hash fields, `defaultCurrency`; migration; seed/admin path to create users in DB only. SPEC §8, §40, §67.
  - **Acceptance**: Migration applies cleanly; user can be inserted via seed/script; plaintext passwords never stored.
  - **Blocked by**: docker-postgres, money-currency-domain
  - **Estimate**: 2h

- [ ] JWT authentication API (login, validate, identity)
  - **ID**: auth-jwt
  - **Tags**: backend, auth
  - **Details**: Login endpoint; access token; guards; Argon2 or bcrypt; JWT payload without sensitive data; structured errors. Contracts for auth request/response. SPEC §8, §36–39.
  - **Acceptance**: Login returns JWT; protected route rejects unauthenticated; passwords hashed; contract types used end-to-end; basic tests.
  - **Blocked by**: users-schema, contracts-skeleton
  - **Estimate**: 3-4h

- [ ] Accounts domain + API
  - **ID**: accounts-api
  - **Tags**: backend, accounts
  - **Details**: Account CRUD with explicit currency, `version`, soft delete; authenticated users access the common financial space. SPEC §9–10, §28, §32, §39.
  - **Acceptance**: Authenticated user CRUD accounts; currency required; version bumps on update; unauthenticated denied; contracts + migration + tests.
  - **Blocked by**: auth-jwt, money-currency-domain
  - **Estimate**: 4h

- [ ] Categories API (income + expense)
  - **ID**: categories-api
  - **Tags**: backend, categories
  - **Details**: Separate income/expense categories; CRUD; soft delete; contracts. No subcategory/icon schema in MVP. SPEC §17.
  - **Acceptance**: CRUD works; type separation enforced; authz; tests.
  - **Blocked by**: auth-jwt
  - **Estimate**: 2-3h

- [ ] Transactions API — income and expense (+ attribution filters)
  - **ID**: transactions-income-expense
  - **Tags**: backend, transactions
  - **Details**: Create/list/get/soft-delete income/expense with accountId, categoryId, Money, transactionDate, description, `createdBy`, versioning. List filter: all | me | selected userIds. Pagination (cursor preferred). SPEC §9, §14–16, §29, §57.
  - **Acceptance**: Decimal-safe amounts; `createdBy` set; filters return correct subsets; category type matches; pagination; tests.
  - **Blocked by**: accounts-api, categories-api
  - **Estimate**: 4-6h

- [ ] Transactions API — transfers between accounts
  - **ID**: transactions-transfer
  - **Tags**: backend, transactions
  - **Details**: Transfer is not a plain expense; atomic DB transaction; linked legs or dedicated model; no silent FX across currencies. SPEC §14, §41.
  - **Acceptance**: Transfer moves value without treating it as net expense; partial failure impossible; tests cover atomicity.
  - **Blocked by**: transactions-income-expense
  - **Estimate**: 3-4h

- [ ] Web app shell — Carbon, routing, login, JWT storage
  - **ID**: web-shell-auth
  - **Tags**: frontend, auth, ui
  - **Details**: Mobile-first shell; Carbon; login page; authenticated layout; token storage per SPEC XSS model; offline-readable session once logged in. SPEC §4, §37–38, §50.
  - **Acceptance**: User can log in against API; protected routes redirect; Carbon chrome; narrow viewport OK.
  - **Blocked by**: auth-jwt, scaffold-nx-monorepo
  - **Estimate**: 3-4h

- [ ] Accounts + categories UI (online CRUD)
  - **ID**: accounts-categories-ui
  - **Tags**: frontend, accounts, categories
  - **Details**: List/create/edit accounts and categories; money/currency inputs without float; show per-account balance. SPEC §10, §17–18, §51.
  - **Acceptance**: Full CRUD online; currency + balance shown; empty/loading/error; mobile-usable forms.
  - **Blocked by**: web-shell-auth, accounts-api, categories-api
  - **Estimate**: 4h

- [ ] Transactions UI — income, expense, transfer + visibility filters
  - **ID**: transactions-ui
  - **Tags**: frontend, transactions
  - **Details**: Create/list transactions; transfer flow; decimal money input; dates; show `createdBy`; filter all / me / selected users. SPEC §9, §14–16, §46, §51–52.
  - **Acceptance**: Record income/expense/transfer; lists paginate; amounts correct; attribution + filters work; mobile forms usable.
  - **Blocked by**: accounts-categories-ui, transactions-transfer
  - **Estimate**: 4-6h

- [ ] User preferences API — locale + theme
  - **ID**: user-preferences-api
  - **Tags**: backend, users, preferences
  - **Details**: Persist `locale` (`en`|`ru`) and `theme` (`light`|`dark`|`system`, default `system`); GET/PUT (or PATCH) `/users/me/preferences`; contracts; migration; owner-only. SPEC §6, §8, §40, §56.
  - **Acceptance**: Authenticated user read/update preferences; defaults when missing; unauthorized denied; contracts + tests.
  - **Blocked by**: users-schema, contracts-skeleton, auth-jwt
  - **Estimate**: 2-3h

- [ ] i18n (en/ru) + Carbon theme switch + preference sync
  - **ID**: i18n-theme-ui
  - **Tags**: frontend, i18n, theme, ui
  - **Details**: Multilingual UI; deploy-time default locale; in-app language + theme switch; load/save preferences; local cache for offline. SPEC §4, §8, §47–48, §50.
  - **Acceptance**: Both locales; theme toggle with Carbon tokens; `system` follows OS; preference survives reload and second browser when online.
  - **Blocked by**: web-shell-auth, user-preferences-api
  - **Estimate**: 4-6h

- [ ] IndexedDB local DB + repository layer
  - **ID**: indexeddb-repositories
  - **Tags**: frontend, offline
  - **Details**: IndexedDB; repositories for accounts/categories/transactions; UI must not touch IDB directly. SPEC §22–23, §47.
  - **Acceptance**: Domain data survives reload offline; repository API used by app layer; no finance domain solely in localStorage.
  - **Blocked by**: accounts-categories-ui, transactions-ui
  - **Estimate**: 4-6h

- [ ] Offline mutation queue
  - **ID**: offline-mutation-queue
  - **Tags**: frontend, offline, sync
  - **Details**: Mutations → local DB + queue with unique `operationId`; optimistic UI; Pending/Syncing/Synced/Failed. SPEC §24–25, §49.
  - **Acceptance**: Offline expense appears immediately and queues; reload preserves queue; status visible where relevant.
  - **Blocked by**: indexeddb-repositories
  - **Estimate**: 4-6h

- [ ] Sync API — push + pull with cursor and idempotency
  - **ID**: sync-api
  - **Tags**: backend, sync
  - **Details**: Push idempotent by `operationId`; pull after cursor/sequence; structured conflicts. SPEC §25–27, §30–34, §66.
  - **Acceptance**: Duplicate push is no-op; pull incremental; conflict payload includes versions; tests for duplicate and cursor.
  - **Blocked by**: transactions-transfer
  - **Estimate**: 6-8h

- [ ] Sync engine client (online/offline cycle)
  - **ID**: sync-engine-client
  - **Tags**: frontend, sync
  - **Details**: Detect connectivity; push; ack; pull; apply; update cursor; triggers: online, startup, visibility, manual, periodic. Expired JWT → AUTH_REQUIRED without wiping local data. SPEC §27, §35, §37.
  - **Acceptance**: Offline→online drains queue; remote changes appear; expired JWT blocks sync but local read works.
  - **Blocked by**: offline-mutation-queue, sync-api
  - **Estimate**: 6-8h

- [ ] Conflict handling UX + optimistic concurrency wiring
  - **ID**: sync-conflicts
  - **Tags**: sync, frontend, backend
  - **Details**: Surface SYNC_CONFLICT; no silent overwrite; client can reconcile. SPEC §28–30, §74.
  - **Acceptance**: Concurrent update on same account yields conflict; data preserved; regression test or reproducible script.
  - **Blocked by**: sync-engine-client
  - **Estimate**: 4-6h

- [ ] PWA installability + service worker app shell
  - **ID**: pwa-shell
  - **Tags**: frontend, pwa
  - **Details**: Installable PWA; SW caches app shell; offline startup; do not assume Background Sync API. SPEC §35.
  - **Acceptance**: Installability criteria met; app opens offline after first visit; shell loads without network.
  - **Blocked by**: web-shell-auth
  - **Estimate**: 3-4h

## P2 — Post-MVP features

<!-- After MVP income/expense + offline path is usable. -->

- [ ] Savings goals (API + UI)
  - **ID**: savings-goals
  - **Tags**: savings-goals, frontend, backend
  - **Details**: CRUD goals: name, target Money, current progress (explicit amount or linked account — one clear model), optional deadline, status, `createdBy`. Soft-delete if synced. SPEC §1, §19.
  - **Acceptance**: Create/update/complete goal; progress shown; decimal-safe; contracts + migration + basic UI; no Budget feature reinvented.
  - **Blocked by**: transactions-ui, money-currency-domain
  - **Estimate**: 1-2d

- [ ] Exchange rates model for historical-safe conversion
  - **ID**: exchange-rates
  - **Tags**: money, backend
  - **Details**: ExchangeRate with base/quote/rate/timestamp/source; do not rewrite history with latest rate implicitly. SPEC §13.
  - **Acceptance**: Conversion accepts rate timestamp/source; tests prove historical vs current separation.
  - **Blocked by**: money-currency-domain
  - **Estimate**: 1d

- [ ] Capital / report totals with conversion
  - **ID**: capital-analytics
  - **Tags**: analytics, money
  - **Details**: Totals in chosen report currency; never sum mixed currencies without conversion. SPEC §13, §18, §21.
  - **Acceptance**: Multi-currency fixture shows correct converted totals; UI via Carbon Charts where appropriate.
  - **Blocked by**: transactions-ui, exchange-rates
  - **Estimate**: 1-2d

- [ ] Income/expense analytics charts
  - **ID**: analytics-charts
  - **Tags**: analytics, frontend
  - **Details**: Month→income/expense; by-category; filters date/account/createdBy/category. SPEC §21. Carbon Charts.
  - **Acceptance**: Charts render for sample dataset; empty states handled.
  - **Blocked by**: capital-analytics
  - **Estimate**: 1d

- [ ] Debts / loans / installments / mortgages (domain + API + basic UI)
  - **ID**: debts-loans
  - **Tags**: debts
  - **Details**: Do not collapse distinct behaviors without need; principal, remaining, schedule, status. SPEC §20.
  - **Acceptance**: At least one obligation type fully CRUD + remaining/next payment; schema allows others.
  - **Blocked by**: accounts-api, money-currency-domain
  - **Estimate**: 2-3d

- [ ] Import + export (JSON/CSV) with validation preview
  - **ID**: import-export
  - **Tags**: import, export
  - **Details**: Validate before apply; preview/errors/duplicates; transactional import unless partial chosen. SPEC §44–45.
  - **Acceptance**: Round-trip on sample data; invalid file rejected with structured errors.
  - **Blocked by**: transactions-income-expense
  - **Estimate**: 2d

- [ ] Audit trail for financial mutations
  - **ID**: audit-trail
  - **Tags**: backend, audit
  - **Details**: Actor/entity/operation/before/after/timestamp for important changes. SPEC §53, §61.
  - **Acceptance**: Transaction create/update produces audit record with actor; no secrets logged.
  - **Blocked by**: transactions-income-expense
  - **Estimate**: 1d

## P3 — Polish / optional

- [ ] Category subcategories, icons, colors
  - **ID**: category-ux-extensions
  - **Tags**: categories, frontend
  - **Details**: SPEC §17 Post-MVP.
  - **Acceptance**: Subcategory create/list; icon/color persisted and shown.
  - **Blocked by**: categories-api
  - **Estimate**: 1d

- [ ] Background Sync API with fallbacks documented
  - **ID**: background-sync-optional
  - **Tags**: pwa, sync
  - **Details**: Use when available; keep online/startup/visibility/manual/periodic fallbacks. SPEC §35.
  - **Acceptance**: Feature detects support; unsupported browsers still sync via existing engine.
  - **Blocked by**: sync-engine-client, pwa-shell
  - **Estimate**: 4h

- [ ] Admin UI to create users (optional; DB seed remains valid)
  - **ID**: admin-user-ui
  - **Tags**: auth, frontend
  - **Details**: SPEC §8 — public registration still not required.
  - **Acceptance**: Authorized admin can create user from UI; password hashed server-side.
  - **Blocked by**: auth-jwt, web-shell-auth
  - **Estimate**: 4h
