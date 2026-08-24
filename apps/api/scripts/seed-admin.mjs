import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import argon2 from 'argon2';
import pg from 'pg';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const apiDirectory = dirname(scriptDirectory);

loadEnv({ path: join(apiDirectory, '.env') });

const email = requiredEnvironment('SEED_ADMIN_EMAIL').trim().toLowerCase();
const password = await argon2.hash(requiredEnvironment('SEED_ADMIN_PASSWORD'), { type: argon2.argon2id });
const displayName = requiredEnvironment('SEED_ADMIN_DISPLAY_NAME').trim();
const defaultCurrencyCode = requiredEnvironment('SEED_ADMIN_DEFAULT_CURRENCY');

if (!isValidEmail(email)) {
    throw new Error('SEED_ADMIN_EMAIL must be a valid email address');
}

if (displayName.length === 0 || displayName.length > 120) {
    throw new Error('SEED_ADMIN_DISPLAY_NAME must be between 1 and 120 characters');
}

// TODO: store currencies in the database instead of hardcoding them here
if (!['RUB', 'USD', 'EUR'].includes(defaultCurrencyCode)) {
    throw new Error('SEED_ADMIN_DEFAULT_CURRENCY must be RUB, USD, or EUR');
}

const pool = new pg.Pool({
    host: requiredEnvironment('DATABASE_HOST'),
    port: Number(requiredEnvironment('DATABASE_PORT')),
    user: requiredEnvironment('DATABASE_USER'),
    password: requiredEnvironment('DATABASE_PASSWORD'),
    database: requiredEnvironment('DATABASE_NAME'),
});

try {
    const result = await pool.query(
        `
            INSERT INTO users (email, display_name, password_hash, default_currency_code)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO NOTHING
        `,
        [email, displayName, password, defaultCurrencyCode],
    );

    console.log(result.rowCount === 1 ? `Created user ${email}` : `User ${email} already exists`);
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

    return atIndex > 0
        && atIndex === value.lastIndexOf('@')
        && domain.includes('.')
        && !value.includes(' ');
}
