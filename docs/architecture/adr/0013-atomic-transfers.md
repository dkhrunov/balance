# ADR-0013: Atomic transfers

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/transactions.md`, `docs/requirements/ERD.md`
- **Related code:** `apps/server` `createTransfer`, `TransferGroup`, две Transaction legs

## Контекст

Перевод между счетами не должен выглядеть как expense и не должен оставлять частично применённое состояние при сбое.

## Решение

- Перевод (Transfer) — **не** обычный expense.
- Модель: две связанные строки транзакции (Transaction) (`TRANSFER_OUT` / `TRANSFER_IN`) с общим id группы `transferGroupId`.
- Создание в **одной** PostgreSQL транзакции (atomic); `categoryId` null на legs transfer.
- Без "тихой" FX: разные валюты — отдельное правило/отказ (не молчаливая конвертация).

## Рассмотренные альтернативы

- **Одна строка «transfer»** — хуже для per-account ledger и derived balance.
- **Два независимых API call** — риск частичного сбоя.
- **Transfer как expense + income без group** — ломает чистый капитал и связи атрибутов.

## Последствия

### Плюсы

- Atomicity; балансы счетов согласованы.
- Transfer не искажает общие траты (expense totals).

### Минусы и компромиссы

- UI/API сложнее single-leg create; нужен специальный transfer use case.

### Дальнейшие шаги

- Нет.
