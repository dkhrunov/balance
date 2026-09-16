import { sql } from '@ts-safeql/sql-tag';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../database/database.service';
import { UserAccount } from '../../../application/models/user-account';
import { IUsersRepository } from '../../../application/ports/outbound/users.repository';
import { UserRecord } from './records/user.record';

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
}
