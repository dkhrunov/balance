CREATE TABLE accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
    icon text NOT NULL DEFAULT 'Wallet'
        CHECK (char_length(icon) BETWEEN 1 AND 64),
    -- TODO: store currencies in the database instead of hardcoding them here
    currency_code text NOT NULL CHECK (currency_code IN ('RUB', 'USD', 'EUR')),
    initial_balance numeric(20, 2) NOT NULL,
    version int NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_by uuid NOT NULL REFERENCES users(id),
    updated_by uuid NOT NULL REFERENCES users(id),
    deleted_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CHECK ((deleted_at IS NULL) = (deleted_by IS NULL))
);

CREATE INDEX accounts_active_list_idx
    ON accounts (created_at DESC)
    WHERE deleted_at IS NULL;
