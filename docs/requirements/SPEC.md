# Balance — Product & Architecture Spec

Full functional and technical specification of the application.
Agent operating rules live in the root [`AGENTS.md`](../../AGENTS.md). Work queue lives in [`TASKS.md`](../../TASKS.md).

---

## 1. Product Scope

Build in this order: **MVP first** (usable income/expense tracking), then **Post-MVP** features. Do not implement Post-MVP domains “just in case” during MVP.

### MVP — income / expense tracking

Minimum product that is useful day to day:

```text
Multi-user login (JWT; users via admin/DB seed)
Accounts (explicit currency per account)
Income / expense categories
Income, expense, transfer
createdBy attribution + filters (all / me / selected users)
Per-account balances (no naive cross-currency sums)
Offline-first local data + mutation queue + sync
Conflict handling for concurrent edits
PWA app shell (install / offline startup)
i18n (en, ru) + theme preferences (light / dark / system)
Decimal-safe Money end-to-end
```

### Post-MVP — after MVP works

```text
Savings goals (цели накоплений)
Exchange rates + converted capital / report totals
Analytics charts (income/expense over time, by category)
Debts / loans / installments / mortgages
Import / export (JSON/CSV)
Audit trail storage beyond sync logs
Category subcategories / icons / colors
Admin UI to create users
Background Sync API (optional enhancement)
```

### Explicitly out of scope (do not build)

```text
Budgets / spending limits as a product feature
Personal vs shared finance split
AccountMember / shared-account roles
```

Sections below that describe Post-MVP features are requirements for later work, not MVP delivery criteria. Architecture must not block them, but must not add unused tables, APIs, or abstractions ahead of time.

---

## 2. Core Principles

The application must follow these principles:

- Offline-first.
- Mobile-first.
- API contract-first.
- Type-safe communication between FE and BE.
- Domain-driven design without unnecessary complexity.
- Modular architecture.
- Explicit state transitions.
- Deterministic synchronization.
- No floating-point arithmetic for monetary values.
- Idempotent API operations.
- Optimistic UI.
- Eventual consistency for offline synchronization.
- Server is the authoritative source for final state.
- Client must be able to work without a network.
- All financial operations must be audit-friendly.
- Multilingual UI (i18n) with persisted user locale preference.
- Theme support (light / dark / system) compatible with Carbon Design themes, persisted as a user preference.

---

## 3. Technology Stack

### Monorepo

Use Nx.

Expected structure:

```text
apps/
  web/          # React shell; env via .env / Vite (VITE_*), no secrets
  api/          # NestJS shell; env via .env + ConfigModule (DB, JWT, …)

libs/
  contracts/    # Shared FE↔BE TypeScript contracts (wire types)
  domain/       # Pure domain primitives and rules (Money, …)
  # later as needed: sync/, ui/, database ports, feature libs
```

Environment configuration (secrets, URLs, ports, connection strings) lives **inside the corresponding app** (`.env` / `.env.example`), not in a shared `libs/`. Stable protocol constants (`schemaVersion`, sync versions, error shapes) live in `libs/contracts` (or `libs/domain` for business constants), not in env.

Adapt the actual structure to the existing repository. Do not create a shared `libs/config` that mixes FE and BE.

---

## 4. Frontend

Use:

- React
- TypeScript
- Carbon Design System (`@carbon/react`)
- Carbon MCP
- PWA
- Service Worker
- IndexedDB
- i18n (at least `en` and `ru`)
- Carbon Charts (Post-MVP analytics; do not pull in for MVP lists/forms alone)

### Styling

Carbon v11 ships styles via **SCSS**. This is the required path for Carbon, not a parallel CSS-in-JS system.

Style stack:

- **SCSS** (`sass` package) for Carbon and app-level styles;
- Carbon wiring: `@use '@carbon/react';` (or targeted `@use '@carbon/react/scss/...'`);
- for local component styles — **CSS Modules** with `.module.scss`;
- take tokens/spacing/theme from Carbon SCSS modules; do not hand-duplicate them;
- do not introduce styled-components / Emotion / Tailwind as the primary approach (conflicts with Carbon SCSS and adds needless complexity).

Frontend must be mobile-first.

Do not build a custom UI system when Carbon already provides the needed component.

Before creating a new UI component:

1. Check Carbon Design System.
2. Check existing project components.
3. Check Carbon MCP.
4. For Post-MVP charts, use Carbon Charts.

### Internationalization (i18n)

The frontend must ship a multilingual interface.

Minimum supported locales:

```text
en
ru
```

Requirements:

