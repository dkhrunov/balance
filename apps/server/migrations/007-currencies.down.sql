ALTER TABLE users
    DROP CONSTRAINT users_default_currency_code_fkey;

ALTER TABLE transactions
    DROP CONSTRAINT transactions_currency_code_fkey;

ALTER TABLE accounts
    DROP CONSTRAINT accounts_currency_code_fkey;

ALTER TABLE accounts
    ADD CONSTRAINT accounts_currency_code_check
    CHECK (currency_code IN ('RUB', 'USD', 'EUR'));

ALTER TABLE transactions
    ADD CONSTRAINT transactions_currency_code_check
    CHECK (currency_code IN ('RUB', 'USD', 'EUR'));

ALTER TABLE users
    ADD CONSTRAINT users_default_currency_code_check
    CHECK (default_currency_code IN ('RUB', 'USD', 'EUR'));

DROP TABLE currencies;
