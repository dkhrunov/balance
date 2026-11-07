# Deferred: local persistence, PWA, sync engine

**Status:** parked analysis. **Do not implement.** This folder is not part of the working backlog.

The live app is **online**. Shared-entity invariants (`operationId`, `version`, `deletedAt`) exist for concurrent multi-user use; they also make a later local-queue/sync phase cheaper. They are specified in the main spec, not here.

## Состав

| File | What |
| --- | --- |
| [`spec-extract.md`](./spec-extract.md) | Former SPEC sections for this area (historical numbers in headings) |
| [`tasks.md`](./tasks.md) | Tasks kept only in this folder |
| [`erd.md`](./erd.md) | Tables and fields that belong only to a pull-sync / local-queue design |

`libs/dto` still has an unused `sync/` stub. Do not grow it until this work is scheduled.

## Когда открывать эту папку

Only after a product decision to build local persistence / installable shell / sync — then add tasks to `TASKS.md` and treat these files as the starting spec.
