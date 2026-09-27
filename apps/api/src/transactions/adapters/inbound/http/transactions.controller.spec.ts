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

const testEmail = 'transactions-integration@example.com';
const otherEmail = 'transactions-other@example.com';
const testPassword = randomBytes(24).toString('base64url');
const origin = 'http://localhost:4200';

function toCookieHeader(setCookie: string | string[] | undefined): string {
    if (!setCookie) {
        throw new Error('Expected authentication cookies');
    }

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    return cookies.map((cookie) => cookie.split(';', 1)[0]).join('; ');
}

describe('TransactionsController', () => {
    let app: INestApplication;
    let database: DatabaseService;
    let authCookies: string;
    let otherCookies: string;
    let userId: string;
    let otherUserId: string;
    let accountId: string;
    let incomeCategoryId: string;
    let expenseCategoryId: string;

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

        await database.getPool().query(sql`
            INSERT INTO users (email, display_name, password_hash, default_currency_code)
            VALUES
                (${testEmail}, ${'Transactions Integration'}, ${passwordHash}, ${'RUB'}),
                (${otherEmail}, ${'Transactions Other'}, ${passwordHash}, ${'RUB'})
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                locale = 'en',
                theme = 'system'
        `);

        const users = await database.getPool().query<{ id: string; email: string }>(sql`
            SELECT id, email FROM users WHERE email IN (${testEmail}, ${otherEmail})
        `);
        userId = users.rows.find((row) => row.email === testEmail)!.id;
        otherUserId = users.rows.find((row) => row.email === otherEmail)!.id;

        const login = await request(app.getHttpServer())
            .post('/api/auth/login')
            .set('Origin', origin)
            .send({ email: testEmail, password: testPassword })
            .expect(201);
        authCookies = toCookieHeader(login.headers['set-cookie']);

        const otherLogin = await request(app.getHttpServer())
            .post('/api/auth/login')
            .set('Origin', origin)
            .send({ email: otherEmail, password: testPassword })
            .expect(201);
        otherCookies = toCookieHeader(otherLogin.headers['set-cookie']);

        const account = await request(app.getHttpServer())
            .post('/api/accounts')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ name: 'Cash', currency: 'RUB', initialBalance: '100.00' })
            .expect(201);
        accountId = account.body.id;

        const incomeCategory = await request(app.getHttpServer())
            .post('/api/categories')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ type: 'INCOME', name: 'Salary' })
            .expect(201);
        incomeCategoryId = incomeCategory.body.id;

        const expenseCategory = await request(app.getHttpServer())
            .post('/api/categories')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ type: 'EXPENSE', name: 'Food' })
            .expect(201);
        expenseCategoryId = expenseCategory.body.id;
    });

    afterAll(async () => {
        await database.getPool().query(sql`
            DELETE FROM transactions
            WHERE created_by IN (${userId}::uuid, ${otherUserId}::uuid)
        `);
        await database.getPool().query(sql`
            DELETE FROM categories WHERE created_by = ${userId}::uuid
        `);
        await database.getPool().query(sql`
            DELETE FROM accounts WHERE created_by = ${userId}::uuid
        `);
        await database.getPool().query(sql`
            DELETE FROM users WHERE email IN (${testEmail}, ${otherEmail})
        `);
        await app.close();
    });

    beforeEach(async () => {
        await database.getPool().query(sql`
            DELETE FROM transactions
            WHERE created_by IN (${userId}::uuid, ${otherUserId}::uuid)
        `);
    });

    it('rejects unauthenticated access', async () => {
        await request(app.getHttpServer())
            .get('/api/transactions')
            .expect(401)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_UNAUTHENTICATED');
            });
    });

    it('creates, lists, gets, filters, paginates, and soft-deletes transactions', async () => {
        const income = await request(app.getHttpServer())
            .post('/api/transactions')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({
                type: 'INCOME',
                accountId,
                categoryId: incomeCategoryId,
                amount: '50.5',
                currency: 'RUB',
                transactionDate: '2026-09-01',
                description: 'Paycheck',
            })
            .expect(201);

        expect(income.body).toMatchObject({
            type: 'INCOME',
            accountId,
            categoryId: incomeCategoryId,
            amount: '50.50',
            currency: 'RUB',
            transactionDate: '2026-09-01',
            description: 'Paycheck',
            version: 1,
            createdBy: userId,
            deletedAt: null,
        });

        const expense = await request(app.getHttpServer())
            .post('/api/transactions')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({
                type: 'EXPENSE',
                accountId,
                categoryId: expenseCategoryId,
                amount: '10',
                currency: 'RUB',
                transactionDate: '2026-09-02',
            })
            .expect(201);

        await request(app.getHttpServer())
            .post('/api/transactions')
            .set('Origin', origin)
            .set('Cookie', otherCookies)
            .send({
                type: 'EXPENSE',
                accountId,
                categoryId: expenseCategoryId,
                amount: '3',
                currency: 'RUB',
                transactionDate: '2026-09-03',
                description: 'Other user',
            })
            .expect(201);

        const all = await request(app.getHttpServer())
            .get('/api/transactions')
            .set('Cookie', authCookies)
            .expect(200);

        expect(all.body.items).toHaveLength(3);
        expect(all.body.nextCursor).toBeNull();

        const mine = await request(app.getHttpServer())
            .get('/api/transactions?createdBy=me')
            .set('Cookie', authCookies)
            .expect(200);

        expect(mine.body.items).toHaveLength(2);
        expect(mine.body.items.every((item: { createdBy: string }) => item.createdBy === userId)).toBe(
            true,
        );

        const byUsers = await request(app.getHttpServer())
            .get(`/api/transactions?createdBy=${otherUserId}`)
            .set('Cookie', authCookies)
            .expect(200);

        expect(byUsers.body.items).toHaveLength(1);
        expect(byUsers.body.items[0].createdBy).toBe(otherUserId);

        const expenses = await request(app.getHttpServer())
            .get('/api/transactions?type=EXPENSE&createdBy=me')
            .set('Cookie', authCookies)
            .expect(200);

        expect(expenses.body.items).toHaveLength(1);
        expect(expenses.body.items[0].id).toBe(expense.body.id);

        const page1 = await request(app.getHttpServer())
            .get('/api/transactions?limit=2')
            .set('Cookie', authCookies)
            .expect(200);

        expect(page1.body.items).toHaveLength(2);
        expect(page1.body.nextCursor).toBeTruthy();

        const page2 = await request(app.getHttpServer())
            .get(`/api/transactions?limit=2&cursor=${encodeURIComponent(page1.body.nextCursor)}`)
            .set('Cookie', authCookies)
            .expect(200);

        expect(page2.body.items).toHaveLength(1);
        expect(page2.body.nextCursor).toBeNull();

        await request(app.getHttpServer())
            .get(`/api/transactions/${income.body.id}`)
            .set('Cookie', authCookies)
            .expect(200)
            .expect(({ body }) => {
                expect(body.id).toBe(income.body.id);
            });

        const deleted = await request(app.getHttpServer())
            .delete(`/api/transactions/${income.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ version: 1 })
            .expect(200);

        expect(deleted.body).toMatchObject({
            version: 2,
            deletedBy: userId,
        });
        expect(deleted.body.deletedAt).toBeTruthy();

        await request(app.getHttpServer())
            .get(`/api/transactions/${income.body.id}`)
            .set('Cookie', authCookies)
            .expect(404)
            .expect(({ body }) => {
                expect(body.code).toBe('TRANSACTION_NOT_FOUND');
            });
    });

    it('rejects category type mismatch and currency mismatch', async () => {
        await request(app.getHttpServer())
            .post('/api/transactions')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({
                type: 'INCOME',
                accountId,
                categoryId: expenseCategoryId,
                amount: '10',
                currency: 'RUB',
                transactionDate: '2026-09-01',
            })
            .expect(400)
            .expect(({ body }) => {
                expect(body.code).toBe('TRANSACTION_CATEGORY_TYPE_MISMATCH');
            });

        await request(app.getHttpServer())
            .post('/api/transactions')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({
                type: 'EXPENSE',
                accountId,
                categoryId: expenseCategoryId,
                amount: '10',
                currency: 'USD',
                transactionDate: '2026-09-01',
            })
            .expect(400)
            .expect(({ body }) => {
                expect(body.code).toBe('TRANSACTION_CURRENCY_MISMATCH');
            });
    });

    it('rejects create without Origin (CSRF)', async () => {
        await request(app.getHttpServer())
            .post('/api/transactions')
            .set('Cookie', authCookies)
            .send({
                type: 'EXPENSE',
                accountId,
                categoryId: expenseCategoryId,
                amount: '1',
                currency: 'RUB',
                transactionDate: '2026-09-01',
            })
            .expect(403)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_CSRF_REJECTED');
            });
    });

    it('rejects stale version on delete', async () => {
        const created = await request(app.getHttpServer())
            .post('/api/transactions')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({
                type: 'EXPENSE',
                accountId,
                categoryId: expenseCategoryId,
                amount: '1',
                currency: 'RUB',
                transactionDate: '2026-09-01',
            })
            .expect(201);

        await request(app.getHttpServer())
            .delete(`/api/transactions/${created.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ version: 1 })
            .expect(200);

        await request(app.getHttpServer())
            .delete(`/api/transactions/${created.body.id}`)
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ version: 1 })
            .expect(404);
    });
});
