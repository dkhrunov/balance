import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import argon2 from 'argon2';
import pg from 'pg';
import { resolveSeedCategoriesLocale, seedDefaultCategories } from './seed-default-categories.mjs';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const serverDirectory = dirname(scriptDirectory);

loadEnv({ path: join(serverDirectory, '.env') });

const email = requiredEnvironment('SEED_ADMIN_EMAIL').trim().toLowerCase();
const password = await argon2.hash(requiredEnvironment('SEED_ADMIN_PASSWORD'), { type: argon2.argon2id });
const displayName = requiredEnvironment('SEED_ADMIN_DISPLAY_NAME').trim();
const defaultCurrencyCode = requiredEnvironment('SEED_ADMIN_DEFAULT_CURRENCY');

if (!isValidEmail(email)) {
    throw new Error('SEED_ADMIN_EMAIL must be a valid email address');
}

// Keep display-name bounds in sync with libs/dto users constraints.
const DISPLAY_NAME_MIN_LENGTH = 1;
const DISPLAY_NAME_MAX_LENGTH = 120;

if (displayName.length < DISPLAY_NAME_MIN_LENGTH || displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    throw new Error(
        `SEED_ADMIN_DISPLAY_NAME must be between ${DISPLAY_NAME_MIN_LENGTH} and ${DISPLAY_NAME_MAX_LENGTH} characters`,
    );
}

if (!/^[A-Z]{3}$/.test(defaultCurrencyCode)) {
    throw new Error('SEED_ADMIN_DEFAULT_CURRENCY must be an ISO 4217 code');
}

const pool = new pg.Pool({
    host: requiredEnvironment('DATABASE_HOST'),
    port: Number(requiredEnvironment('DATABASE_PORT')),
    user: requiredEnvironment('DATABASE_USER'),
    password: requiredEnvironment('DATABASE_PASSWORD'),
    database: requiredEnvironment('DATABASE_NAME'),
});

try {
    const currency = await pool.query('SELECT key FROM currencies WHERE key = $1', [defaultCurrencyCode]);

    if (currency.rowCount !== 1) {
        throw new Error(`SEED_ADMIN_DEFAULT_CURRENCY must be a key in currencies (got ${defaultCurrencyCode})`);
    }

    const result = await pool.query(
        `
            INSERT INTO users (email, display_name, password_hash, default_currency_code)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `,
        [email, displayName, password, defaultCurrencyCode],
    );

    console.log(result.rowCount === 1 ? `Created user ${email}` : `User ${email} already exists`);

    const userId =
        result.rows[0]?.id ?? (await pool.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email])).rows[0]?.id;

    if (!userId) {
        throw new Error(`Could not resolve user id for ${email}`);
    }

    const locale = resolveSeedCategoriesLocale();
    const { created, skipped } = await seedDefaultCategories(pool, userId, locale);
    console.log(`Default categories (${locale}): created ${created}, already present ${skipped}`);
} finally {
    await pool.end();
}

function requiredEnvironment(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function isValidEmail(value) {
    const atIndex = value.indexOf('@');
    const domain = value.slice(atIndex + 1);

    return atIndex > 0 && atIndex === value.lastIndexOf('@') && domain.includes('.') && !value.includes(' ');
}
