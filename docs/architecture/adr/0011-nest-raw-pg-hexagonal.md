# ADR-0011: Nest + raw PostgreSQL + hexagonal

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/idempotency-concurrency.md`
- **Related code:** `apps/server` (modules, ports, use cases, `pg` + SafeQL)

## Контекст

Backend должен быть тестируемым, с явными границами domain/application/infrastructure, без ORM-магии и SQL.

## Решение

- **NestJS** основной framework приложения.
- **PostgreSQL** через `pg` + `@ts-safeql/sql-tag` (raw SQL, typed queries) — см. skill `raw-postgresql`.
- Модули по feature с **hexagonal** layout: inbound HTTP → use cases → ports → Postgres adapters — см. skill `hexagonal-architecture`.
- Migrations в `apps/server/migrations/`. Учёт применённых файлов — [ADR-0002](./0002-sql-migrations.md).

## Рассмотренные альтернативы

- **Prisma / TypeORM** — быстрее стартовать, хуже контроль NUMERIC/SQL и lock patterns.
- **Clean architecture «по книжке» без Nest** — лишний каркас; Nest DI уже есть.
- **Redis/queues «на будущее»** — не добавлять без конкретной нужды.

## Последствия

### Плюсы

- SQL и money под контролем; use cases тестируются через ports.
- Skills в репо описывают как писать.

### Минусы и компромиссы

- Больше boilerplate портов/adapters, чем у «fat ORM service».

### Дальнейшие шаги

- Нет. Поведенческие инварианты БД/concurrency — в `docs/requirements/idempotency-concurrency.md`; структура модулей — в skill (`hexagonal-architecture`), не в отдельной спеке.
