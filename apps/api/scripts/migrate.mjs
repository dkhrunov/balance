import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import pg from 'pg';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const apiDirectory = dirname(scriptDirectory);
const migrationsDirectory = join(apiDirectory, 'migrations');
const isDown = process.argv.includes('--down');

loadEnv({ path: join(apiDirectory, '.env') });

const pool = new pg.Pool({
    host: requiredEnvironment('DATABASE_HOST'),
    port: Number(requiredEnvironment('DATABASE_PORT')),
    user: requiredEnvironment('DATABASE_USER'),
    password: requiredEnvironment('DATABASE_PASSWORD'),
    database: requiredEnvironment('DATABASE_NAME'),
});

try {
    const client = await pool.connect();

    try {
        await client.query('SELECT pg_advisory_lock($1)', [893037]);
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                name text PRIMARY KEY,
                applied_at timestamptz NOT NULL DEFAULT now()
            )
        `);

        if (isDown) {
            await revertLatestMigration(client);
        } else {
            await applyPendingMigrations(client);
        }
    } finally {
        await client.query('SELECT pg_advisory_unlock($1)', [893037]);
        client.release();
    }
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

async function getMigrationNames() {
    const entries = await readdir(migrationsDirectory);

    return entries
        .filter((entry) => entry.endsWith('.up.sql'))
        .map((entry) => entry.slice(0, -'.up.sql'.length))
        .sort();
}

async function applyPendingMigrations(client) {
    const migrationNames = await getMigrationNames();
    const applied = await client.query('SELECT name FROM schema_migrations');
    const appliedNames = new Set(applied.rows.map((row) => row.name));

    for (const migrationName of migrationNames) {
        if (appliedNames.has(migrationName)) {
            continue;
        }

        const migrationSql = await readFile(join(migrationsDirectory, `${migrationName}.up.sql`), 'utf8');

        await client.query('BEGIN');
        try {
            await client.query(migrationSql);
            await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migrationName]);
            await client.query('COMMIT');
            console.log(`Applied migration ${migrationName}`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
    }
}

async function revertLatestMigration(client) {
    const result = await client.query(
        'SELECT name FROM schema_migrations ORDER BY applied_at DESC, name DESC LIMIT 1',
    );
    const migrationName = result.rows[0]?.name;

    if (!migrationName) {
        console.log('No migrations to revert');
        return;
    }

    const migrationSql = await readFile(join(migrationsDirectory, `${migrationName}.down.sql`), 'utf8');

    await client.query('BEGIN');
    try {
        await client.query(migrationSql);
        await client.query('DELETE FROM schema_migrations WHERE name = $1', [migrationName]);
        await client.query('COMMIT');
        console.log(`Reverted migration ${migrationName}`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}
