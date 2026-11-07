# Balance — диаграмма сущностей и связей

Модель данных выведена из [требований](./README.md). Правила для агента: [`AGENTS.md`](../../AGENTS.md).

**Контекст:** одно финансовое пространство (сущностей `Space` / tenant нет); счета пользователям **не принадлежат**; атрибуция живёт на операциях (`created_by`).

---

## 1. Схема

```mermaid
erDiagram
    direction LR

    users }o--|| currencies : default_currency
    currencies ||--o{ accounts : denominated_in
    currencies ||--o{ transactions : amount_in
    users ||--o{ accounts : created
    users ||--o{ categories : created
    users ||--o{ transactions : created_by
    users ||--o{ transactions : updated_by
    users ||--o{ auth_sessions : has
    auth_sessions |o--o| auth_sessions : replaced_by

    accounts ||--o{ transactions : posts_to
    categories ||--o{ transactions : classifies
    transfer_groups ||--|{ transactions : links_legs

    currencies ||--o{ savings_goals : target_in
    currencies ||--o{ debts : denominated_in
    currencies ||--o{ exchange_rates : base
    currencies ||--o{ exchange_rates : quote
    users ||--o{ savings_goals : created
    users ||--o{ debts : created
    users ||--o{ audit_events : actor

    users {
        uuid id PK
        string email UK
        string display_name
        string password_hash
        string default_currency_code FK "currencies.key"
        timestamptz created_at
        timestamptz updated_at
        enum locale "en | ru"
        enum theme "light | dark | system"
        uuid_array account_order
    }

    currencies {
        string key PK "ISO 4217"
        string symbol
    }

    accounts {
        uuid id PK
        string name
        string icon "Carbon icon name, default Wallet"
        string currency_code FK "currencies.key"
        numeric initial_balance
        int version
        uuid created_by FK
        uuid updated_by FK
        uuid deleted_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    categories {
        uuid id PK
        enum type "INCOME | EXPENSE"
        string name
        string icon "Carbon icon name, default Wallet"
        string color "Carbon tag key, default blue"
        int version
        uuid created_by FK
        uuid updated_by FK
        uuid deleted_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    transfer_groups {
        uuid id PK
        timestamptz created_at
    }

    transactions {
        uuid id PK
        enum type "INCOME | EXPENSE | TRANSFER_OUT | TRANSFER_IN"
        uuid account_id FK
        uuid category_id FK "nullable for transfers"
        uuid transfer_group_id FK "required for transfer legs"
        numeric amount
        string currency_code FK "currencies.key"
        date transaction_date
        string description "optional, max 64"
        int version
        uuid created_by FK
        uuid updated_by FK
        uuid deleted_by FK
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    auth_sessions {
        uuid id PK
        uuid family_id
        uuid user_id FK
        string refresh_token_hash UK "char(64)"
        timestamptz expires_at
        timestamptz absolute_expires_at
        timestamptz revoked_at
        uuid replaced_by_session_id FK "self, nullable"
        timestamptz created_at
    }

    schema_migrations {
        string name PK
        timestamptz applied_at
    }

    savings_goals {
        uuid id PK
        string name
        numeric target_amount
        string currency_code FK
        numeric current_amount
        date deadline
        enum status "ACTIVE | COMPLETED | CANCELLED"
        uuid created_by FK
        int version
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    exchange_rates {
        uuid id PK
        string base_currency_code FK
        string quote_currency_code FK
        numeric rate
        timestamptz effective_at
        string source
        timestamptz created_at
    }

    debts {
        uuid id PK
        enum debtType "LOAN | INSTALLMENT | MORTGAGE | CREDIT"
        string name
        numeric principal
        numeric remaining
        numeric interest_rate
        string currency_code FK
        enum status
        uuid created_by FK
        int version
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    audit_events {
        uuid id PK
        uuid actor_user_id FK
        string entity_type
        uuid entity_id
        enum operation
        json beforeState
        json afterState
        timestamptz created_at
    }
```

### Модель перевода

Перевод — это **две связанные строки** в `transactions` с общим `transfer_group_id`:

```text
Account A (USD)  --TRANSFER_OUT-->  transferGroupId = X
Account B (USD)  --TRANSFER_IN-->   transferGroupId = X
```

Создание перевода выполняется в **одной транзакции PostgreSQL** ([`idempotency-concurrency.md`](./idempotency-concurrency.md)): обе ноги атомарны.

У ног перевода `category_id` равен `NULL`. Суммы всегда положительные; направление закодировано в `type`.

---

## 2. Мощность связей и ограничения

| Связь                                                   | Мощность связи | Примечание                                                                                                 |
| ------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| users → auth_sessions                                   | 1:N            | `auth_sessions.user_id`; удаление пользователя удаляет его сессии                                          |
| auth_sessions → auth_sessions                           | 0..1           | `replaced_by_session_id`, смена refresh-токена внутри `family_id`                                          |
| schema_migrations                                       | —              | Журнал миграций, без связей с доменными таблицами                                                          |
| users → transactions                                    | 1:N            | `created_by` — атрибуция, а не владение счётом                                                             |
| accounts → transactions                                 | 1:N            | Баланс выводится из операций по счёту                                                                      |
| categories → transactions                               | 1:N            | Только INCOME/EXPENSE; у transfer `category_id = NULL`                                                     |
| transfer_groups → transactions                          | 1:2            | Ровно две ноги на перевод                                                                                  |
| currencies → accounts / transactions / users            | 1:N            | FK на `currencies.key` (ISO 4217). Колонки справочника: `key`, `symbol`. Названия и точности в таблице нет |
| users → savings_goals / debts                           | 1:N            | `created_by`                                                                |
| currencies → savings_goals / debts / exchange_rates     | 1:N            | Суммы целей и долгов и курсы ссылаются на `currencies.key`                 |
| users → audit_events                                    | 1:N            | `actor_user_id`                                                             |

---

## 3. Рекомендуемые индексы

```text
transactions: account_id, category_id, created_by, transaction_date, deleted_at
accounts:     deleted_at, currency_code
categories:   type, deleted_at
auth_sessions: user_id, family_id, refresh_token_hash (активные, revoked_at IS NULL)
```

---

## 4. Намеренно исключено

| Сущность                       | Причина                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Budget / лимиты расходов       | Вне scope ([`scope.md`](./scope.md))                                                        |
| Space / Tenant / AccountMember | Решение не принято ([`multi-user.md`](./multi-user.md))                                    |
| Event Sourcing                 | Не нужен; предпочтительны состояние и журнал изменений ([`principles.md`](./principles.md)) |
