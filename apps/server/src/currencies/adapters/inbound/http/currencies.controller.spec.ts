import { createHash, randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { sql } from '@ts-safeql/sql-tag';
import argon2 from 'argon2';
import { config as loadEnv } from 'dotenv';
import request from 'supertest';
import { AppModule } from '../../../../app/app.module';
import { ApiExceptionFilter } from '../../../../app/api-exception.filter';
import { createValidationPipe } from '../../../../app/create-validation-pipe';
import { DatabaseService } from '../../../../database/database.service';

loadEnv({ path: resolve(__dirname, '../../../../../.env') });

const testEmail = 'currencies-integration@example.com';
const testPassword = randomBytes(24).toString('base64url');
const origin = 'http://localhost:4200';

function toCookieHeader(setCookie: string | string[] | undefined): string {
    if (!setCookie) {
        throw new Error('Expected authentication cookies');
    }

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    return cookies.map((cookie) => cookie.split(';', 1)[0]).join('; ');
}

function expectedVersion(items: readonly { key: string; symbol: string }[]): string {
    const canonical = items.map((item) => `${item.key}|${item.symbol}`).join('\n');

    return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

describe('CurrenciesController', () => {
    let app: INestApplication;
    let database: DatabaseService;
    let authCookies: string;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(createValidationPipe());
        app.useGlobalFilters(new ApiExceptionFilter());
        await app.init();
        database = app.get(DatabaseService);
        const passwordHash = await argon2.hash(testPassword, { type: argon2.argon2id });
        const displayName = 'Currencies Integration';
        const defaultCurrencyCode = 'RUB';

        await database.getPool().query(sql`
            INSERT INTO users (email, display_name, password_hash, default_currency_code)
            VALUES (${testEmail}, ${displayName}, ${passwordHash}, ${defaultCurrencyCode})
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                locale = 'en',
                theme = 'system'
        `);

        const login = await request(app.getHttpServer())
            .post('/api/auth/login')
            .set('Origin', origin)
            .send({ email: testEmail, password: testPassword })
            .expect(201);

        authCookies = toCookieHeader(login.headers['set-cookie']);
    });

    afterAll(async () => {
        await database.getPool().query(sql`
            UPDATE currencies
            SET symbol = '₽'
            WHERE key = 'RUB'
        `);
        await database.getPool().query(sql`DELETE FROM users WHERE email = ${testEmail}`);
        await app.close();
    });

    it('rejects unauthenticated reads and has no write route', async () => {
        await request(app.getHttpServer())
            .get('/api/currencies')
            .expect(401)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_UNAUTHENTICATED');
            });

        await request(app.getHttpServer()).get('/api/currencies/version').expect(401);

        await request(app.getHttpServer()).post('/api/currencies').set('Origin', origin).send({}).expect(404);
    });

    it('returns the seeded dictionary and the same hash from both reads', async () => {
        const catalog = await request(app.getHttpServer())
            .get('/api/currencies')
            .set('Cookie', authCookies)
            .expect(200)
            .expect('Cache-Control', 'no-store');

        expect(catalog.body.items).toEqual([
            { key: 'EUR', symbol: '€' },
            { key: 'RUB', symbol: '₽' },
            { key: 'USD', symbol: '$' },
        ]);
        expect(catalog.body.version).toBe(expectedVersion(catalog.body.items));

        const version = await request(app.getHttpServer())
            .get('/api/currencies/version')
            .set('Cookie', authCookies)
            .expect(200)
            .expect('Cache-Control', 'no-store');

        expect(version.body).toEqual({ version: catalog.body.version });
    });

    it('changes version when a symbol is edited in SQL', async () => {
        const before = await request(app.getHttpServer())
            .get('/api/currencies/version')
            .set('Cookie', authCookies)
            .expect(200);

        await database.getPool().query(sql`
            UPDATE currencies
            SET symbol = 'руб.'
            WHERE key = 'RUB'
        `);

        try {
            const after = await request(app.getHttpServer())
                .get('/api/currencies/version')
                .set('Cookie', authCookies)
                .expect(200);

            expect(after.body.version).not.toBe(before.body.version);

            const catalog = await request(app.getHttpServer())
                .get('/api/currencies')
                .set('Cookie', authCookies)
                .expect(200);

            expect(catalog.body.version).toBe(after.body.version);
            expect(catalog.body.items).toContainEqual({ key: 'RUB', symbol: 'руб.' });
        } finally {
            await database.getPool().query(sql`
                UPDATE currencies
                SET symbol = '₽'
                WHERE key = 'RUB'
            `);
        }
    });
});
