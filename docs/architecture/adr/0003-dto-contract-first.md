# ADR-0003: Shared DTO contract-first

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/contracts.md`
- **Related code:** `libs/dto`

## Контекст

FE и BE должны говорить на едином контракте. Дублирование DTO и «сначала UI, потом API» ломают type-safety и порядок поставки фич.

## Решение

- Общие TypeScript типы DTO в `libs/dto` (`@balance/dto/<domain>`).
- Порядок фичи: **dto → backend → frontend**; UI не начинать до API этой фичи.
- Внутри домена: слои `models/`, `requests/`, `responses/`, `errors/`, `constraints/`.

## Рассмотренные альтернативы

- **OpenAPI / codegen** — возможен позже; сейчас ручные TS DTO проще и уже внедрены.
- **Дублировать типы в apps** — отвергнуто (расхождение контрактов).
- **tRPC / GraphQL** — лишняя сложность для этого REST API.

## Последствия

### Плюсы

- Один источник правды для общих данных.
- Предсказуемый порядок реализации в TASKS.

### Минусы и компромиссы

- Изменение контракта трогает три слоя в одном PR/серии.

### Дальнейшие шаги

- Нет. Контракт описан в `docs/requirements/contracts.md`.
