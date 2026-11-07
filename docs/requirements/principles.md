---
id: product.principles
status: active
applies: [web, server, dto]
implementation: partial
verified_at: 2026-11-07
---

# Принципы

## Назначение

Сквозные принципы продукта Balance.

## Правила и инварианты

- Онлайн desktop-приложение, desktop-first (Carbon `lg+`).
- API contract-first: **feature by feature** — dto → backend → frontend.
- Type-safe FE↔BE.
- Domain-driven без лишней сложности; модульная архитектура.
- Нет float для денег.
- Идемпотентные мутации (`operationId`) и optimistic concurrency (`version`).
- Server — единственный достоверный источник состояния системы.
- Финансовые операции должны быть удобны для аудита.
- i18n и тема хранятся как настройки пользователя (persisted user preferences).
- Не строить Event Sourcing без явной нужды; предпочтительны PostgreSQL state + audit/change log.
- Domain events — только где реально помогают (не превращать CRUD в Event Sourcing).
- Optimistic UI: при create/update обновлять интерфейс сразу по действию пользователя, откатывать и показывать ошибку при отказе сервера.
- Состояния загрузки — skeleton, геометрически совпадающий с итоговым UI; без сдвига вёрстки (layout shift) при появлении контента.
- Не кэшировать финансовые данные без чёткой стратегии инвалидации; PostgreSQL остаётся источником истины, не Redis.

## Вне целей

- Redis / очереди / WebSocket «на будущее» без конкретной нужды.

## Нужно сделать

- Optimistic UI (мгновенное обновление и откат при ошибке) в web не найден: мутации ждут ответ сервера.
- `operationId` через API не проводится.

## Связанное

- ADR-0003, ADR-0004, ADR-0008, ADR-0011, ADR-0012, ADR-0014
