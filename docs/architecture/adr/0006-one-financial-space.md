# ADR-0006: One financial space

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/multi-user.md`, `docs/requirements/scope.md`
- **Related code:** accounts / categories / transactions modules (нет Space / AccountMember)

## Контекст

Личное/семейное приложение: несколько пользователей в одном общем финансовом контуре. Нужно решить, вводить ли multi-tenant spaces и ownership счетов.

## Решение

**Одно financial space**, 1–n пользователей.

- Accounts / categories / balances — общие; нет owner / membership на счёте.
- Attribution на операциях (`createdBy`).
- Любой авторизованный пользователь может CRUD общие данные (auth + concurrency).
- Не строить `Space`, tenant switcher, `AccountMember` «про запас».

Несколько пространств — отдельное продуктовое решение (может не понадобиться).

## Рассмотренные альтернативы

- **Per-user spaces с sharing** — сложный authz и модель данных раньше продукта.
- **Account ownership / ACL** — противоречит «социальному соглашению» кто чем пользуется.

## Последствия

### Плюсы

- Простой authz и схема.
- Attribution на операциях закрывает «кто провёл операцию» без ownership счетов.

### Минусы и компромиссы

- Позже multi-space потребует миграции модели (осознанный trade-off).

### Дальнейшие шаги

- Задача `multi-space-undecided` — только decision, не схема.
