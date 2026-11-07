---
id: cross.idempotency
status: active
applies: [web, server, dto]
implementation: partial
verified_at: 2026-11-07
---

# Idempotency и concurrency

## Назначение

Безопасные retries и запрет silent overwrite при concurrent multi-user edits.

## Правила и инварианты

### operationId

- Каждая API-мутация идемпотентна по клиентскому `operationId`: повторная отправка применяется один раз и возвращает результат первого применения, без второй записи и без ошибки «дубликат».

### version

- Изменяемые сущности: optimistic concurrency через `version` (предпочтительнее, чем `updatedAt`).
- Клиент отправляет `expectedVersion`, равный прочитанной `version`. Сервер применяет изменение только при совпадении и увеличивает `version` на 1. Пример: прочитали `12`, отправили `12`, в хранилище становится `13`. Если текущая `version` уже другая — `409` с кодом `*_VERSION_CONFLICT` и телом `{ code, message, details }`. Клиент заново читает сущность. Молчаливой перезаписи нет.
- Не last-write-wins для финансовых сущностей.

### deletedAt

- Общие финансовые сущности — soft-delete tombstone (`deletedAt`), не hard delete.

### Временные метки

- Хранить `createdAt`, `updatedAt`, `deletedAt`.
- Упорядочивание конкурентных записей — через server `version`, а не часы клиента (client clock).

### Конкурентность в БД

- Optimistic locking; для атомарных агрегатов — транзакция БД + блокировка строк (row locking) по необходимости; без глобальных блокировок (global locks) без крайней нужды.

### Наблюдаемость мутаций

- При логировании мутаций полезны: `operationId`, `userId`, `entityId`, тип операции, код ошибки.
- Не логировать пароли, секреты и полные финансовые payload'ы.

## Контракты

- `@balance/dto/common` (`OperationId`, `EntityVersion`, …)

## Связанное

- ADR-0008, ADR-0009, ADR-0010
- [`transactions.md`](./transactions.md)
