# Tasks

<!-- Balance implementation queue. Companion to AGENTS.md (how) and docs/requirements/SPEC.md (spec).
     Spec: https://github.com/tasksmd/tasks.md
     policy: Work one unblocked task at a time; claim with (@agent-id) on the task line.
     policy: Before coding, read AGENTS.md and the SPEC sections named in Details.
     policy: Work feature by feature: that feature’s contracts + backend, then its frontend, then the next feature. Do not batch all backend before any frontend. Do not start a feature’s UI until that feature’s contract and API exist. Migrations for all schema changes.
     policy: Desktop-first for MVP (Carbon lg+). Mobile/tablet layout is Post-MVP — decide after MVP; do not spend MVP time on a phone layout.
     policy: No floating-point money. Idempotent mutations. Soft-delete synced entities.
     policy: Mark Acceptance met before checking the box. Prefer deleting completed tasks on merge.
     policy: P1 = MVP income/expense (online, desktop). P2/P3 = Post-MVP. Do not start P2 until MVP path is usable.
     policy: Post-MVP platform order (P2): PWA → Offline-first, then feature work. Mobile/tablet layout stays in P3. -->

## P0

<!-- Empty while greenfield: nothing production-broken yet. Promote blockers here when the app runs. -->

## P1 — MVP (income / expense, online desktop)

<!-- policy: Implement in listed order. Do not skip ahead past Blocked by.
     policy: Each subsection is one feature: BE (contracts + API) then FE for that feature, then the next subsection.
     Goal: one financial space, 1–n users; log in, manage accounts/categories, record income/expense/transfer with attribution.
     Online + desktop shell only. No offline/sync, PWA, mobile layout, budgets, analytics charts, debts, savings goals, or per-user spaces here. -->

### Foundation

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

- [x] Shared `libs/contracts` package skeleton
  - **ID**: contracts-skeleton
  - **Tags**: contracts
  - **Details**: Workspace TS library; MVP folders only: auth, users, accounts, transactions, categories, currencies, sync, common errors/pagination. No budgets/debts/analytics stubs. SPEC §1, §6, §65.
  - **Acceptance**: Both `api` and `web` can import from contracts; empty/placeholder types compile; Nx boundary enforced.
  - **Blocked by**: scaffold-nx-monorepo
  - **Estimate**: 1-2h

- [x] Money + currency domain primitives
  - **ID**: money-currency-domain
  - **Tags**: domain, money
  - **Details**: Decimal-safe `Money` (`amount: string` + currency); RUB/USD/EUR; precision helpers; unit tests. Never use JS number for arithmetic. SPEC §11–12.
  - **Acceptance**: Unit tests cover add/subtract/compare and reject unsafe number usage paths; contracts export Money/CurrencyCode types.
  - **Blocked by**: contracts-skeleton
  - **Estimate**: 2-3h

### Auth

- [x] Users schema + admin seed (no public registration)
  - **ID**: users-schema
  - **Tags**: backend, auth, database
  - **Details**: User entity with password hash fields, `defaultCurrency`; migration; seed/admin path to create users in DB only. SPEC §8, §40, §67.
  - **Acceptance**: Migration applies cleanly; user can be inserted via seed/script; plaintext passwords never stored.
  - **Blocked by**: docker-postgres, money-currency-domain
  - **Estimate**: 2h

- [x] JWT authentication API (login, validate, identity)
  - **ID**: auth-jwt
  - **Tags**: backend, auth
  - **Details**: Login endpoint; access token; guards; Argon2 or bcrypt; JWT payload without sensitive data; structured errors. Contracts for auth request/response. SPEC §8, §36–39.
  - **Acceptance**: Login returns JWT; protected route rejects unauthenticated; passwords hashed; contract types used end-to-end; basic tests.
  - **Blocked by**: users-schema, contracts-skeleton
  - **Estimate**: 3-4h

- [x] Web app shell — Carbon, routing, login, JWT storage
  - **ID**: web-shell-auth
  - **Tags**: frontend, auth, ui
  - **Details**: Desktop-first shell (Carbon `lg+`, SideNav + header); login page; authenticated layout; token storage per SPEC XSS model. Do not build a mobile/bottom-nav layout. SPEC §4, §37–38, §50.
  - **Acceptance**: User can log in against API; protected routes redirect; Carbon desktop chrome; wide viewport is the acceptance surface.
  - **Blocked by**: auth-jwt, scaffold-nx-monorepo
  - **Estimate**: 3-4h

### Preferences

