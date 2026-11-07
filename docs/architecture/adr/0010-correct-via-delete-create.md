# ADR-0010: Correct via delete + create

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/transactions.md`
- **Related code:** transactions UI/API (edit path), soft-delete + create flows

## Контекст

Редактирование суммы/типа финансовой операции под конкрутную модель пользователей легко теряет историю и маскирует ошибку как «просто правку».

## Решение

Предпочитать **исправление** операции через soft-delete исходной операции + создание новой, а не "тихое" изменение критичных финансовых полей.

Если редактирование всё же нужно — только с optimistic concurrency (`version`), без "тихой" перезаписи.

## Рассмотренные альтернативы

- **Mutable ledger rows** — проще UX «редактировать», хуже audit и конфликты.
- **Explicit reversal + compensating entry always** — строже; delete+create достаточно для текущего продукта.

## Последствия

### Плюсы

- История и аттрибуты сохраняются.
- Согласуется с derived balance и soft-delete.

### Минусы и компромиссы

- UX «исправить» = два шага.

### Дальнейшие шаги

- Уточнить copy/flow в web при оформлении транзакционных форм.
