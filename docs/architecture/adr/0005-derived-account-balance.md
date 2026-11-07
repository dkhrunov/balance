# ADR-0005: Derived account balance

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/accounts.md`
- **Related code:** `libs/domain` (`AccountBalance.derive`), `apps/server` transactions/accounts

## Контекст

Баланс счёта должен быть согласован с ledger операций. Хранимый «текущий баланс» легко расходится при concurrent edits, transfer и soft-delete.

## Решение

Баланс **выводится** из `initialBalance` + ledger транзакций счёта (`AccountBalance.derive`). Не хранить отдельную колонку «current balance» как источник истины.

## Рассмотренные альтернативы

- **Stored balance column + triggers** — быстрее читать, но риск отхода от правил и сложнее concurrent updates.
- **Event-sourced balance projection** — избыточно (см. `docs/requirements/principles.md`).

## Последствия

### Плюсы

- Ledger остаётся авторитетным; проще audit и исправления транзакций.
- Один алгоритм в domain, переиспользуемый на сервере.

### Минусы и компромиссы

- Чтение баланса = compute (индексы / агрегаты при росте данных).

### Дальнейшие шаги

- При необходимости — materialized aggregate без смены семантики расчета баланса.