- [x] User preferences API — locale + theme
  - **ID**: user-preferences-api
  - **Tags**: backend, users, preferences
  - **Details**: Persist `locale` (`en`|`ru`) and `theme` (`light`|`dark`|`system`, default `system`); GET/PUT (or PATCH) `/users/me/preferences`; contracts; migration; owner-only. SPEC §6, §8, §40, §56.
  - **Acceptance**: Authenticated user read/update preferences; defaults when missing; unauthorized denied; contracts + tests.
  - **Blocked by**: users-schema, contracts-skeleton, auth-jwt
  - **Estimate**: 2-3h

- [x] i18n (en/ru) + Carbon theme switch + preference sync
  - **ID**: i18n-theme-ui
  - **Tags**: frontend, i18n, theme, ui
  - **Details**: Multilingual UI; deploy-time default locale; in-app language + theme switch; load/save preferences via the preferences API. SPEC §4, §8, §47–48, §50.
  - **Acceptance**: Both locales; theme toggle with Carbon tokens; `system` follows OS; preference survives reload and second browser when online.
  - **Blocked by**: web-shell-auth, user-preferences-api
  - **Estimate**: 4-6h

### Accounts

- [ ] Accounts domain + API
  - **ID**: accounts-api
  - **Tags**: backend, accounts
  - **Details**: Account CRUD with explicit currency, `version`, soft delete; one app space; any authenticated user may CRUD any account (no owner / membership). Users may create separate accounts and agree among themselves who uses which. SPEC §9–10, §28, §32, §39.
  - **Acceptance**: Authenticated user CRUD accounts; currency required; version bumps on update; unauthenticated denied; contracts + migration + tests.
  - **Blocked by**: auth-jwt, money-currency-domain
  - **Estimate**: 4h

- [ ] Accounts UI (online CRUD)
  - **ID**: accounts-ui
  - **Tags**: frontend, accounts
  - **Details**: List/create/edit accounts using the accounts API/contracts; money/currency inputs without float; show per-account balance. No account owner/membership UI. Desktop tables/forms. SPEC §9–10, §18, §51.
  - **Acceptance**: Full CRUD online against contracts; currency + balance shown; empty/loading/error; usable on a wide viewport.
  - **Blocked by**: web-shell-auth, accounts-api
  - **Estimate**: 2h

### Categories

- [ ] Categories API (income + expense)
  - **ID**: categories-api
  - **Tags**: backend, categories
  - **Details**: Separate income/expense categories; CRUD; soft delete; contracts. No subcategory/icon schema in MVP. SPEC §17.
  - **Acceptance**: CRUD works; type separation enforced; authz; tests.
  - **Blocked by**: auth-jwt
  - **Estimate**: 2-3h

- [ ] Categories UI (online CRUD)
  - **ID**: categories-ui
  - **Tags**: frontend, categories
  - **Details**: List/create/edit income and expense categories using the categories API/contracts. Desktop tables/forms. SPEC §17, §51.
  - **Acceptance**: Full CRUD online against contracts; type separation visible; empty/loading/error; usable on a wide viewport.
  - **Blocked by**: web-shell-auth, categories-api
  - **Estimate**: 2h

### Transactions

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

- [ ] Transactions UI — income, expense, transfer + visibility filters
  - **ID**: transactions-ui
  - **Tags**: frontend, transactions
  - **Details**: Create/list transactions against existing APIs/contracts; transfer flow; decimal money input; dates; show `createdBy`; filter all / me / selected users. Desktop tables/forms. SPEC §9, §14–16, §46, §51–52.
  - **Acceptance**: Record income/expense/transfer; lists paginate; amounts correct; attribution + filters work; usable on a wide viewport.
  - **Blocked by**: accounts-ui, categories-ui, transactions-transfer
  - **Estimate**: 4-6h

## P2 — Post-MVP

<!-- After MVP income/expense (online desktop) path is usable.
     policy: Platform order first — PWA → Offline-first — then feature work below.
     policy: Same as P1 — each feature is API then UI. Do not start the UI task until that feature’s API task is done. -->

### PWA

- [ ] PWA installability + service worker app shell
  - **ID**: pwa-shell
  - **Tags**: frontend, pwa
  - **Details**: Installable PWA (including desktop); SW caches app shell; offline startup of the shell; do not assume Background Sync API. PWA does not imply a mobile layout. SPEC §35, §50.
  - **Acceptance**: Installability criteria met; app opens offline after first visit; shell loads without network.
  - **Blocked by**: web-shell-auth
  - **Estimate**: 3-4h

