CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE CHECK (email = lower(email)),
    display_name text NOT NULL CHECK (char_length(trim(display_name)) BETWEEN 1 AND 120),
    password_hash text NOT NULL,
    -- TODO: store currencies in the database instead of hardcoding them here
    default_currency_code text NOT NULL CHECK (default_currency_code IN ('RUB', 'USD', 'EUR')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auth_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash char(64) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    absolute_expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    replaced_by_session_id uuid REFERENCES auth_sessions(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (expires_at <= absolute_expires_at)
);

CREATE INDEX auth_sessions_active_token_idx
    ON auth_sessions (refresh_token_hash)
    WHERE revoked_at IS NULL;

CREATE INDEX auth_sessions_user_id_idx ON auth_sessions (user_id);
CREATE INDEX auth_sessions_family_id_idx ON auth_sessions (family_id);