- Both locales are first-class and available in the product from day one.
- **Deploy-time default locale**: each deployment configures the default UI language (e.g. via app env such as `VITE_DEFAULT_LOCALE` / equivalent). That value is the initial language for first visit / before a user preference is known.
- **In-app language switch**: the user can change language through the UI at any time after load.
- All user-visible strings (UI chrome, forms, errors shown to users, empty states) go through the i18n layer — no hard-coded copy for one language only.
- Locale formatting for dates/numbers in the UI must respect the active locale; storage formats remain ISO / decimal-safe as elsewhere in this spec.
- Architecture must allow adding more locales later without rewriting features.

Persistence of the chosen language is defined under **User Preferences** (§8): the preference is stored on the backend so it survives sessions and browsers. Locally cache the last known preference so the UI can render correctly offline after the first successful load/sync of preferences.

### Theming (light / dark / system)

The application must support:

```text
light
dark
system
```

Requirements:

- Default theme preference is **`system`** (follow the OS / browser `prefers-color-scheme`).
- The user can switch theme through the UI among `light`, `dark`, and `system`.
- Implementation must be **compatible with Carbon Design themes** (Carbon theme tokens / theme packages such as white / g10 / g90 / g100 as appropriate). Do not invent a parallel color system that fights Carbon tokens.
- When preference is `system`, map OS light → Carbon light theme and OS dark → Carbon dark theme; react to OS theme changes while `system` remains selected.
- Prefer Carbon theme SCSS modules and documented theme switching patterns over ad-hoc CSS variables that diverge from Carbon.

Persistence of the chosen theme is defined under **User Preferences** (§8): stored on the backend for cross-session and cross-browser continuity, with a local cache for offline/first paint after preferences are known.

---

## 5. Backend

Use:

- NestJS
- PostgreSQL
- Docker
- JWT Authentication

When needed, the following are allowed:

- Redis;
- background jobs;
- queues;
- caching;
- WebSocket/SSE;
- database locking;
- optimistic concurrency control.

But additional technologies must not be added without necessity.

For every new infrastructure dependency, first evaluate:

- why it is needed;
- whether PostgreSQL/NestJS alone can solve the problem;
- how much it complicates deployment;
- whether it affects offline synchronization.

---

## 6. Shared TypeScript Contracts

Frontend and Backend must use shared TypeScript contracts.

Do not manually duplicate DTOs between FE and BE.

For example:

```text
libs/contracts/
  auth/
  users/
  accounts/
  transactions/
  categories/
  currencies/
  sync/
  # Post-MVP as needed: savings-goals/, debts/, analytics/, import-export/
```

Include contracts for user preferences (locale, theme) under `users/` (or a dedicated `preferences/` module) so FE and BE share the same types.

Contracts must describe:

- request;
- response;
- pagination;
- errors;
- synchronization payloads;
- entity identifiers;
- versions;
- timestamps;
- currency information;
- user preferences (locale, theme).

Backend DTOs must be compatible with the shared contract.

Frontend API clients must also use the shared contract.

---

## 7. Domain Model

### MVP entities

```text
User
UserPreferences
Account
Transaction
Category
Currency
SyncOperation
SyncCursor
```

### Post-MVP entities (add when the feature is built)

```text
SavingsGoal
ExchangeRate
Debt / Loan / Installment / Mortgage (as needed)
AuditEvent (if beyond sync/ops logs)
```

Do not create Post-MVP tables or contracts during MVP.

`UserPreferences` holds per-user UI settings that must follow the user across devices (at minimum locale and theme). See §8.

---

## 8. Users

Public registration via UI is not required.

Users are created only through an admin interface / directly in the DB.

Authentication:

```text
JWT
```

Backend must support:

- login;
- access token;
- token validation;
- user identity;
- authorization.

Never store passwords in plaintext.

Use a modern password hashing algorithm, e.g. Argon2 or bcrypt.

JWT payload must not contain sensitive data.

### User Preferences

Each user has preferences persisted on the **backend** (PostgreSQL), not only in browser storage.

Minimum fields:

```text
locale: 'en' | 'ru'   # extensible enum / code
theme:  'light' | 'dark' | 'system'
```

Defaults when no preference row exists yet:

```text
locale → deploy-time default locale of the web app
theme  → system
```

Requirements:

- Preferences must survive logout/login, new sessions, and different browsers/devices for the same user.
- Authenticated clients load preferences from the API after login (and may refresh on app start when online).
- Changing language or theme in the UI updates the preference on the backend (idempotent mutation; local optimistic update allowed).
- Cache the last known preferences in local persistence (e.g. IndexedDB or equivalent app storage) so offline sessions keep the user’s language and theme after they were once loaded. Backend remains authoritative when online.
- Preferences are personal to the user account (not financial domain data); only the owning user may read/update their preferences.
- Do not treat `localStorage`-only preferences as sufficient for cross-browser continuity.

