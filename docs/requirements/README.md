# Requirements

Требования Balance.

Цикл обновления этих файлов — [`.cursor/skills/spec-driven/SKILL.md`](../../.cursor/skills/spec-driven/SKILL.md). Как работать в репозитории — [`AGENTS.md`](../../AGENTS.md).

## Структура: плоская, один файл = одна фича/сущность/сквозной инвариант

```text
docs/requirements/
  README.md, _template.md, ERD.md
  scope.md, principles.md                         # продукт в целом
  money.md, currency.md, accounts.md,
  transactions.md, categories.md,
  multi-user.md, users-preferences.md,
  auth-security.md, i18n.md, theme.md,
  idempotency-concurrency.md                       # одна фича/сущность/инвариант на файл
  contracts.md                                     # правила libs/dto
  savings.md, debts.md, analytics.md, import-export.md
```

Без промежуточных слоёв (`domain/`, `cross-cutting/`, `product/`, `apps/`): один файл — одна фича.

**Spec vs ADR:** спека — _что_ делает система (поведение, инварианты); ADR — _почему_ выбрали вариант (стек, библиотека, архитектурный паттерн). Выбор технологии не повторяется в спеке — см. [`../architecture/adr/`](../architecture/adr/).

## Индекс реализации (сверено с кодом 2026-11-07)

| Spec                                                         | Implementation |
| ------------------------------------------------------------ | -------------- |
| [`scope.md`](./scope.md)                                     | partial        |
| [`principles.md`](./principles.md)                           | partial        |
| [`money.md`](./money.md)                                     | done           |
| [`currency.md`](./currency.md)                               | partial        |
| [`accounts.md`](./accounts.md)                               | partial        |
| [`transactions.md`](./transactions.md)                       | partial        |
| [`categories.md`](./categories.md)                           | partial        |
| [`multi-user.md`](./multi-user.md)                           | partial        |
| [`users-preferences.md`](./users-preferences.md)             | done           |
| [`auth-security.md`](./auth-security.md)                     | partial        |
| [`i18n.md`](./i18n.md)                                       | partial        |
| [`theme.md`](./theme.md)                                     | done           |
| [`idempotency-concurrency.md`](./idempotency-concurrency.md) | partial        |
| [`contracts.md`](./contracts.md)                             | done           |
| [`savings.md`](./savings.md)                                 | none           |
| [`debts.md`](./debts.md)                                     | none           |
| [`analytics.md`](./analytics.md)                             | none           |
| [`import-export.md`](./import-export.md)                     | none           |
