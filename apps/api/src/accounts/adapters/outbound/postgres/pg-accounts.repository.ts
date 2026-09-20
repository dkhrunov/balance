import { sql } from '@ts-safeql/sql-tag';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../database/database.service';
import { AccountModel } from '../../../application/models/account.model';
import {
    AccountMutationResult,
    CreateAccountRecord,
    IAccountsRepository,
    SoftDeleteAccountRecord,
    UpdateAccountRecord,
} from '../../../application/ports/outbound/accounts.repository';
import { AccountRecord } from './records/account.record';

@Injectable()
export class PgAccountsRepository implements IAccountsRepository {
    public constructor(private readonly database: DatabaseService) {}

    public async listActive(): Promise<readonly AccountModel[]> {
        const result = await this.database.getPool().query<AccountRecord>(sql`
            SELECT
                id,
                name,
                currency_code AS "currency",
                initial_balance::text AS "initialBalance",
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
            FROM accounts
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
        `);

        return result.rows.map((row) => this.toAccountModel(row));
    }

    public async findActiveById(id: string): Promise<AccountModel | null> {
        const result = await this.database.getPool().query<AccountRecord>(sql`
            SELECT
                id,
                name,
                currency_code AS "currency",
                initial_balance::text AS "initialBalance",
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
            FROM accounts
            WHERE id = ${id}::uuid
              AND deleted_at IS NULL
        `);

        return result.rows[0] ? this.toAccountModel(result.rows[0]) : null;
    }

    public async create(input: CreateAccountRecord): Promise<AccountModel> {
        const result = await this.database.getPool().query<AccountRecord>(sql`
            INSERT INTO accounts (
                name,
                currency_code,
                initial_balance,
                created_by,
                updated_by
            )
            VALUES (
                ${input.name},
                ${input.currency},
                ${input.initialBalance}::numeric,
                ${input.actorUserId}::uuid,
                ${input.actorUserId}::uuid
            )
            RETURNING
                id,
                name,
                currency_code AS "currency",
                initial_balance::text AS "initialBalance",
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
        `);

        return this.toAccountModel(result.rows[0]);
    }

    public async updateActive(input: UpdateAccountRecord): Promise<AccountMutationResult> {
        const result = await this.database.getPool().query<AccountRecord>(sql`
            UPDATE accounts
            SET
                name = ${input.name},
                version = version + 1,
                updated_by = ${input.actorUserId}::uuid,
                updated_at = now()
            WHERE id = ${input.id}::uuid
              AND version = ${input.expectedVersion}
              AND deleted_at IS NULL
            RETURNING
                id,
                name,
                currency_code AS "currency",
                initial_balance::text AS "initialBalance",
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
        `);

        if (result.rows[0]) {
            return { kind: 'ok', account: this.toAccountModel(result.rows[0]) };
        }

        return this.resolveMutationMiss(input.id);
    }

    public async softDeleteActive(input: SoftDeleteAccountRecord): Promise<AccountMutationResult> {
        const result = await this.database.getPool().query<AccountRecord>(sql`
            UPDATE accounts
            SET
                version = version + 1,
                updated_by = ${input.actorUserId}::uuid,
                updated_at = now(),
                deleted_by = ${input.actorUserId}::uuid,
                deleted_at = now()
            WHERE id = ${input.id}::uuid
              AND version = ${input.expectedVersion}
              AND deleted_at IS NULL
            RETURNING
                id,
                name,
                currency_code AS "currency",
                initial_balance::text AS "initialBalance",
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
        `);

        if (result.rows[0]) {
            return { kind: 'ok', account: this.toAccountModel(result.rows[0]) };
        }

        return this.resolveMutationMiss(input.id);
    }

    private async resolveMutationMiss(id: string): Promise<AccountMutationResult> {
        const result = await this.database.getPool().query<{ exists: boolean }>(sql`
            SELECT EXISTS(
                SELECT 1
                FROM accounts
                WHERE id = ${id}::uuid
                  AND deleted_at IS NULL
            ) AS exists
        `);

        if (result.rows[0]?.exists) {
            return { kind: 'version_conflict' };
        }

        return { kind: 'not_found' };
    }

    private toAccountModel(record: AccountRecord): AccountModel {
        return {
            id: record.id,
            name: record.name,
            currency: record.currency,
            initialBalance: record.initialBalance,
            version: record.version,
            createdBy: record.createdBy,
            updatedBy: record.updatedBy,
            deletedBy: record.deletedBy,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            deletedAt: record.deletedAt,
        };
    }
}