Suggested API shape (names may vary):

```text
GET  /users/me/preferences
PUT  /users/me/preferences   # or PATCH
```

Contracts must define request/response types for these operations.

---

## 9. Multi-user Attribution and Visibility

The application is a single financial space used by **N authenticated users** (household / small team). There is **no** separate “personal vs shared finances” product model: no Shared Accounts, no `AccountMember` roles.

### Attribution

Every financial mutation must record who performed it. At minimum, transactions carry:

```text
createdBy
```

When useful, also:

```text
updatedBy
```

UI and reports must be able to show which user added or wrote off money.

### Visibility filters (operations)

Users must be able to filter the operation list (and Post-MVP analytics where it applies) by actor:

```text
All users
Only me
Selected users (multi-select)
```

Filtering changes **what is shown**, not who owns the underlying accounts. Accounts, categories, and balances belong to the common app space; attribution lives on operations.

### Authorization (MVP)

Any authenticated user of the app may read and mutate financial data in that space (subject to normal auth + optimistic concurrency). Preferences remain per-user (`/users/me/...`).

Do **not** introduce account-level membership/roles unless a later product decision requires them.

---

## 10. Financial Accounts

An Account represents a place where money is held.

Examples:

```text
Cash
Bank Account
Credit Card
Savings Account
Investment Account
```

Each account has its own currency.

For example:

```text
Account A → RUB
Account B → USD
Account C → EUR
```

Do not assume all accounts use one currency.

---

## 11. Money Representation

Critically important:

### Never use JavaScript Number for monetary calculations

Do not:

```typescript
const balance = 0.1 + 0.2;
```

for financial calculations.

Use a decimal/numeric representation.

In PostgreSQL:

```sql
NUMERIC(...)
```

or integer minor units if that matches the chosen model.

Prefer a single Money abstraction.

For example:

```typescript
type Money = {
  amount: string;
  currency: CurrencyCode;
};
```

`amount` must be decimal-safe.

---

## 12. Currency

Support at least:

```text
RUB
USD
EUR
```

But the architecture must allow adding other currencies.

A user must have:

```text
defaultCurrency
```

When creating a new account, the default currency may come from the user setting.

Account currency is always an explicit property of the account.

Do not use the user’s default currency for existing accounts.

---

## 13. Currency Conversion

Do not conflate:

```text
account currency
user default currency
report currency
```

These are different concepts.

For example:

```text
Account: USD
User default currency: RUB
Report currency: RUB
```

Cross-currency report totals and analytics (Post-MVP) require conversion. MVP only needs per-account balances in each account’s own currency.

If exchange rates are used (Post-MVP):

```text
ExchangeRate
```

must have:

```text
baseCurrency
quoteCurrency
rate
timestamp
source
```

Historical financial operations must not be recalculated with the current exchange rate without an explicit choice.

---

## 14. Transactions

Core operations:

```text
Income
Expense
Transfer
```

Do not model a transfer as a plain expense.

For example:

```text
USD Account
      ↓ transfer
Savings Account
```

must not reduce total capital.

A transfer must create a linked operation between accounts or have a dedicated domain model.

---

## 15. Income

Income must contain at least:

```text
id
accountId
categoryId
amount
currency
date
description
createdAt
updatedAt
createdBy
```

Examples:

```text
Salary
Freelance
Bonus
Investment Income
Other
```

---

## 16. Expense

Expense must contain:

```text
id
accountId
categoryId
amount
currency
date
description
createdAt
updatedAt
createdBy
```

---

## 17. Categories

Users must be able to create categories.

Support at least:

```text
Expense categories
Income categories
```

Do not mix them without need.

For example:

```text
Expense:
  Food
  Transport
  Rent
  Entertainment

Income:
  Salary
  Freelance
  Investment
```

Architecture may later add (Post-MVP only):

- subcategories;
- category icons/colors.

Do not add schema for these in MVP.

---

## 18. Account Balances (MVP)

MVP must show balances **per account** (and thus per that account’s currency).

Do not compute a single “total capital” by adding amounts in different currencies.

```text
10 000 RUB + 1 000 USD ≠ 11 000
```

Cross-currency totals and charts are Post-MVP (§21) and require an explicit report currency plus conversion (§13).

---

## 19. Savings Goals (Post-MVP)

Цели накоплений: user-defined targets to save toward (e.g. vacation, emergency fund).

Minimum fields:

```text
id
name
targetAmount + currency
currentAmount (or linked account balance contribution — pick one clear model)
deadline (optional)
status (active / completed / cancelled)
createdBy
createdAt
updatedAt
version
deletedAt
```

