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

// Jest cwd is `apps/api`; AppModule resolves `.env` from the workspace root. Load it here
// so ConfigService still sees DATABASE_* (and friends) via process.env.
loadEnv({ path: resolve(__dirname, '../../../../../.env') });

const testEmail = 'preferences-integration@example.com';
const testPassword = randomBytes(24).toString('base64url');
const origin = 'http://localhost:4200';

function toCookieHeader(setCookie: string | string[] | undefined): string {
    if (!setCookie) {
        throw new Error('Expected authentication cookies');
    }

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    return cookies.map((cookie) => cookie.split(';', 1)[0]).join('; ');
}

describe('UsersPreferencesController', () => {
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
        const displayName = 'Preferences Integration';
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
        await database.getPool().query(sql`DELETE FROM users WHERE email = ${testEmail}`);
        await app.close();
    });

    it('rejects unauthenticated access to preferences', async () => {
        await request(app.getHttpServer())
            .get('/api/users/me/preferences')
            .expect(401)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_UNAUTHENTICATED');
            });

        await request(app.getHttpServer())
            .put('/api/users/me/preferences')
            .set('Origin', origin)
            .send({ locale: 'ru', theme: 'dark' })
            .expect(401);
    });

    it('returns default preferences for a new user', async () => {
        await request(app.getHttpServer())
            .get('/api/users/me/preferences')
            .set('Cookie', authCookies)
            .expect(200)
            .expect(({ body }) => {
                expect(body).toEqual({ locale: 'en', theme: 'system' });
            });
    });

    it('updates preferences and returns the same values on GET', async () => {
        await request(app.getHttpServer())
            .put('/api/users/me/preferences')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ locale: 'ru', theme: 'dark' })
            .expect(200)
            .expect(({ body }) => {
                expect(body).toEqual({ locale: 'ru', theme: 'dark' });
            });

        await request(app.getHttpServer())
            .get('/api/users/me/preferences')
            .set('Cookie', authCookies)
            .expect(200)
            .expect(({ body }) => {
                expect(body).toEqual({ locale: 'ru', theme: 'dark' });
            });
    });

    it('rejects preference updates without Origin (CSRF)', async () => {
        await request(app.getHttpServer())
            .put('/api/users/me/preferences')
            .set('Cookie', authCookies)
            .send({ locale: 'en', theme: 'light' })
            .expect(403)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_CSRF_REJECTED');
            });
    });

    it('rejects invalid preference payloads', async () => {
        await request(app.getHttpServer())
            .put('/api/users/me/preferences')
            .set('Origin', origin)
            .set('Cookie', authCookies)
            .send({ locale: 'de', theme: 'dark' })
            .expect(400)
            .expect(({ body }) => {
                expect(body.message).toBeDefined();
            });
    });
});
