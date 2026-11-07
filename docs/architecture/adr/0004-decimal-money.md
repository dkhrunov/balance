# ADR-0004: Decimal-safe Money

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/money.md`, `docs/requirements/currency.md`
- **Related code:** `libs/domain` (`Money`), `libs/dto`, Postgres `NUMERIC`

## Контекст

JS `number` (IEEE-754) непригоден для денежных расчётов. Нужна единая модель данных в domain и в БД.

## Решение

- Dto / Domain: `Money = { amount: string; currency: CurrencyCode }` — decimal-safe string amount.
- Арифметика только через domain helpers (`@balance/domain/money`), не через `number`.
- Persist: PostgreSQL `NUMERIC`.
- Валюта счета явная; у пользователя `defaultCurrency` указывается только как default при создании.

## Рассмотренные альтернативы

- **Integer minor units** — возможно, но string+NUMERIC проще для мультивалютной точнисти и уже приняты.
- **decimal.js только на сервере** — FE всё равно нужен безопасный ввод/отображение без float.

## Последствия

### Плюсы

- Нет "молчаливого" каста, float bugs на деньгах.
- Одна абстракция FE ↔ BE ↔ DB.

### Минусы и компромиссы

- Нужна дисциплина не кастовать amount в `number` "для удобства".

### Дальнейшие шаги

- Справочник валют и exchange rates — отдельные задачи.
