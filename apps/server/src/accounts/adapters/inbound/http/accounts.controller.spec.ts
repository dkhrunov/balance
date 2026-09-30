import { randomBytes } from 'node:crypto';
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

const testEmail = 'accounts-integration@example.com';
const testPassword = randomBytes(24).toString('base64url');
const origin = 'http://localhost:4200';

function toCookieHeader(setCookie: string | string[] | undefined): string {
    if (!setCookie) {
        throw new Error('Expected authentication cookies');
    }

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    return cookies.map((cookie) => cookie.split(';', 1)[0]).join('; ');
}

describe('AccountsController', () => {
    let app: INestApplication;
    let database: DatabaseService;
    let authCookies: string;
    let userId: string;

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
        const displayName = 'Accounts Integration';
        const defaultCurrencyCode = 'RUB';

        await database.getPool().query(sql`
            INSERT INTO users (email, display_name, password_hash, default_currency_code)
            VALUES (${testEmail}, ${displayName}, ${passwordHash}, ${defaultCurrencyCode})
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                locale = 'en',
                theme = 'system'
        `);

        const user = await database.getPool().query<{ id: string }>(sql`
            SELECT id FROM users WHERE email = ${testEmail}
        `);
        userId = user.rows[0].id;

        const login = await request(app.getHttpServer())
            .post('/api/auth/login')
            .set('Origin', origin)
            .send({ email: testEmail, password: testPassword })
            .expect(201);

        authCookies = toCookieHeader(login.headers['set-cookie']);
    });

    afterAll(async () => {
        await database.getPool().query(sql`
            DELETE FROM accounts WHERE created_by = ${userId}::uuid
        `);
        await database.getPool().query(sql`DELETE FROM users WHERE email = ${testEmail}`);
        await app.close();
    });

    beforeEach(async () => {
        await database.getPool().query(sql`
            DELETE FROM accounts WHERE created_by = ${userId}::uuid
        `);
    });

    it('rejects unauthenticated access to accounts', async () => {
        await request(app.getHttpServer())
            .get('/api/accounts')
            .expect(401)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_UNAUTHENTICATED');
            });

        await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Origin', origin)
            .send({ name: 'Cash', currency: 'RUB', initialBalance: '0.00' })
            .expect(401);
    });

    it('creates, lists, gets, updates, and soft-deletes an account', async () => {
        const created = await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Cash', currency: 'RUB', initialBalance: '100.5' })
            .expect(201);

        expect(created.body).toMatchObject({
            name: 'Cash',
            icon: 'Wallet',
            currency: 'RUB',
            initialBalance: '100.50',
            version: 1,
            createdBy: userId,
            updatedBy: userId,
            deletedBy: null,
            deletedAt: null,
        });
        expect(created.body.id).toBeDefined();

        const listed = await request(app.getHttpServer()).get('/api/accounts').set('Cookie', authCookies).expect(200);

        expect(listed.body.items).toHaveLength(1);
        expect(listed.body.items[0].id).toBe(created.body.id);

        await request(app.getHttpServer())
            .get(`/api/accounts/${created.body.id}`)
            .set('Cookie', authCookies)
            .expect(200)
            .expect(({ body }) => {
                expect(body.id).toBe(created.body.id);
                expect(body.name).toBe('Cash');
            });

        const updated = await request(app.getHttpServer())
            .put(`/api/accounts/${created.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Wallet', icon: 'CreditCard', version: 1 })
            .expect(200);

        expect(updated.body).toMatchObject({
            name: 'Wallet',
            icon: 'CreditCard',
            version: 2,
            updatedBy: userId,
            currency: 'RUB',
            initialBalance: '100.50',
        });

        const deleted = await request(app.getHttpServer())
            .delete(`/api/accounts/${created.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ version: 2 })
            .expect(200);

        expect(deleted.body).toMatchObject({
            version: 3,
            deletedBy: userId,
        });
        expect(deleted.body.deletedAt).toBeTruthy();

        await request(app.getHttpServer())
            .get('/api/accounts')
            .set('Cookie', authCookies)
            .expect(200)
            .expect(({ body }) => {
                expect(body.items).toHaveLength(0);
            });

        await request(app.getHttpServer())
            .get(`/api/accounts/${created.body.id}`)
            .set('Cookie', authCookies)
            .expect(404)
            .expect(({ body }) => {
                expect(body.code).toBe('ACCOUNT_NOT_FOUND');
            });
    });

    it('rejects stale version on update', async () => {
        const created = await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Bank', currency: 'USD', initialBalance: '0' })
            .expect(201);

        await request(app.getHttpServer())
            .put(`/api/accounts/${created.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Bank 2', icon: 'Wallet', version: 1 })
            .expect(200);

        await request(app.getHttpServer())
            .put(`/api/accounts/${created.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Bank 3', icon: 'Wallet', version: 1 })
            .expect(409)
            .expect(({ body }) => {
                expect(body.code).toBe('ACCOUNT_VERSION_CONFLICT');
            });
    });

    it('rejects create without Origin (CSRF)', async () => {
        await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Cookie', authCookies)
            .send({ name: 'Cash', currency: 'RUB', initialBalance: '0' })
            .expect(403)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_CSRF_REJECTED');
            });
    });

    it('rejects invalid create payloads', async () => {
        await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Cash', currency: 'GBP', initialBalance: '0' })
            .expect(400);

        await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Cash', currency: 'RUB', initialBalance: 'not-a-number' })
            .expect(400)
            .expect(({ body }) => {
                expect(body.code).toBe('ACCOUNT_VALIDATION_FAILED');
            });

        await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Cash', currency: 'RUB', initialBalance: '0', icon: '' })
            .expect(400);
    });

    it('creates an account with an explicit icon', async () => {
        const created = await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Card', currency: 'EUR', initialBalance: '10', icon: 'CreditCard' })
            .expect(201);

        expect(created.body.icon).toBe('CreditCard');
    });
});
