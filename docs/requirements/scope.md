---
id: product.scope
status: active
applies: [web, server, dto]
implementation: partial
verified_at: 2026-11-07
---

# Область продукта

## Назначение

Учёт дохода и расхода в одном финансовом пространстве. Продукт **online** и **desktop-first**.

## Правила и инварианты

```text
Единое финансовое пространство; 1–n пользователей (JWT; пользователи через admin/DB seed)
Счета в этом пространстве (явная валюта; без привязки счёта к пользователю)
Категории дохода / расхода
Доход, расход, перевод (transfer)
Attribution: createdBy на операции
Баланс по каждому счёту отдельно (без наивного суммирования разных валют)
Конкурентные правки: operationId, version, tombstone (deletedAt)
i18n (en, ru) + тема (light / dark / system)
Decimal-safe Money сквозно
Desktop-first UI (lg+), online
```

### Явно вне scope

```text
Бюджеты / лимиты расходов как продуктовая фича
```

## Связанное

- ADR-0006, ADR-0012, ADR-0014
- [`principles.md`](./principles.md)
- [`ERD.md`](./ERD.md)