### Offline-first

- [ ] Sync API — push + pull with cursor and idempotency
  - **ID**: sync-api
  - **Tags**: backend, sync
  - **Details**: Push idempotent by `operationId`; pull after cursor/sequence; structured conflicts. SPEC §25–27, §30–34, §66.
  - **Acceptance**: Duplicate push is no-op; pull incremental; conflict payload includes versions; tests for duplicate and cursor.
  - **Blocked by**: transactions-transfer
  - **Estimate**: 6-8h

- [ ] IndexedDB local DB + repository layer
  - **ID**: indexeddb-repositories
  - **Tags**: frontend, offline
  - **Details**: IndexedDB; repositories for accounts/categories/transactions; UI must not touch IDB directly. SPEC §22–23, §47.
  - **Acceptance**: Domain data survives reload offline; repository API used by app layer; no finance domain solely in localStorage.
  - **Blocked by**: accounts-ui, categories-ui, transactions-ui, pwa-shell
  - **Estimate**: 4-6h

- [ ] Offline mutation queue
  - **ID**: offline-mutation-queue
  - **Tags**: frontend, offline, sync
  - **Details**: Mutations → local DB + queue with unique `operationId`; optimistic UI; Pending/Syncing/Synced/Failed. SPEC §24–25, §49.
  - **Acceptance**: Offline expense appears immediately and queues; reload preserves queue; status visible where relevant.
  - **Blocked by**: indexeddb-repositories
  - **Estimate**: 4-6h

- [ ] Sync engine client (online/offline cycle)
  - **ID**: sync-engine-client
  - **Tags**: frontend, sync
  - **Details**: Detect connectivity; push; ack; pull; apply; update cursor; triggers: online, startup, visibility, manual, periodic. Expired JWT → AUTH_REQUIRED without wiping local data. Built against the sync API contract. SPEC §27, §35, §37.
  - **Acceptance**: Offline→online drains queue; remote changes appear; expired JWT blocks sync but local read works.
  - **Blocked by**: offline-mutation-queue, sync-api
  - **Estimate**: 6-8h

- [ ] Conflict handling UX + optimistic concurrency wiring
  - **ID**: sync-conflicts
  - **Tags**: sync, frontend
  - **Details**: Surface SYNC_CONFLICT from the sync API; no silent overwrite; client can reconcile. SPEC §28–30, §74.
  - **Acceptance**: Concurrent update on same account yields conflict; data preserved; regression test or reproducible script.
  - **Blocked by**: sync-engine-client
  - **Estimate**: 4-6h

### Features

- [ ] Server-managed currency catalog
  - **ID**: currency-catalog-api
  - **Tags**: money, currencies, backend
  - **Details**: Replace the MVP’s compile-time currency registry with a database-backed catalog and read API so supported ISO currencies can be added without a client release. Persist code, precision, display metadata, and active status; cache the catalog on clients for offline validation. A currency’s precision must become immutable once money in that currency exists—do not reinterpret historical amounts by editing it. Define a restricted management path before allowing catalog mutations. Contracts + migration + tests.
  - **Acceptance**: Client can fetch/cache active currencies; a new supported currency is usable after server update; precision changes for a referenced currency are rejected; existing amounts remain correctly interpreted.
  - **Blocked by**: accounts-api, sync-engine-client
  - **Estimate**: 1-2d

- [ ] Savings goals API
  - **ID**: savings-goals-api
  - **Tags**: backend, savings-goals
  - **Details**: CRUD goals: name, target Money, current progress (explicit amount or linked account — one clear model), optional deadline, status, `createdBy`. Soft-delete if synced. Contracts + migration. SPEC §1, §19.
  - **Acceptance**: Create/update/complete goal via API; decimal-safe; contracts + migration + tests; no Budget feature reinvented.
  - **Blocked by**: money-currency-domain, accounts-api
  - **Estimate**: 1d

- [ ] Savings goals UI
  - **ID**: savings-goals-ui
  - **Tags**: frontend, savings-goals
  - **Details**: Desktop UI against the savings-goals API/contracts. SPEC §1, §19, §50.
  - **Acceptance**: Create/update/complete goal in UI; progress shown; empty/loading/error; wide viewport.
  - **Blocked by**: savings-goals-api, web-shell-auth
  - **Estimate**: 1d

