import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nx from '@nx/eslint-plugin';
import safeql from '@ts-safeql/eslint-plugin/config';
import { config as loadEnv } from 'dotenv';
import aiGuard from 'eslint-plugin-ai-guard';
import codeComplete from 'eslint-plugin-code-complete';
import deMorgan from 'eslint-plugin-de-morgan';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    deMorgan.configs.recommended,
    sonarjs.configs.recommended,
    {
        ignores: ['**/dist', '**/out-tsc', '**/vite.config.*.timestamp*'],
    },
    ...createSafeqlConfig(),
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
                    // Tag model (set on every project):
                    //   type:  app | feature | ui | data-access | infra | domain | contracts | util
                    //   scope: web | api | shared
                    // Direction (SPEC §63–64 / AGENTS):
                    //   apps → features → ui / data-access → domain ← infra
                    //   contracts: shared wire types (may use domain; never Nest/React)
                    //   scope: web/api only consume same scope + shared; shared stays shared-only
                    depConstraints: [
                        // --- scope (platform isolation) ---
                        {
                            sourceTag: 'scope:web',
                            onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'],
                        },
                        {
                            sourceTag: 'scope:api',
                            onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'],
                        },
                        {
                            sourceTag: 'scope:shared',
                            onlyDependOnLibsWithTags: ['scope:shared'],
                        },
                        // --- type / layer ---
                        {
                            sourceTag: 'type:app',
                            onlyDependOnLibsWithTags: [
                                'type:feature',
                                'type:ui',
                                'type:data-access',
                                'type:infra',
                                'type:domain',
                                'type:contracts',
                                'type:util',
                            ],
                        },
                        {
                            sourceTag: 'type:feature',
                            onlyDependOnLibsWithTags: [
                                'type:feature',
                                'type:ui',
                                'type:data-access',
                                'type:domain',
                                'type:contracts',
                                'type:util',
                            ],
                        },
                        {
                            sourceTag: 'type:ui',
                            onlyDependOnLibsWithTags: [
                                'type:ui',
                                'type:domain',
                                'type:contracts',
                                'type:util',
                            ],
                        },
                        {
                            sourceTag: 'type:data-access',
                            onlyDependOnLibsWithTags: [
                                'type:data-access',
                                'type:domain',
                                'type:contracts',
                                'type:util',
                            ],
                        },
                        {
                            // Nest/Postgres/IndexedDB adapters — implement ports; no feature/UI
                            sourceTag: 'type:infra',
                            onlyDependOnLibsWithTags: [
                                'type:infra',
                                'type:data-access',
                                'type:domain',
                                'type:contracts',
                                'type:util',
                            ],
                        },
                        {
                            sourceTag: 'type:domain',
                            onlyDependOnLibsWithTags: ['type:util'],
                            bannedExternalImports: [
                                'react',
                                'react-dom',
                                'react-router',
                                'react-router-dom',
                                '@carbon/*',
                                '@nestjs/*',
                                'express',
                                'typeorm',
                                'pg',
                                'dexie',
                                'idb',
                            ],
                        },
                        {
                            sourceTag: 'type:contracts',
                            onlyDependOnLibsWithTags: ['type:domain', 'type:util'],
                            bannedExternalImports: [
                                'react',
                                'react-dom',
                                'react-router',
                                'react-router-dom',
                                '@carbon/*',
                                '@nestjs/*',
                                'express',
                                'typeorm',
                                'pg',
                                'dexie',
                                'idb',
                            ],
                        },
                        {
                            sourceTag: 'type:util',
                            onlyDependOnLibsWithTags: ['type:util'],
                            bannedExternalImports: [
                                'react',
                                'react-dom',
                                '@nestjs/*',
                                'express',
                                'typeorm',
                                'pg',
                            ],
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
        rules: {
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                { accessibility: 'explicit' },
            ],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
        plugins: {
            'ai-guard': aiGuard,
            'code-complete': codeComplete,
        },
        rules: {
            ...aiGuard.configs.recommended.rules,
            'code-complete/no-late-argument-usage': 'warn',
            'code-complete/no-late-variable-usage': 'off',
            'code-complete/enforce-meaningful-names': 'error',
            'code-complete/no-magic-numbers-except-zero-one': 'warn',
            'code-complete/no-boolean-params': 'warn',
            'code-complete/low-function-cohesion': 'warn',
        },
    },
];

/**
 * SafeQL: validate SQL against live Postgres (apps/api/.env via dotenv).
 * Postgres should be up when linting files that use sql`...`.
 */
function createSafeqlConfig() {
    const repoRoot = dirname(fileURLToPath(import.meta.url));

    loadEnv({ path: resolve(repoRoot, 'apps/api/.env'), quiet: true });

    const user = process.env.DATABASE_USER;
    const password = process.env.DATABASE_PASSWORD;
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT;
    const name = process.env.DATABASE_NAME;

    if (!user || !password || !host || !port || !name) {
        throw new Error('[Safeql] could not be configured - missing environment variables');
    }

    const databaseUrl = `postgres://${user}:${password}@${host}:${port}/${name}`;

    return [
        {
            files: ['**/*.ts'],
            languageOptions: {
                parserOptions: {
                    projectService: true,
                },
            },
        },
        // Connect to the database using the database URL
        safeql.configs.connections({
            databaseUrl,
            targets: [{ tag: 'sql' }],
        }),
        // Alternative connection: shadow DB from SQL migrations instead of databaseUrl.
        // safeql.configs.connections({
        //     migrationsDir: resolve(repoRoot, 'apps/api/migrations'),
        //     targets: [{ tag: 'sql' }],
        //     // To connect using alternate superuser credentials (default is postgres://postgres:postgres@localhost:5432/postgres)
        //     connectionUrl: `postgres://alternate-user:alternate-password@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/postgres`,
        // }),
    ];
}
