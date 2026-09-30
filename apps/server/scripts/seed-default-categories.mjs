import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import pg from 'pg';

/** Locales supported for default category names (keep in sync with `@balance/contracts` LOCALES). */
export const SEED_CATEGORY_LOCALES = ['en', 'ru'];

/**
 * Shared-space default categories (SPEC §17).
 * Names are user data for the space — pick language via `SEED_CATEGORIES_LOCALE`, not UI i18n.
 */
const DEFAULT_EXPENSE_CATEGORY_DEFS = [
    {
        icon: 'Restaurant',
        names: { en: 'Food', ru: 'Еда' },
    },
    {
        icon: 'Hospital',
        names: { en: 'Health', ru: 'Здоровье' },
    },
    {
        icon: 'PedestrianChild',
        names: { en: 'Child', ru: 'Ребенок' },
    },
    {
        icon: 'Home',
        names: { en: 'Home', ru: 'Дом' },
    },
    {
        icon: 'Car',
        names: { en: 'Transport', ru: 'Транспорт' },
    },
    {
        icon: 'Theater',
        names: { en: 'Entertainment', ru: 'Развлечения' },
    },
    {
        icon: 'Tools',
        names: { en: 'Services', ru: 'Услуги' },
    },
    {
        icon: 'ShoppingBag',
        names: { en: 'Clothing', ru: 'Одежда' },
    },
    {
        icon: 'Gift',
        names: { en: 'Gifts', ru: 'Подарки' },
    },
    {
        icon: 'ShoppingCart',
        names: { en: 'Shopping', ru: 'Покупки' },
    },
];

const DEFAULT_INCOME_CATEGORY_DEFS = [
    {
        icon: 'Wallet',
        names: { en: 'Salary', ru: 'Зарплата' },
    },
];

/**
 * Resolves the seed locale from `SEED_CATEGORIES_LOCALE` (default `en`).
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {'en' | 'ru'}
 */
export function resolveSeedCategoriesLocale(env = process.env) {
    const raw = env.SEED_CATEGORIES_LOCALE?.trim().toLowerCase();

    if (!raw) {
        return 'en';
    }

    if (!SEED_CATEGORY_LOCALES.includes(raw)) {
        throw new Error(`SEED_CATEGORIES_LOCALE must be ${SEED_CATEGORY_LOCALES.join(' or ')} (got ${raw})`);
    }

    return raw;
}

/**
 * Maps category definitions to localized `{ name, icon }` rows.
 *
 * @param {readonly { icon: string, names: Record<'en' | 'ru', string> }[]} definitions
 * @param {'en' | 'ru'} locale
 * @returns {readonly { name: string, icon: string }[]}
 */
function categoriesForLocale(definitions, locale) {
    return definitions.map((definition) => ({
        name: definition.names[locale],
        icon: definition.icon,
    }));
}

/**
 * Default expense categories for the given seed locale.
 *
 * @param {'en' | 'ru'} locale
 * @returns {readonly { name: string, icon: string }[]}
 */
export function defaultExpenseCategoriesForLocale(locale) {
    return categoriesForLocale(DEFAULT_EXPENSE_CATEGORY_DEFS, locale);
}

/**
 * Default income categories for the given seed locale.
 *
 * @param {'en' | 'ru'} locale
 * @returns {readonly { name: string, icon: string }[]}
 */
export function defaultIncomeCategoriesForLocale(locale) {
    return categoriesForLocale(DEFAULT_INCOME_CATEGORY_DEFS, locale);
}

/**
 * Inserts missing default categories for the single financial space.
 * Idempotent: skips names that already exist among active categories of the same type.
 * Changing locale and re-running does not rename existing rows; it may insert
 * the other language’s names if they are absent.
 *
 * @param {import('pg').Pool} pool
 * @param {string} actorUserId uuid used for created_by / updated_by
 * @param {'en' | 'ru'} [locale]
 * @returns {Promise<{ created: number, skipped: number, locale: 'en' | 'ru' }>}
 */
export async function seedDefaultCategories(pool, actorUserId, locale = resolveSeedCategoriesLocale()) {
    const batches = [
        { type: 'EXPENSE', categories: defaultExpenseCategoriesForLocale(locale) },
        { type: 'INCOME', categories: defaultIncomeCategoriesForLocale(locale) },
    ];
    let created = 0;
    let skipped = 0;

    for (const batch of batches) {
        for (const category of batch.categories) {
            const result = await pool.query(
                `
                    INSERT INTO categories (type, name, icon, created_by, updated_by)
                    SELECT $1, $2, $3, $4::uuid, $4::uuid
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM categories
                        WHERE type = $1
                          AND name = $2
                          AND deleted_at IS NULL
                    )
                `,
                [batch.type, category.name, category.icon, actorUserId],
            );

            if (result.rowCount === 1) {
                created += 1;
            } else {
                skipped += 1;
            }
        }
    }

    return { created, skipped, locale };
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
    const scriptDirectory = dirname(fileURLToPath(import.meta.url));
    const serverDirectory = dirname(scriptDirectory);

    loadEnv({ path: join(serverDirectory, '.env') });

    const locale = resolveSeedCategoriesLocale();
    const pool = new pg.Pool({
        host: requiredEnvironment('DATABASE_HOST'),
        port: Number(requiredEnvironment('DATABASE_PORT')),
        user: requiredEnvironment('DATABASE_USER'),
        password: requiredEnvironment('DATABASE_PASSWORD'),
        database: requiredEnvironment('DATABASE_NAME'),
    });

    try {
        const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
        const userResult = email
            ? await pool.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email])
            : await pool.query(`SELECT id FROM users ORDER BY created_at ASC LIMIT 1`);

        if (userResult.rowCount === 0) {
            throw new Error(
                email
                    ? `No user with email ${email}; run npm run db:seed:admin first`
                    : 'No users in database; run npm run db:seed:admin first',
            );
        }

        const actorUserId = userResult.rows[0].id;
        const { created, skipped } = await seedDefaultCategories(pool, actorUserId, locale);

        console.log(
            `Default categories (${locale}): created ${created}, already present ${skipped} (actor ${actorUserId})`,
        );
    } finally {
        await pool.end();
    }
}

function requiredEnvironment(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}