- [ ] Exchange rates model for historical-safe conversion
  - **ID**: exchange-rates
  - **Tags**: money, backend
  - **Details**: ExchangeRate with base/quote/rate/timestamp/source; do not rewrite history with latest rate implicitly. SPEC §13.
  - **Acceptance**: Conversion accepts rate timestamp/source; tests prove historical vs current separation.
  - **Blocked by**: money-currency-domain
  - **Estimate**: 1d

- [ ] Capital / report totals API with conversion
  - **ID**: capital-analytics-api
  - **Tags**: analytics, money, backend
  - **Details**: Totals in chosen report currency; never sum mixed currencies without conversion. Contracts + API. SPEC §13, §18, §21.
  - **Acceptance**: Multi-currency fixture shows correct converted totals; contracts + tests.
  - **Blocked by**: transactions-income-expense, exchange-rates
  - **Estimate**: 1d

- [ ] Income/expense analytics charts
  - **ID**: analytics-charts
  - **Tags**: analytics, frontend
  - **Details**: Month→income/expense; by-category; filters date/account/createdBy/category. Built against capital/analytics contracts. SPEC §21. Carbon Charts. Desktop-first.
  - **Acceptance**: Charts render for sample dataset; empty states handled; wide viewport.
  - **Blocked by**: capital-analytics-api, web-shell-auth
  - **Estimate**: 1d

- [ ] Debts / loans / installments / mortgages API
  - **ID**: debts-loans-api
  - **Tags**: backend, debts
  - **Details**: Do not collapse distinct behaviors without need; principal, remaining, schedule, status. Contracts + migration. SPEC §20.
  - **Acceptance**: At least one obligation type fully CRUD + remaining/next payment via API; schema allows others; tests.
  - **Blocked by**: accounts-api, money-currency-domain
  - **Estimate**: 1-2d

- [ ] Debts / loans basic UI
  - **ID**: debts-loans-ui
  - **Tags**: frontend, debts
  - **Details**: Desktop UI against the debts API/contracts. SPEC §20, §50.
  - **Acceptance**: CRUD + remaining/next payment in UI; empty/loading/error; wide viewport.
  - **Blocked by**: debts-loans-api, web-shell-auth
  - **Estimate**: 1d

- [ ] Import + export API (JSON/CSV) with validation preview
  - **ID**: import-export-api
  - **Tags**: backend, import, export
  - **Details**: Validate before apply; preview/errors/duplicates; transactional import unless partial chosen. Contracts. SPEC §44–45.
  - **Acceptance**: Round-trip on sample data via API; invalid file rejected with structured errors; tests.
  - **Blocked by**: transactions-income-expense
  - **Estimate**: 1d

- [ ] Import + export UI
  - **ID**: import-export-ui
  - **Tags**: frontend, import, export
  - **Details**: Desktop UI against the import/export API/contracts; preview before apply. SPEC §44–45, §50.
  - **Acceptance**: Round-trip from UI on sample data; structured errors shown; wide viewport.
  - **Blocked by**: import-export-api, web-shell-auth
  - **Estimate**: 1d

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
  - **Details**: SPEC §17 Post-MVP. Requires category API to already expose (or be extended with) the fields — extend contracts + backend first if missing, then UI.
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
  - **Details**: SPEC §8 — public registration still not required. Use existing auth/user contracts; extend backend first if an admin-create endpoint is missing.
  - **Acceptance**: Authorized admin can create user from UI; password hashed server-side.
  - **Blocked by**: auth-jwt, web-shell-auth
  - **Estimate**: 4h

- [ ] Mobile / tablet layout (decision after MVP)
  - **ID**: mobile-layout
  - **Tags**: frontend, ui
  - **Details**: Not in MVP. After the desktop product is usable, decide whether to add a first-class narrow-viewport layout (navigation, forms, tables). SPEC §4, §50.
  - **Acceptance**: Decision recorded; if building, usable layout at `sm`/`md` without regressing desktop.
  - **Blocked by**: web-shell-auth, transactions-ui
  - **Estimate**: TBD after MVP

- [ ] Multiple financial spaces / personal vs shared partitions (undecided)
  - **ID**: multi-space-undecided
  - **Tags**: product, authz
  - **Details**: Not in MVP. After the single-space product is usable, decide whether more than one financial space (or enforced personal vs shared partitions, `AccountMember`, etc.) is needed. **No decision yet; this may never be built.** Do not design schema or APIs until a product decision exists. SPEC §9.
  - **Acceptance**: Written product decision (build / skip). If skip — no code. If build — new tasks with a real model; not this placeholder.
  - **Blocked by**: accounts-ui, transactions-ui
  - **Estimate**: TBD after MVP
