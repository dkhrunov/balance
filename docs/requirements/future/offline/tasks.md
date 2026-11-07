# Parked tasks (removed from root TASKS.md)

Do not work these until they are copied back into the root queue with a product decision.

## PWA

- [ ] PWA installability + service worker app shell
  - **ID**: pwa-shell
  - **Tags**: frontend, pwa
  - **Details**: Installable PWA (including desktop); SW caches app shell; startup of the shell without a network; do not assume Background Sync API. PWA does not imply a mobile layout.
  - **Acceptance**: Installability criteria met; app opens after first visit without a network; shell loads without network.
  - **Blocked by**: web-shell-auth

## Local persistence and sync

- [ ] Sync API — push + pull with cursor and idempotency
  - **ID**: sync-api
  - **Tags**: backend, sync
  - **Details**: Push idempotent by `operationId`; pull after cursor/sequence; structured conflicts.
  - **Acceptance**: Duplicate push is no-op; pull incremental; conflict payload includes versions; tests for duplicate and cursor.
  - **Blocked by**: transactions-transfer

- [ ] IndexedDB local DB + repository layer
  - **ID**: indexeddb-repositories
  - **Tags**: frontend
  - **Details**: IndexedDB; repositories for accounts/categories/transactions; UI must not touch IDB directly.
  - **Acceptance**: Domain data survives reload without a network; repository API used by app layer; no finance domain solely in localStorage.
  - **Blocked by**: accounts-ui, categories-ui, transactions-ui, pwa-shell

- [ ] Mutation queue
  - **ID**: offline-mutation-queue
  - **Tags**: frontend, sync
  - **Details**: Mutations → local DB + queue with unique `operationId`; optimistic UI; Pending/Syncing/Synced/Failed.
  - **Acceptance**: Expense without a network appears immediately and queues; reload preserves queue; status visible where relevant.
  - **Blocked by**: indexeddb-repositories

- [ ] Sync engine client
  - **ID**: sync-engine-client
  - **Tags**: frontend, sync
  - **Details**: Detect connectivity; push; ack; pull; apply; update cursor; triggers: online, startup, visibility, manual, periodic. Expired JWT → AUTH_REQUIRED without wiping local data. Built against the sync API contract.
  - **Acceptance**: Queue drains when the network returns; remote changes appear; expired JWT blocks sync but local read works.
  - **Blocked by**: offline-mutation-queue, sync-api

- [ ] Conflict handling UX + optimistic concurrency wiring
  - **ID**: sync-conflicts
  - **Tags**: sync, frontend
  - **Details**: Surface SYNC_CONFLICT from the sync API; no silent overwrite; client can reconcile.
  - **Acceptance**: Concurrent update on same account yields conflict; data preserved; regression test or reproducible script.
  - **Blocked by**: sync-engine-client

- [ ] Background Sync API with fallbacks documented
  - **ID**: background-sync-optional
  - **Tags**: pwa, sync
  - **Details**: Use when available; keep online/startup/visibility/manual/periodic fallbacks.
  - **Acceptance**: Feature detects support; unsupported browsers still sync via existing engine.
  - **Blocked by**: sync-engine-client, pwa-shell
