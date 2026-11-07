---
id: contracts.overview
status: active
applies: [dto, web, server]
implementation: done
verified_at: 2026-11-07
---

# Contracts (`libs/dto`)

## Назначение

Единый TypeScript wire-контракт FE↔BE; порядок поставки dto → backend → frontend.

## Правила и инварианты

- Не дублировать DTO между приложениями.
- Домены: `auth`, `users`, `accounts`, `transactions`, `categories`, `currencies`, `common`. Новая фича добавляет свой домен, когда доходит её задача.
- На каждый домен: `models/`, `requests/`, `responses/`, `errors/`, `constraints/` (+ `.gitkeep`, если пусто).
- Импорт только через `@balance/dto/<domain>`; `common/` — ids, время, пагинация, ошибки.
- Классы Nest DTO совместимы с shared-типами.
- Порядок поставки фичи: 1) `libs/dto` 2) backend 3) frontend.
- Структурированные ошибки API: `{ code, message, details }`; UI сопоставляет (мапит) `code` через i18n.
- REST; предсказуемые пути (`/auth`, `/users/me/preferences`, `/accounts`, `/transactions`, `/categories`, …).
- Пагинация обязательна для списков неограниченного размера; для истории транзакций предпочтителен cursor.

## Связанное

- ADR-0003