Requirements when built:

- CRUD in the common app financial space (same multi-user authz as §9).
- Progress visible (current vs target; percent or remaining).
- Money fields decimal-safe; currency explicit.
- Soft-delete / sync rules if the entity is synced offline.
- Do not invent a Budget / spending-limit product on top of goals.

Out of scope for v1 of goals: automatic transfers, complex funding rules, multi-currency goal aggregation without conversion.

---

## 20. Debts and Obligations (Post-MVP)

Not required for MVP income/expense tracking.

When built, support financial obligations as needed:

```text
Debt
Loan
Installment
Mortgage
Credit
```

Do not merge types into one table only to reduce count if domain behavior differs. Shared fields may be abstracted; concrete types keep their own fields.

Typical data: principal, remaining, interest, schedule, next payment, currency, status.

---

## 21. Analytics and Capital Charts (Post-MVP)

Not required for MVP. MVP lists and per-account balances are enough.

When built (Carbon Charts):

```text
Income over time (e.g. month → income)
Expenses over time
Expenses by category
Income by category
Capital / totals over time in a chosen report currency
```

Filters: date range, account, createdBy visibility (§9), category, currency.

Never sum mixed currencies without conversion (§13).

---

## 22. Offline-first

Offline-first is a fundamental architectural requirement.

The application must remain functional without a network.

The user must be able to:

```text
view data
create transaction
edit transaction
delete transaction
create account
edit account
create category
edit category
```

without an Internet connection.

Locale and theme from cached user preferences must continue to apply offline (see §4, §8). Preference updates made offline may be queued and synced when online, consistent with the offline mutation model, or applied when connectivity returns — choose one clear approach and document it in contracts; do not lose the user’s last chosen locale/theme.

---

## 23. Local Database

Use IndexedDB for persistent local state.

Do not use only:

```text
localStorage
```

for financial domain data.

Prefer an abstraction:

```text
Repository
```

for example:

```text
AccountRepository
TransactionRepository
CategoryRepository
SyncRepository
```

UI must not talk to IndexedDB directly.

User preferences may be cached in the same local persistence layer (or a small dedicated store) for offline continuity; financial domain data still must not live only in `localStorage`.

---

## 24. Offline Mutation Queue

All mutations must enter a local queue.

For example:

```text
User creates expense

UI
 ↓
Local DB
 ↓
Mutation Queue
 ↓
Sync Engine
 ↓
API
```

If there is no network:

```text
Local DB
   ↓
Mutation Queue
   ↓
WAITING
```

After connectivity returns:

```text
WAITING
 ↓
SYNCING
 ↓
SERVER
 ↓
ACK
 ↓
COMPLETED
```

---

## 25. Sync Operation

Every mutation must have a unique identifier.

For example:

```text
operationId
```

It is used for idempotency.

Backend must be able to detect:

```text
operation already processed
```

and must not apply the same mutation twice.

---

## 26. Synchronization

The system must support:

```text
Push local changes
Pull remote changes
```

For example:

```text
POST /sync/push
GET  /sync/pull
```

or an equivalent API.

Do not hard-wire the architecture to these exact endpoint names.

---

## 27. Sync Algorithm

Base cycle:

```text
1. Detect network availability
2. Push pending local operations
3. Receive server acknowledgements
4. Pull remote changes
5. Apply remote changes locally
6. Resolve conflicts
7. Update sync cursor
8. Repeat
```

After connectivity returns, pending operations must be sent automatically.

---

## 28. Conflict Resolution

Especially important when multiple authenticated users edit the same entity concurrently.

Scenario:

```text
User A:
balance/account updated

User B:
same account updated
```

Do not simply use:

```text
last write wins
```

for all domain operations.

For mutable entities use optimistic concurrency.

For example:

```text
version
```

or:

```text
updatedAt
```

But `version` is preferred.

Example:

```text
Account version = 12
```

Client sends:

```text
expectedVersion = 12
```

Server accepts the change only if the current version is still:

```text
12
```

After the change:

```text
version = 13
```

On conflict:

```text
409 Conflict
```

with information the client needs for resolution.

---

## 29. Financial Transactions and Conflicts

For financial transactions prefer immutable operations.

Instead of:

```text
edit transaction amount
```

prefer a domain operation where possible:

```text
original transaction
correction/reversal
new transaction
```

This reduces the risk of losing financial data under concurrent edits.

If editing a transaction is necessary:

- use optimistic concurrency;
- keep a version;
- do not allow silent overwrite.

---

## 30. Server Authority

During synchronization:

