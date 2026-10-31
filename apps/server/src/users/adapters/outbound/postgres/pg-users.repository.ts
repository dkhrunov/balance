import { sql } from '@ts-safeql/sql-tag';
import { Injectable } from '@nestjs/common';
import { LOCALES, Locale, THEMES, Theme } from '@balance/dto/users';
import { DatabaseService } from '../../../../database/database.service';
import { UserAccount } from '../../../application/models/user-account';
import { UserPreferencesModel } from '../../../application/models/user-preferences';
import { IUsersRepository } from '../../../application/ports/outbound/users.repository';
import { UserPreferencesRecord, UserRecord } from './records/user.record';

@Injectable()
export class PgUsersRepository implements IUsersRepository {
    public constructor(private readonly database: DatabaseService) {}

    public async findByEmail(email: string): Promise<UserAccount | null> {
        const result = await this.database.getPool().query<UserRecord>(sql`
            SELECT
                id,
                email,
                display_name AS "displayName",
                password_hash AS "passwordHash",
                default_currency_code AS "defaultCurrencyCode",
                created_at AS "createdAt"
            FROM users
            WHERE email = ${email}
        `);

        return result.rows[0] ? this.toUserAccount(result.rows[0]) : null;
    }

    public async findById(id: string): Promise<UserAccount | null> {
        const result = await this.database.getPool().query<UserRecord>(sql`
            SELECT
                id,
                email,
                display_name AS "displayName",
                password_hash AS "passwordHash",
                default_currency_code AS "defaultCurrencyCode",
                created_at AS "createdAt"
            FROM users
            WHERE id = ${id}::uuid
        `);

        return result.rows[0] ? this.toUserAccount(result.rows[0]) : null;
    }

    public async getPreferences(userId: string): Promise<UserPreferencesModel | null> {
        const result = await this.database.getPool().query<UserPreferencesRecord>(sql`
            SELECT
                locale,
                theme,
                account_order AS "accountOrder"
            FROM users
            WHERE id = ${userId}::uuid
        `);

        return result.rows[0] ? this.toUserPreferences(result.rows[0]) : null;
    }

    public async updatePreferences(
        userId: string,
        preferences: UserPreferencesModel,
    ): Promise<UserPreferencesModel | null> {
        const accountOrder = [...preferences.accountOrder];
        const result = await this.database.getPool().query<UserPreferencesRecord>(sql`
            UPDATE users
            SET
                locale = ${preferences.locale},
                theme = ${preferences.theme},
                account_order = ${accountOrder}::uuid[],
                updated_at = now()
            WHERE id = ${userId}::uuid
            RETURNING locale, theme, account_order AS "accountOrder"
        `);

        return result.rows[0] ? this.toUserPreferences(result.rows[0]) : null;
    }

    private toUserAccount(record: UserRecord): UserAccount {
        return {
            id: record.id,
            email: record.email,
            displayName: record.displayName,
            passwordHash: record.passwordHash,
            defaultCurrencyCode: record.defaultCurrencyCode,
            createdAt: record.createdAt,
        };
    }

    private toUserPreferences(record: UserPreferencesRecord): UserPreferencesModel {
        return {
            locale: parseLocale(record.locale),
            theme: parseTheme(record.theme),
            accountOrder: record.accountOrder ?? [],
        };
    }
}

function parseLocale(value: string): Locale {
    if ((LOCALES as readonly string[]).includes(value)) {
        return value as Locale;
    }

    throw new Error(`Invalid locale in users row: ${value}`);
}

function parseTheme(value: string): Theme {
    if ((THEMES as readonly string[]).includes(value)) {
        return value as Theme;
    }

    throw new Error(`Invalid theme in users row: ${value}`);
}
