---
name: raw-postgresql
description: >-
  Write and design PostgreSQL queries with raw `pg` and `@ts-safeql/sql-tag`
  (no ORM). Use when writing, reviewing, or designing SQL queries, repositories,
  migrations, schema changes, or any TypeScript database access against Postgres.
---

# PostgreSQL Data Access

General approach for SQL against PostgreSQL from TypeScript: raw `pg` + SafeQL-tagged queries. Apply when authoring or reviewing queries, repository adapters, or schema migrations.

## Principles

- Use raw `pg`; do not add an ORM (TypeORM, Prisma, Sequelize, etc.).
- In application TypeScript, write parameterized queries with `sql` **from** `@ts-safeql/sql-tag` and type row results explicitly, e.g. `pool.query<UserRow>(sql\`...)`.
- Do not interpolate user input into SQL strings; the tag generates `$1`, `$2`, … placeholders. Never use string-concatenated or untyped SQL in application code when a parameterized `sql`-tag query is appropriate.
- `@ts-safeql/eslint-plugin` validates tagged SQL against the live Postgres schema during lint — keep Postgres up when linting code that uses SafeQL.
- Schema changes belong in versioned SQL migration files only; never alter production schema by hand or from application boot code. Apply migrations through the project’s migrate command.
- **Exceptions:** one-off CLI scripts and migration SQL files may use plain `$1` + values or raw SQL without the `sql`-tag; they are typically not covered by SafeQL lint.

## Query style

### snake_case → camelCase aliases

Store columns in `snake_case`. Project them to the TypeScript row shape with quoted camelCase aliases in `SELECT` / `RETURNING`:

```sql
deleted_at AS "deletedAt",
currency_code AS "currency",
created_by AS "createdBy"
```

### Casts at the parameter / result boundary

Cast parameters and selected values at the SQL boundary so types match the schema and the row type:

```typescript
WHERE id = ${id}::uuid
-- writes
${amount}::numeric
${ids}::uuid[]
```

### NUMERIC and DATE as text in TypeScript

Do not let `pg` return `NUMERIC` (or similar) as a JS `number`. Read money and precise decimals as text; prefer the same for date-only columns when the domain uses strings:

```sql
initial_balance::text AS "initialBalance",
amount::text AS "amount",
transaction_date::text AS "transactionDate"
```

Pass amounts into SQL as strings (or other decimal-safe representation) and cast with `::numeric` on write.

## Migrations

- Ship **paired** files per change: `<name>.up.sql` and `<name>.down.sql`.
- Track applied migrations in a table (e.g. `schema_migrations` with `name` PK and `applied_at`).
- While migrating, take a **session advisory lock** so concurrent migrate processes do not interleave; unlock when finished.
- Apply each pending up (or revert the latest down) inside a transaction: run the SQL file, record/delete the migration name, then `COMMIT`; on failure `ROLLBACK`.
- Migration SQL and the migrate runner use plain `pg` / `$1` (no SafeQL tag).

## Examples

### Application query (read + write)

Covers: `sql` tag, explicit row type, camelCase aliases, `::uuid` / `::numeric` / `::uuid[]` / `::date` casts, NUMERIC and DATE as `::text`, soft-delete filter, optional filter, `RETURNING`.

```typescript
import { sql } from '@ts-safeql/sql-tag';

type AccountRow = {
    id: string;
    name: string;
    currency: string;
    initialBalance: string; // NUMERIC → text
    createdBy: string;
    createdAt: Date; // timestamptz may stay as Date
    deletedAt: Date | null;
};

type TransactionRow = {
    id: string;
    accountId: string;
    amount: string; // NUMERIC → text
    transactionDate: string; // date → text (YYYY-MM-DD)
    createdAt: Date;
};

// Read: aliases + casts on filters; NUMERIC/DATE projected as text
const listed = await pool.query<TransactionRow>(sql`
    SELECT
        id,
        account_id AS "accountId",
        amount::text AS "amount",
        transaction_date::text AS "transactionDate",
        created_at AS "createdAt"
    FROM transactions
    WHERE deleted_at IS NULL
      AND (${accountId}::uuid IS NULL OR account_id = ${accountId}::uuid)
      AND account_id = ANY(${accountIds}::uuid[])
    ORDER BY transaction_date DESC, created_at DESC, id DESC
    LIMIT ${limit}
`);

// Write: string amount / date in → ::numeric / ::date; same projection out via RETURNING
const inserted = await pool.query<TransactionRow>(sql`
    INSERT INTO transactions (
        account_id,
        amount,
        transaction_date,
        created_by,
        updated_by
    )
    VALUES (
        ${input.accountId}::uuid,
        ${input.amount}::numeric,       -- "12.50" (string), not a JS number
        ${input.transactionDate}::date, -- "2026-10-16"
        ${input.actorUserId}::uuid,
        ${input.actorUserId}::uuid
    )
    RETURNING
        id,
        account_id AS "accountId",
        amount::text AS "amount",
        transaction_date::text AS "transactionDate",
        created_at AS "createdAt"
`);

const account = await pool.query<AccountRow>(sql`
    SELECT
        id,
        name,
        currency_code AS "currency",
        initial_balance::text AS "initialBalance",
        created_by AS "createdBy",
        created_at AS "createdAt",
        deleted_at AS "deletedAt"
    FROM accounts
    WHERE id = ${accountId}::uuid
      AND deleted_at IS NULL
`);
```

### Migration pair (plain SQL, no SafeQL)

`003-accounts.up.sql`:

```sql
CREATE TABLE accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    currency_code text NOT NULL,
    initial_balance numeric(20, 2) NOT NULL,
    version int NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_by uuid NOT NULL REFERENCES users (id),
    updated_by uuid NOT NULL REFERENCES users (id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    deleted_by uuid REFERENCES users (id),
    CHECK ((deleted_at IS NULL) = (deleted_by IS NULL))
);

CREATE INDEX accounts_active_idx ON accounts (id) WHERE deleted_at IS NULL;
```

`003-accounts.down.sql`:

```sql
DROP INDEX IF EXISTS accounts_active_idx;
DROP TABLE IF EXISTS accounts;
```

### Migrate runner sketch (plain `pg`, `$1`, advisory lock)

```javascript
await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);
await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
    )
`);

await client.query('BEGIN');
try {
    await client.query(upSql); // contents of <name>.up.sql
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]);
}
```

## Checklist

- [ ] Query uses `sql` from `@ts-safeql/sql-tag` (unless scripts/migrations exception)
- [ ] Row result type is explicit (`pool.query<RowType>(…)`)
- [ ] No string-concatenated user input in SQL
- [ ] Columns projected with camelCase aliases when the row type is camelCase
- [ ] UUID / NUMERIC / arrays cast at the boundary; NUMERIC/DATE read as `::text` when needed
- [ ] Schema change is a paired up/down migration, recorded under advisory lock
- [ ] Postgres is reachable before lint if SafeQL must validate the query