```text
Client = optimistic state
Server = authoritative state
```

But the server must not simply destroy local changes.

On conflict the client must receive explicit conflict information.

For example:

```text
SYNC_CONFLICT
```

with:

```text
entity
entityId
localVersion
serverVersion
serverState
```

---

## 31. Idempotency

All mutation APIs must be idempotent.

For example:

```text
operationId = abc123
```

If the client sends:

```text
abc123
```

several times:

```text
POST
POST
POST
```

the result must be applied only once.

This is critical for offline-first.

---

## 32. Deletions

Do not use physical deletion of entities if that can break synchronization.

For synchronized entities prefer tombstones:

```text
deletedAt
```

or a dedicated deletion event.

Otherwise an offline client may never learn that another user deleted the entity.

---

## 33. Timestamps

For distributed synchronization distinguish:

```text
createdAt
updatedAt
deletedAt
serverTimestamp
clientTimestamp
```

Do not trust client timestamps for server ordering.

For ordering changes use a server-generated sequence/version.

---

## 34. Sync Cursor

The client must have a sync cursor.

For example:

```text
lastSyncSequence
```

Backend must have a monotonic mechanism for ordering changes.

For example:

```text
changeSequence
```

This lets the client request:

```text
all changes after sequence N
```

and avoid downloading the entire database after every reconnect.

---

## 35. PWA

The application must be a full PWA.

Must support:

- installability;
- service worker;
- application shell caching;
- IndexedDB;
- offline application startup;
- background synchronization where the browser allows it;
- network recovery.

Do not assume Background Sync API is available in every browser.

The sync engine must have fallbacks:

```text
online event
app startup
visibilitychange
manual retry
periodic retry
```

---

## 36. API Error Handling

Use structured errors.

For example:

```typescript
{
  code: "ACCOUNT_VERSION_CONFLICT",
  message: "...",
  details: {}
}
```

Do not parse plain text error messages.

Frontend must work with typed errors.

User-facing error `message` strings shown in the UI should be mapped via i18n (error `code` is the stable contract; localized text is a presentation concern).

---

## 37. Authentication and Offline

JWT authentication must be compatible with offline mode.

If the user is already authenticated:

```text
offline → application remains usable
```

Do not require a network request to display local data.

When the JWT expires:

```text
local data remains accessible
```

but synchronization must enter:

```text
AUTH_REQUIRED
```

After re-authentication, sync continues.

Cached user preferences (locale, theme) remain applicable while offline.

---

## 38. Security

Do not store:

```text
password
JWT secret
database credentials
```

in the frontend.

JWT/token storage must be chosen with the XSS/security model in mind.

Do not put sensitive financial data in URLs.

Backend must always check authorization.

Frontend permissions are not a security boundary.

---

## 39. Authorization

Every backend request must verify:

```text
authenticated user
+
permission for the resource/action
```

For MVP financial data (§9), any authenticated app user may access the common financial space. Still reject unauthenticated and malformed requests; never trust the frontend alone.

User preferences endpoints must allow only the authenticated owner (`/users/me/...`).

---

## 40. Database

PostgreSQL is the backend source of truth.

All important relations must have database constraints.

Use:

```text
foreign keys
unique constraints
indexes
check constraints
transactions
```

where needed.

Indexes must match real query patterns.

Especially:

```text
userId
accountId
createdAt
updatedAt
deletedAt
sync sequence
categoryId
```

User preferences must be stored in PostgreSQL (e.g. columns on `User` or a `user_preferences` table with a unique `userId`).

---

## 41. Database Transactions

Operations that change several related financial entities must run in a PostgreSQL transaction.

For example:

```text
Transfer
```

must be atomic.

It must be impossible to end up with:

```text
money removed from Account A
money not added to Account B
```

---

## 42. Concurrency

For concurrent changes to the same financial entities by multiple users use:

```text
optimistic locking
```

and where an aggregate must change atomically:

```text
database transaction
+
appropriate row locking
```

Do not use global locks without need.

---

## 43. Caching

Do not cache financial data without a clear invalidation strategy.

Redis may be used for:

- rate limiting;
- sessions;
- ephemeral synchronization state;
- background jobs;
- expensive analytics;
- distributed locks, if truly needed.

But PostgreSQL remains authoritative storage.

---

## 44. Import / Export (Post-MVP)

Not required for MVP. When built, support Import and Export (at least JSON and/or CSV).

On import: validate before mutating domain state; preview; errors; duplicate detection; transactional apply (no partial import unless the user explicitly chose it).

---

## 45. Export Contents (Post-MVP)

Export must allow obtaining financial data beyond the current UI view.

Include entities that exist at the time of export, for example:

