ALTER TABLE users
    ADD COLUMN locale text NOT NULL DEFAULT 'en'
        CHECK (locale IN ('en', 'ru')),
    ADD COLUMN theme text NOT NULL DEFAULT 'system'
        CHECK (theme IN ('light', 'dark', 'system'));
