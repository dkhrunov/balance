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

const testEmail = 'auth-integration@example.com';
const testPassword = randomBytes(24).toString('base64url');
const origin = 'http://localhost:4200';

function toCookieHeader(setCookie: string | string[] | undefined): string {
    if (!setCookie) {
        throw new Error('Expected authentication cookies');
    }

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    return cookies.map((cookie) => cookie.split(';', 1)[0]).join('; ');
}

describe('AuthController', () => {
    let app: INestApplication;
    let database: DatabaseService;

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
        const displayName = 'Auth Integration';
        const defaultCurrencyCode = 'RUB';

        await database.getPool().query(sql`
            INSERT INTO users (email, display_name, password_hash, default_currency_code)
            VALUES (${testEmail}, ${displayName}, ${passwordHash}, ${defaultCurrencyCode})
            ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
        `);
    });

    afterAll(async () => {
        await database.getPool().query(sql`DELETE FROM users WHERE email = ${testEmail}`);
        await app.close();
    });

    it('rejects unauthenticated access to the current-user endpoint', async () => {
        await request(app.getHttpServer())
            .get('/api/auth/me')
            .expect(401)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_UNAUTHENTICATED');
            });
    });

    it('logs in, refreshes, and revokes the session on logout', async () => {
        const login = await request(app.getHttpServer())
            .post('/api/auth/login')
            .set('Origin', origin)
            .send({ email: testEmail, password: testPassword })
            .expect(201)
            .expect(({ body }) => {
                expect(body.user.email).toBe(testEmail);
                expect(body.user.passwordHash).toBeUndefined();
            });

        const loginCookies = toCookieHeader(login.headers['set-cookie']);

        await request(app.getHttpServer())
            .get('/api/auth/me')
            .set('Cookie', loginCookies)
            .expect(200)
            .expect(({ body }) => {
                expect(body.user.email).toBe(testEmail);
            });

        const refreshed = await request(app.getHttpServer())
            .post('/api/auth/refresh')
            .set('Origin', origin)
            .set('Cookie', loginCookies)
            .expect(204);

        const refreshedCookies = toCookieHeader(refreshed.headers['set-cookie']);

        await request(app.getHttpServer())
            .post('/api/auth/logout')
            .set('Origin', origin)
            .set('Cookie', refreshedCookies)
            .expect(204);

        await request(app.getHttpServer()).get('/api/auth/me').set('Cookie', refreshedCookies).expect(401);
    });

    it('returns a structured error for invalid credentials', async () => {
        await request(app.getHttpServer())
            .post('/api/auth/login')
            .set('Origin', origin)
            .send({ email: testEmail, password: randomBytes(24).toString('base64url') })
            .expect(401)
            .expect(({ body }) => {
                expect(body.code).toBe('AUTH_INVALID_CREDENTIALS');
            });
    });
});
