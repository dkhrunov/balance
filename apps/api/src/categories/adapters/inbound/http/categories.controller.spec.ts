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

const testEmail = 'categories-integration@example.com';
const testPassword = randomBytes(24).toString('base64url');
const origin = 'http://localhost:4200';

function toCookieHeader(setCookie: string | string[] | undefined): string {
    if (!setCookie) {
        throw new Error('Expected authentication cookies');
    }

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    return cookies.map((cookie) => cookie.split(';', 1)[0]).join('; ');
}

describe('CategoriesController', () => {
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
        const displayName = 'Categories Integration';
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
            DELETE FROM categories WHERE created_by = ${userId}::uuid
        `);
        await database.getPool().query(sql`DELETE FROM users WHERE email = ${testEmail}`);
        await app.close();
    });

    beforeEach(async () => {
        await database.getPool().query(sql`
            DELETE FROM categories WHERE created_by = ${userId}::uuid
        `);
    });

    it('rejects unauthenticated access to categories', async () => {
        await request(app.getHttpServer())
            .get('/api/categories')
            .expect(401)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_UNAUTHENTICATED');
            });

        await request(app.getHttpServer())
            .post('/api/categories')
            .set('Origin', origin)
            .send({ type: 'EXPENSE', name: 'Food' })
            .expect(401);
    });

    it('creates, lists, filters by type, updates, and soft-deletes a category', async () => {
        const createdExpense = await request(app.getHttpServer())
            .post('/api/categories')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ type: 'EXPENSE', name: 'Food' })
            .expect(201);

        expect(createdExpense.body).toMatchObject({
            type: 'EXPENSE',
            name: 'Food',
            icon: 'Wallet',
            version: 1,
            createdBy: userId,
            updatedBy: userId,
            deletedBy: null,
            deletedAt: null,
        });

        const createdIncome = await request(app.getHttpServer())
            .post('/api/categories')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ type: 'INCOME', name: 'Salary', icon: 'Money' })
            .expect(201);

        expect(createdIncome.body.icon).toBe('Money');

        const listed = await request(app.getHttpServer())
            .get('/api/categories')
            .set('Cookie', authCookies)
            .expect(200);

        expect(listed.body.items).toHaveLength(2);

        const expensesOnly = await request(app.getHttpServer())
            .get('/api/categories')
            .query({ type: 'EXPENSE' })
            .set('Cookie', authCookies)
            .expect(200);

        expect(expensesOnly.body.items).toHaveLength(1);
        expect(expensesOnly.body.items[0].id).toBe(createdExpense.body.id);

        await request(app.getHttpServer())
            .get(`/api/categories/${createdExpense.body.id}`)
            .set('Cookie', authCookies)
            .expect(200)
            .expect(({ body }) => {
                expect(body.name).toBe('Food');
                expect(body.type).toBe('EXPENSE');
            });

        const updated = await request(app.getHttpServer())
            .put(`/api/categories/${createdExpense.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Groceries', icon: 'ShoppingCart', version: 1 })
            .expect(200);

        expect(updated.body).toMatchObject({
            name: 'Groceries',
            icon: 'ShoppingCart',
            type: 'EXPENSE',
            version: 2,
        });

        const deleted = await request(app.getHttpServer())
            .delete(`/api/categories/${createdExpense.body.id}`)
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
            .get('/api/categories')
            .set('Cookie', authCookies)
            .expect(200)
            .expect(({ body }) => {
                expect(body.items).toHaveLength(1);
                expect(body.items[0].id).toBe(createdIncome.body.id);
            });

        await request(app.getHttpServer())
            .get(`/api/categories/${createdExpense.body.id}`)
            .set('Cookie', authCookies)
            .expect(404)
            .expect(({ body }) => {
                expect(body.code).toBe('CATEGORY_NOT_FOUND');
            });
    });

    it('rejects stale version on update', async () => {
        const created = await request(app.getHttpServer())
            .post('/api/categories')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ type: 'INCOME', name: 'Bonus' })
            .expect(201);

        await request(app.getHttpServer())
            .put(`/api/categories/${created.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Bonus 2', icon: 'Money', version: 1 })
            .expect(200);

        await request(app.getHttpServer())
            .put(`/api/categories/${created.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Bonus 3', icon: 'Money', version: 1 })
            .expect(409)
            .expect(({ body }) => {
                expect(body.code).toBe('CATEGORY_VERSION_CONFLICT');
            });
    });

    it('rejects create without Origin (CSRF)', async () => {
        await request(app.getHttpServer())
            .post('/api/categories')
            .set('Cookie', authCookies)
            .send({ type: 'EXPENSE', name: 'Food' })
            .expect(403)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_CSRF_REJECTED');
            });
    });

    it('rejects invalid create payloads and type filter', async () => {
        await request(app.getHttpServer())
            .post('/api/categories')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ type: 'TRANSFER', name: 'Food' })
            .expect(400);

        await request(app.getHttpServer())
            .get('/api/categories')
            .query({ type: 'TRANSFER' })
            .set('Cookie', authCookies)
            .expect(400)
            .expect(({ body }) => {
                expect(body.code).toBe('CATEGORY_VALIDATION_FAILED');
            });
    });
});