```text
accounts
transactions
categories
savings goals (if present)
debts / loans (if present)
user preferences / settings
```

Do not invent empty Budget entities for export.

---

## 46. Date and Time

Do not use local display strings such as:

```text
14.08.2026
```

as the storage format.

Use ISO-8601 / UTC for timestamps.

For financial dates separately define:

```text
transactionDate
```

because a transaction may refer to the user’s calendar date, not the moment the record was created.

UI presentation of dates must follow the active i18n locale (§4).

---

## 47. UI Architecture

Frontend should be split into:

```text
pages
features
components
domain state
data access
sync
```

Do not put business logic directly in React components.

Bad:

```tsx
function TransactionPage() {
  // database logic
  // API calls
  // sync logic
  // financial calculations
  // UI
}
```

Prefer:

```text
UI
 ↓
Application/use-case layer
 ↓
Repositories
 ↓
Local DB / API
```

Locale and theme providers belong in the app shell; feature UI consumes translated strings and theme tokens, not hard-coded language or colors.

---

## 48. State Management

Choose state management based on project architecture.

Separate:

```text
UI state
server/domain state
local persistent state
sync state
```

Do not keep the entire application state in one global store.

Active locale and theme are part of UI/preferences state, sourced from user preferences (§8) with local cache.

---

## 49. Optimistic UI

Creating an expense offline must feel as if the operation completed instantly.

For example:

```text
User → Add Expense
        ↓
Local DB
        ↓
UI updates immediately
        ↓
Sync later
```

UI should show sync status where it matters:

```text
Synced
Pending
Syncing
Conflict
Failed
```

---

## 50. Responsive / Mobile-first

Design primary UX first for:

```text
mobile
```

Then:

```text
tablet
desktop
```

Pay special attention to:

- touch targets;
- bottom navigation;
- forms;
- keyboard;
- numeric inputs;
- date pickers;
- currency inputs;
- charts;
- offline indicators;
- language and theme controls (reachable in mobile layout).

---

## 51. Financial Input

Money input must:

- support decimal values;
- respect currency precision;
- not use floating point;
- work correctly with mobile keyboards;
- prevent invalid values.

For example:

```text
RUB → 2 decimal places
USD → 2 decimal places
```

But currency precision must not be hard-coded globally.

---

## 52. UX for Multi-user Attribution

The user should understand:

```text
Which transactions are mine
Which transactions were created by another user
How to filter: all / only me / selected users
```

When listing or inspecting operations, show:

```text
createdBy
```

and when relevant:

```text
updatedBy
```

---

## 53. Observability

Backend must have structured logging.

Do not log:

```text
passwords
JWT secrets
full financial payloads
```

During synchronization log:

```text
operationId
userId
entityId
operation type
sync result
conflict
error code
```

In production it must be possible to diagnose sync failures.

---

## 54. Testing

Write tests for every meaningful feature.

### Tooling

| Layer                       | Unit / component                   | Integration                                                    | E2E                                                                                              |
| --------------------------- | ---------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/web` + FE libs        | **Vitest** + React Testing Library | as needed (MSW / local IDB fixtures)                           | **Playwright**                                                                                   |
| `apps/api` + BE/domain libs | **Jest** (NestJS default)          | Jest + Nest testing module + PostgreSQL (test DB / containers) | Playwright against running `web`+`api` for critical flows; API-only scenarios via Jest/supertest |

Rationale: Vitest fits Vite naturally; Jest is the NestJS default; Playwright is the shared e2e tool for UI and offline/sync scenarios.

Minimum content:

### Unit

- domain calculations;
- money calculations;
- currency conversion;
- validation;
- conflict resolution;
- sync state transitions;
- React presenters/hooks without heavy infrastructure (web);
- locale/theme preference mapping (including `system` → effective Carbon theme).

### Integration

- PostgreSQL repositories;
- API;
- authentication;
- authorization;
- synchronization;
- user preferences read/update.

### E2E

Critical scenarios:

```text
login
create account
create transaction
offline transaction
reconnect
sync
two users create transactions (attribution)
filter operations by user
concurrent update
conflict
switch language
switch theme
preferences persist across reload / second browser session (when online)

# Post-MVP E2E when those features exist:
# savings goal progress
# analytics charts
# import / export
```

---

## 55. Sync Testing

Must test:

```text
Online
Offline
Offline → Online
Online → Offline
Multiple pending mutations
Duplicate mutation
Failed mutation
Retry
Conflict
Concurrent users
Deleted entity
Expired JWT
Partial network failure
```

Especially important:

```text
User A offline
User B changes the same account / entity
User A reconnects
```

---

## 56. API Design

API must be predictable.

Use REST unless there is a strong reason for another protocol.

Approximate structure:

```text
/auth

