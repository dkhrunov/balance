---
id: domain.transactions
status: active
applies: [web, server, dto]
implementation: partial
verified_at: 2026-11-07
---

# Transactions

## Назначение

Ядро операций: доход (Income), расход (Expense), перевод (Transfer) — с attribution и decimal-safe Money.

## Правила и инварианты

### Виды операций

- Доход / расход: `accountId`, `categoryId`, Money, `transactionDate`, опциональное `description` (до 64 символов), `createdBy`, таймстемпы, `version`. Сумма строго больше нуля. Валюта операции совпадает с валютой счёта. Тип категории совпадает с типом операции: доход — только `INCOME`, расход — только `EXPENSE`. Счёт и категория должны быть активными: операция на soft-deleted счёт или категорию отклоняется.
- Transfer — две связанные записи (`TRANSFER_OUT` / `TRANSFER_IN`) с общим `transferGroupId`; атомарная PostgreSQL-транзакция; `categoryId` = `null`. Перевод между счетами в одной валюте не меняет их суммарный капитал: это не расход и не доход. Разная валюта ног — отказ, без скрытой конвертации (FX).
- Предпочтительно correction (soft-delete + create) вместо скрытого изменения критичных полей «на месте» (ADR-0010).

### Дата/время

- Таймстемпы: ISO-8601 / UTC (`createdAt`, `updatedAt`, `deletedAt`).
- Отдельно `transactionDate` (календарная дата операции, а не момент записи в БД).
- Не доверять часам клиента (client clock) для упорядочивания конкурентных записей — только server `version`.

### Список

- Пагинация cursor. Список можно ограничить счётом и типом.

## Контракты

- `@balance/dto/transactions`

## Поведение на web

- Создание и список дохода, расхода и перевода; в списке виден `createdBy`; ввод денег в decimal-формате.

## Поведение на server

- Идемпотентные создание/удаление; авторизация (authz); атомарный перевод в одной DB-транзакции; проверка достаточности средств через derived balance.

## Нужно сделать

- Создание и удаление не идемпотентны: `operationId` на server нет.
- Фильтр списка `createdBy` (все / я / выбранные) есть в API и не вызывается из web. Его убирают из контракта и с сервера; поле `createdBy` у операции остаётся. Задача `drop-created-by-list-filter`.

## Связанное

- ADR-0010, ADR-0013
- [`categories.md`](./categories.md)
- [`idempotency-concurrency.md`](./idempotency-concurrency.md)
