CREATE TABLE transfer_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER_OUT', 'TRANSFER_IN')),
    account_id uuid NOT NULL REFERENCES accounts(id),
    category_id uuid REFERENCES categories(id),
    transfer_group_id uuid REFERENCES transfer_groups(id),
    amount numeric(20, 2) NOT NULL CHECK (amount > 0),
    -- TODO: store currencies in the database instead of hardcoding them here
    currency_code text NOT NULL CHECK (currency_code IN ('RUB', 'USD', 'EUR')),
    transaction_date date NOT NULL,
    description text NOT NULL DEFAULT ''
        CHECK (char_length(description) <= 64),
    version int NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_by uuid NOT NULL REFERENCES users(id),
    updated_by uuid NOT NULL REFERENCES users(id),
    deleted_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CHECK ((deleted_at IS NULL) = (deleted_by IS NULL)),
    CHECK (
        (
            type IN ('INCOME', 'EXPENSE')
            AND category_id IS NOT NULL
            AND transfer_group_id IS NULL
        )
        OR
        (
            type IN ('TRANSFER_OUT', 'TRANSFER_IN')
            AND category_id IS NULL
            AND transfer_group_id IS NOT NULL
        )
    )
);

CREATE INDEX transactions_active_list_idx
    ON transactions (transaction_date DESC, created_at DESC, id DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX transactions_active_account_idx
    ON transactions (account_id, transaction_date DESC, created_at DESC, id DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX transactions_active_created_by_idx
    ON transactions (created_by, transaction_date DESC, created_at DESC, id DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX transactions_transfer_group_idx
    ON transactions (transfer_group_id)
    WHERE transfer_group_id IS NOT NULL;
