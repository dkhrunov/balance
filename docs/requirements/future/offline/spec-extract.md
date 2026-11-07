# Historical spec extract (parked)

Copied from `docs/requirements/SPEC.md` when this work left the product backlog. Section numbers are the old SPEC numbers. Do not treat this as current acceptance.

## Бывший §22. Local-first (no network)

The application must remain functional without a network.

The user must be able to view data and create/edit/delete transactions, accounts, and categories without an Internet connection.

Locale and theme from cached user preferences must continue to apply. Preference updates made without a network may be queued and applied when connectivity returns.

## Бывший §23. Local database

Use IndexedDB for persistent local state. Do not store financial domain data only in `localStorage`.

Prefer a repository abstraction (`AccountRepository`, `TransactionRepository`, `CategoryRepository`, `SyncRepository`). UI must not talk to IndexedDB directly.

## Бывший §24. Mutation queue

All mutations enter a local queue: UI → local DB → mutation queue → sync engine → API.

Without a network the queue waits; after connectivity: WAITING → SYNCING → SERVER → ACK → COMPLETED.

## Бывшие §25–§27. Sync operation, API, algorithm

Every mutation has a unique `operationId` for idempotency (also required on the live online API).

Support push local changes and pull remote changes (e.g. `POST /sync/push`, `GET /sync/pull` — names may vary).

Cycle: detect network → push pending → acks → pull remote → apply locally → resolve conflicts → update cursor → repeat. After connectivity returns, pending operations send automatically.

## Бывший §30. Server authority (sync framing)

During synchronization: client = optimistic state, server = authoritative. Do not silently destroy local changes. On conflict the client receives explicit information (`SYNC_CONFLICT` with entity, ids, local/server versions, server state).

## Бывшие §33–§34. Timestamps and cursor

Distinguish `createdAt`, `updatedAt`, `deletedAt`, `serverTimestamp`, `clientTimestamp`. Do not trust client timestamps for server ordering; use a server-generated sequence/version.

The client holds a sync cursor (`lastSyncSequence`). Backend has a monotonic `changeSequence` so the client can request all changes after N.

## Бывший §35. PWA

Installability and startup without a network, including desktop. Does not imply mobile-first layout.

Must support: installability, service worker, application shell caching, IndexedDB, startup without a network, background synchronization where the browser allows it, network recovery.

Do not assume Background Sync API. Fallbacks: online event, app startup, visibilitychange, manual retry, periodic retry.

## Бывший §37. Authentication without a network

If the user is already authenticated, the app remains usable without a network. Do not require a network request to display local data.

When the JWT expires, local data remains accessible but synchronization enters `AUTH_REQUIRED`. After re-authentication, sync continues. Cached locale/theme remain applicable.

## Бывший §55. Sync testing

Test: online; no network; no-network → online; online → no-network; multiple pending mutations; duplicate mutation; failed mutation; retry; conflict; concurrent users; deleted entity; expired JWT; partial network failure.

Especially: user A without network, user B changes the same entity, user A reconnects.

## Бывший §66. Backward compatibility of the sync protocol

A client may be outdated. Version the synchronization API (`schemaVersion`, `syncProtocolVersion`). Do not break an old queued mutation after deploying a new backend.

## Бывшие critical scenarios

- Create an expense without a network; it appears immediately, stores locally, sends when the network returns, marks synced after ack.
- User A without network and user B online both change the same entity; reconnect detects conflict; preserve data; resolve explicitly.
- JWT expires without a network; local read still works; sync blocked until re-auth.
- App update while old mutations are still queued.
- Network disappears halfway through an operation.
