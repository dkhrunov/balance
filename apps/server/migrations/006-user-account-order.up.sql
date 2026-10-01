ALTER TABLE users
    ADD COLUMN account_order uuid[] NOT NULL DEFAULT '{}';
