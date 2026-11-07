# ADR-0008: idempotency operations

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/idempotency-concurrency.md`
- **Related code:** mutation APIs (accounts, categories, transactions), dto requests

## Контекст

Несколько пользователей онлайн; сеть и UI могут повторить запрос. Нужны безопасные retries и запрет тихой перезаписи при конкуретном редактировании и работе с приложением.

## Решение

- Каждое изменение несёт client `operationId`; повтор с тем же id применяется один раз (idempotent).
- Конкурентные изменения сущностей несут `version`; update с `expectedVersion` → при несовпадении `409 Conflict` (вместо last-write-wins).

Эти поля — инварианты **online multi-user**.

## Рассмотренные альтернативы

- **Last-write-wins** — отвергнуто для финансовых сущностей.
- **Только `updatedAt` compare** — слабее явного integer `version`.
- **Idempotency только на gateway (Redis)** — без `operationId` в контракте сложнее воспроизвести на клиенте.

## Последствия

### Плюсы

- Безопасные retries; явные конфликты.
- Контракт готов к будущим клиентским очередям без смены семантики мутаций.

### Минусы и компромиссы

- Клиент обязан хранить/генерировать `operationId` и передавать `version`.

### Дальнейшие шаги

- Нет.
