# Parked data model (pull-sync / local queue)

Not part of the live [`ERD.md`](../../ERD.md). Do not add these tables.

```mermaid
erDiagram
    direction TB

    User ||--o{ SyncCursor : owns
    User ||--o{ ProcessedOperation : submitted
    User ||--o{ ChangeLog : acted

    SyncCursor {
        uuid id PK
        uuid userId FK
        bigint lastSyncSequence
        timestamptz updatedAt
    }

    ProcessedOperation {
        uuid operationId PK "client idempotency key"
        uuid userId FK
        string entityType
        uuid entityId
        enum operationType "CREATE | UPDATE | DELETE"
        json result
        timestamptz processedAt
    }

    ChangeLog {
        bigint changeSequence PK "monotonic server ordering"
        string entityType
        uuid entityId
        enum changeType "UPSERT | DELETE"
        json payload
        uuid actorUserId FK
        timestamptz serverTimestamp
    }
```

| Entity | Storage | Purpose |
| --- | --- | --- |
| `SyncCursor` | PostgreSQL (+ client cache) | Pull: all changes after sequence N |
| `ProcessedOperation` | PostgreSQL | Duplicate `operationId` is not applied twice (may later fold into the live API idempotency store) |
| `ChangeLog` | PostgreSQL | Change feed for pull |
| `PendingMutation` | IndexedDB only (not PG) | Client mutation queue |

Extra fields on shared entities if this phase is built: `clientTimestamp`, `serverTimestamp`. The live schema already has `version`, `deletedAt`, `createdAt`, `updatedAt`.
