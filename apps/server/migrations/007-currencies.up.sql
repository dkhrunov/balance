CREATE TABLE currencies (
    key text PRIMARY KEY,
    symbol text NOT NULL,
    CONSTRAINT currencies_key_check CHECK (key ~ '^[A-Z]{3}$'),
    CONSTRAINT currencies_symbol_check CHECK (char_length(symbol) > 0)
);

INSERT INTO currencies (key, symbol)
VALUES
    ('EUR', '€'),
    ('RUB', '₽'),
    ('USD', '$');

ALTER TABLE accounts
    DROP CONSTRAINT accounts_currency_code_check;

ALTER TABLE accounts
    ADD CONSTRAINT accounts_currency_code_fkey
    FOREIGN KEY (currency_code) REFERENCES currencies (key);

ALTER TABLE transactions
    DROP CONSTRAINT transactions_currency_code_check;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_currency_code_fkey
    FOREIGN KEY (currency_code) REFERENCES currencies (key);

ALTER TABLE users
    DROP CONSTRAINT users_default_currency_code_check;

ALTER TABLE users
    ADD CONSTRAINT users_default_currency_code_fkey
    FOREIGN KEY (default_currency_code) REFERENCES currencies (key);