/users
/users/me/preferences

/accounts
/accounts/:id

/transactions
/transactions/:id

/categories

/sync

# Post-MVP examples (add when building the feature):
# /savings-goals
# /debts | /loans | …
# /analytics
# /import | /export
```

Actual endpoints are defined by the project architecture.

---

## 57. Pagination

Do not load a potentially unbounded number of transactions in one request.

Use pagination.

For financial transaction history prefer cursor-based pagination when it fits the sync/query model.

---

## 58. Analytics Performance (Post-MVP)

When analytics exist, queries can become heavy. Do not optimize early.

If profiling shows problems, use:

- PostgreSQL indexes;
- aggregation queries;
- materialized views;
- cached analytics;
- precomputed aggregates.

Do not add Redis only because it “might be useful”.

---

## 59. Domain Events

Use domain events where they truly help.

For example:

```text
TransactionCreated
TransactionUpdated
TransactionDeleted
AccountCreated
AccountUpdated
```

Events are especially useful for sync (and later analytics/audit). Do not turn simple CRUD into event sourcing without need.

---

## 60. Event Sourcing

Full Event Sourcing is NOT required.

Use it only with a clear domain/business justification.

For this application prefer:

```text
PostgreSQL state
+
audit/change log
+
sync sequence
```

instead of a full event store.

---

## 61. Auditability

Financial data should have an audit trail.

Especially for:

```text
transactions
account mutations by multiple users
large financial changes
```

You may store:

```text
actor
entity
operation
before
after
timestamp
```

But you do not need an audit snapshot for every UI state change.

---

## 62. Coding Standards

Use strict TypeScript.

Prefer:

```typescript
strict: true;
```

Do not use:

```typescript
any;
```

without an objective reason.

Do not do:

```typescript
as any
```

to bypass type errors.

Do not suppress TypeScript errors with:

```typescript
@ts-ignore
```

if the problem can be fixed properly.

---

## 63. Nx Rules

Respect Nx dependency boundaries.

For example:

```text
UI
↓
Application
↓
Domain
↓
Infrastructure
```

Do not allow:

```text
UI → PostgreSQL
UI → NestJS internals
Domain → React
Domain → browser APIs
```

Shared contracts must not depend on React or NestJS implementation details.

---

## 64. Dependency Direction

Preferred direction:

```text
apps
 ↓
features
 ↓
application
 ↓
domain
 ↑
infrastructure implementations
```

Domain layer must not depend on infrastructure.

---

## 65. API Contract Changes

When changing the API:

1. Update the shared contract first.
2. Update the Backend implementation.
3. Update the Frontend client.
4. Update tests.
5. Check backward compatibility if needed for offline clients.

Be especially careful changing:

```text
sync contracts
```

because an old client may stay offline for several days.

---

## 66. Backward Compatibility

Offline-first means the client may be outdated.

Therefore the synchronization API must account for versioning.

For example:

```text
schemaVersion
syncProtocolVersion
```

Do not break an old offline queue after deploying a new backend version.

---

## 67. Migration Strategy

Database migrations are mandatory.

Do not change the production schema by hand.

All changes:

```text
migration
```

and must be reproducible.

For breaking domain migrations, plan a compatibility window in advance.

---

## 68. What the Agent Must NOT Do

Do not:

- rewrite architecture without need;
- add dependencies without reason;
- use floating point for money;
- store financial domain only in localStorage;
- treat frontend authorization as sufficient;
- use `last-write-wins` without analysis;
- make non-idempotent sync operations;
- silently overwrite concurrent changes;
- physically delete sync entities without need;
- duplicate TypeScript contracts;
- use `any` to bypass architectural problems;
- create custom Carbon components when Carbon already provides a solution;
- add Redis/queues/WebSockets only “for later”;
- put business logic in React components;
- make a network request mandatory to read local data;
- treat `navigator.onLine === true` as proof of full Internet connectivity;
- hard-code UI copy for a single language when i18n is required;
- implement theme colors that diverge from Carbon theme tokens;
- store locale/theme only in the browser when cross-browser persistence is required (use backend user preferences).

---

## 69. Definition of Done

A feature is done only if:

- [ ] Domain model implemented.
- [ ] Shared TypeScript contracts updated.
- [ ] PostgreSQL schema/migration updated.
- [ ] Backend API implemented.
- [ ] Frontend feature implemented.
- [ ] Offline scenario works.
- [ ] Pending mutation syncs correctly.
- [ ] API operation is idempotent.
- [ ] Concurrent modification is handled.
- [ ] Authorization is checked on the Backend.
- [ ] Money calculations are decimal-safe.
- [ ] Currency is handled correctly.
- [ ] Loading/error/empty states implemented.
- [ ] Mobile UX checked.
- [ ] Unit tests added.
- [ ] Integration tests added when needed.
- [ ] E2E tests added for the critical user flow.
- [ ] Nx dependency boundaries not violated.
- [ ] Lint passes.
- [ ] TypeScript compilation passes.
- [ ] Existing tests not broken.
- [ ] User-visible strings go through i18n when the feature has UI copy (en + ru).
- [ ] Theme-sensitive UI uses Carbon-compatible tokens (no broken contrast in light/dark).

---

## 70. Development Workflow

For each task use this workflow:

```text
1. Understand
   ↓
