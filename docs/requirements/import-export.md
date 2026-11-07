---
id: domain.import-export
status: draft
applies: [web, server, dto]
implementation: none
---

# Import / Export

## Назначение

Обмен данными в JSON/CSV с валидацией.

## Правила и инварианты

- Импорт: валидация → предпросмотр → ошибки/дубликаты → применение в транзакции (частичное — только если выбрано явно).
- Экспорт: счета, транзакции, категории, цели/долги (если есть), preferences; не выдумывать сущности Budget.

## Связанное

- [`contracts.md`](./contracts.md)
