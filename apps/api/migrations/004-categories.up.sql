CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
    version int NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_by uuid NOT NULL REFERENCES users(id),
    updated_by uuid NOT NULL REFERENCES users(id),
    deleted_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    CHECK ((deleted_at IS NULL) = (deleted_by IS NULL))
);

CREATE INDEX categories_active_list_idx
    ON categories (type, created_at DESC)
    WHERE deleted_at IS NULL;