2. Inspect existing code
   ↓
3. Identify affected domains
   ↓
4. Design minimal solution
   ↓
5. Update contracts/domain
   ↓
6. Implement backend
   ↓
7. Implement frontend
   ↓
8. Implement offline/sync behavior
   ↓
9. Add tests
   ↓
10. Run typecheck/lint/tests
   ↓
11. Review architecture
```

Do not jump straight to writing code.

---

## 71. Before Coding

Before implementing a complex task, briefly state:

```text
Goal
Affected modules
Domain changes
API changes
Database changes
Offline implications
Sync implications
Conflict implications
Testing strategy
```

If the task is simple and existing architecture clearly dictates the solution, do not create an excessive design document.

---

## 72. When Requirements Are Ambiguous

If several valid architectural options exist:

1. Choose the option with minimal complexity.
2. Prefer existing project patterns.
3. Account for offline-first and synchronization.
4. Account for concurrent multi-user edits of the same data.
5. Do not add infrastructure without need.

If ambiguity may cause financial data loss or synchronization conflicts — stop and ask for clarification.

---

## 73. Priority Order

When requirements conflict, use this order:

```text
1. Data integrity
2. Security
3. Financial correctness
4. Synchronization correctness
5. Type safety
6. Domain consistency
7. UX
8. Performance
9. Developer convenience
```

Do not sacrifice financial correctness for a simpler implementation.

---

## 74. Critical Scenarios

Always keep these scenarios in mind:

#### Scenario 1 — Offline expense

```text
User offline
↓
Creates expense
↓
Expense immediately appears
↓
Operation stored locally
↓
Internet appears
↓
Operation sent
↓
Server acknowledges
↓
Operation marked synced
```

#### Scenario 2 — Two users, attribution and filters

```text
User A creates expense → createdBy = A
User B creates expense → createdBy = B

Filter: all → both visible
Filter: only me (as A) → only A’s expense
Filter: selected users [B] → only B’s expense
```

Both may work in the same financial space at the same time.

#### Scenario 3 — Concurrent edit

```text
Server version = 10

User A reads version 10
User B reads version 10

User A updates
Server version = 11

User B updates with expectedVersion = 10

→ conflict
```

Do not silent-overwrite.

#### Scenario 4 — Offline + concurrent change

```text
User A goes offline

User B changes the same entity

User A changes same data offline

User A reconnects

→ sync
→ detect conflict
→ preserve data
→ resolve explicitly
```

#### Scenario 5 — Multiple currencies (MVP)

```text
Accounts:
  RUB account → show RUB balance
  USD account → show USD balance

Do not display a single summed total without conversion.
```

Cross-currency report totals are Post-MVP (§13, §21).

#### Scenario 6 — Locale and theme across devices

```text
User sets language = ru and theme = dark on Browser A
↓
Preferences saved on backend
↓
User logs in on Browser B
↓
UI loads ru + dark (or system→effective theme)
↓
User goes offline on Browser B
↓
Cached preferences still apply
```

---

## 75. Final Engineering Principle

This application is not a simple CRUD app.

Main architectural complexities (MVP):

```text
Money
+
Multi-currency (per-account)
+
Offline-first
+
Synchronization
+
Concurrency (multi-user)
+
Attribution + visibility filters
+
Data integrity
+
i18n + theming preferences
```

Post-MVP adds (do not pre-build): savings goals, converted capital/analytics, debts, import/export, richer audit.

Therefore, when making technical decisions, think first about:

```text
"What happens if the user is offline?"

"What happens if two users change the same entity?"

"What happens if the request is delivered twice?"

"What happens if the JWT expires while offline?"

"What happens if the app is updated while old mutations are still queued?"

"What happens if the same financial data exists in different currencies?"

"What happens if the network disappears halfway through an operation?"

"What happens if the user opens the app on another browser — are locale and theme still correct?"
```

Any decision that has no correct answer to these questions must be revisited before implementation.
