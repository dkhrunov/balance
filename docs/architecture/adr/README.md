# Architecture Decision Records (ADR)

Краткие записи **почему** выбраны архитектурные решения. Поведение и инварианты живут в [`docs/requirements/`](../../requirements/); очередь работ — в [`TASKS.md`](../../../TASKS.md); как работать — в [`AGENTS.md`](../../../AGENTS.md).

## Когда писать ADR

**Нужен**, если:

- есть ≥2 разумные альтернативы с долгосрочными последствиями;
- меняется Accepted-решение → новый файл со статусом Superseded у старого.

**Не нужен** для:

- выбора конкретного Carbon-виджета;
- локального рефакторинга внутри уже принятого подхода.

Цикл SDD — [`.cursor/skills/spec-driven/SKILL.md`](../../../.cursor/skills/spec-driven/SKILL.md).

## Как добавить

1. Скопировать [`_template.md`](./_template.md).
2. Имя файла: `NNNN-kebab-title.md` (следующий свободный номер, без дыр).
3. Status по умолчанию: `Accepted`, если решение уже в коде/спеке; иначе `Proposed`.
4. Ссылаться на related specs / code; не дублировать длинные правила из спек.

Язык: смысл на русском; устоявшиеся термины (DTO, soft-delete, operationId, NUMERIC, Carbon, Money) — на английском.

## Индекс

| ADR                                         | Title                             | Status   |
| ------------------------------------------- | --------------------------------- | -------- |
| [0001](./0001-nx-monorepo.md)               | Nx monorepo                       | Accepted |
| [0002](./0002-sql-migrations.md)            | SQL-миграции и schema_migrations  | Accepted |
| [0003](./0003-dto-contract-first.md)        | Shared DTO contract-first         | Accepted |
| [0004](./0004-decimal-money.md)             | Decimal-safe Money                | Accepted |
| [0005](./0005-derived-account-balance.md)   | Derived account balance           | Accepted |
| [0006](./0006-one-financial-space.md)       | One financial space               | Accepted |
| [0007](./0007-auth-jwt-cookies.md)          | JWT in HttpOnly cookies           | Accepted |
| [0008](./0008-idempotency-and-version.md)   | operationId + version             | Accepted |
| [0009](./0009-soft-delete-tombstone.md)     | Soft-delete tombstone             | Accepted |
| [0010](./0010-correct-via-delete-create.md) | Correct via delete + create       | Accepted |
| [0011](./0011-nest-raw-pg-hexagonal.md)     | Nest + raw PostgreSQL + hexagonal | Accepted |
| [0012](./0012-carbon-desktop-first.md)      | Carbon desktop-first UI           | Accepted |
| [0013](./0013-atomic-transfers.md)          | Atomic transfers                  | Accepted |
| [0014](./0014-online-product.md)            | Online desktop product            | Accepted |
