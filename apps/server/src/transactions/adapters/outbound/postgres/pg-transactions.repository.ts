import { sql } from '@ts-safeql/sql-tag';
import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../../../database/database.service';
import { TransactionModel } from '../../../application/models/transaction.model';
import {
    CreateTransactionRecord,
    CreateTransferRecord,
    CreatedTransferPair,
    ITransactionsRepository,
    ListTransactionsQuery,
    SoftDeleteTransactionRecord,
    TransactionMutationResult,
} from '../../../application/ports/outbound/transactions.repository';
import { TransactionRecord } from './records/transaction.record';
import { TransferType } from '@balance/dto/transactions';
import { CurrencyCode } from '@balance/dto/currencies';

type TransferLeg = {
    readonly type: TransferType;
    readonly accountId: string;
    readonly transferGroupId: string;
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: string;
    readonly description: string;
    readonly actorUserId: string;
};

@Injectable()
export class PgTransactionsRepository implements ITransactionsRepository {
    public constructor(private readonly database: DatabaseService) {}

    public async listActive(query: ListTransactionsQuery): Promise<readonly TransactionModel[]> {
        const createdByUserIds = query.createdByUserIds;
        const accountId = query.accountId;
        const type = query.type;
        const cursorDate = query.cursor?.transactionDate ?? null;
        const cursorCreatedAt = query.cursor?.createdAt ?? null;
        const cursorId = query.cursor?.id ?? null;

        const result = await this.database.getPool().query<TransactionRecord>(sql`
            SELECT
                id,
                type,
                account_id AS "accountId",
                category_id AS "categoryId",
                transfer_group_id AS "transferGroupId",
                amount::text AS amount,
                currency_code AS "currency",
                transaction_date::text AS "transactionDate",
                description,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
            FROM transactions
            WHERE deleted_at IS NULL
              AND (${accountId}::uuid IS NULL OR account_id = ${accountId}::uuid)
              AND (${type}::text IS NULL OR type = ${type})
              AND (
                ${createdByUserIds}::uuid[] IS NULL
                OR created_by = ANY(${createdByUserIds}::uuid[])
              )
              AND (
                ${cursorDate}::date IS NULL
                OR transaction_date < ${cursorDate}::date
                OR (
                    transaction_date = ${cursorDate}::date
                    AND created_at < ${cursorCreatedAt}::timestamptz
                )
                OR (
                    transaction_date = ${cursorDate}::date
                    AND created_at = ${cursorCreatedAt}::timestamptz
                    AND id < ${cursorId}::uuid
                )
              )
            ORDER BY transaction_date DESC, created_at DESC, id DESC
            LIMIT ${query.limit}
        `);

        return result.rows.map((row) => this.toTransactionModel(row));
    }

    public async findActiveById(id: string): Promise<TransactionModel | null> {
        const result = await this.database.getPool().query<TransactionRecord>(sql`
            SELECT
                id,
                type,
                account_id AS "accountId",
                category_id AS "categoryId",
                transfer_group_id AS "transferGroupId",
                amount::text AS amount,
                currency_code AS "currency",
                transaction_date::text AS "transactionDate",
                description,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
            FROM transactions
            WHERE id = ${id}::uuid
              AND deleted_at IS NULL
        `);

        return result.rows[0] ? this.toTransactionModel(result.rows[0]) : null;
    }

    public async create(input: CreateTransactionRecord): Promise<TransactionModel> {
        const result = await this.database.getPool().query<TransactionRecord>(sql`
            INSERT INTO transactions (
                type,
                account_id,
                category_id,
                amount,
                currency_code,
                transaction_date,
                description,
                created_by,
                updated_by
            )
            VALUES (
                ${input.type},
                ${input.accountId}::uuid,
                ${input.categoryId}::uuid,
                ${input.amount}::numeric,
                ${input.currency},
                ${input.transactionDate}::date,
                ${input.description},
                ${input.actorUserId}::uuid,
                ${input.actorUserId}::uuid
            )
            RETURNING
                id,
                type,
                account_id AS "accountId",
                category_id AS "categoryId",
                transfer_group_id AS "transferGroupId",
                amount::text AS amount,
                currency_code AS "currency",
                transaction_date::text AS "transactionDate",
                description,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
        `);

        return this.toTransactionModel(result.rows[0]);
    }

    public async createTransfer(input: CreateTransferRecord): Promise<CreatedTransferPair> {
        const client = await this.database.getPool().connect();

        try {
            await client.query('BEGIN');

            const groupResult = await client.query<{ id: string }>(sql`
                INSERT INTO transfer_groups DEFAULT VALUES
                RETURNING id
            `);
            const transferGroupId = groupResult.rows[0].id;

            const out = await this.insertTransferLeg(client, {
                type: 'TRANSFER_OUT',
                accountId: input.fromAccountId,
                transferGroupId,
                amount: input.amount,
                currency: input.currency,
                transactionDate: input.transactionDate,
                description: input.description,
                actorUserId: input.actorUserId,
            });

            const inbound = await this.insertTransferLeg(client, {
                type: 'TRANSFER_IN',
                accountId: input.toAccountId,
                transferGroupId,
                amount: input.amount,
                currency: input.currency,
                transactionDate: input.transactionDate,
                description: input.description,
                actorUserId: input.actorUserId,
            });

            await client.query('COMMIT');

            return { transferGroupId, out, in: inbound };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    public async softDeleteActive(input: SoftDeleteTransactionRecord): Promise<TransactionMutationResult> {
        const client = await this.database.getPool().connect();

        try {
            await client.query('BEGIN');

            const existing = await client.query<TransactionRecord>(sql`
                SELECT
                    id,
                    type,
                    account_id AS "accountId",
                    category_id AS "categoryId",
                    transfer_group_id AS "transferGroupId",
                    amount::text AS amount,
                    currency_code AS "currency",
                    transaction_date::text AS "transactionDate",
                    description,
                    version,
                    created_by AS "createdBy",
                    updated_by AS "updatedBy",
                    deleted_by AS "deletedBy",
                    created_at AS "createdAt",
                    updated_at AS "updatedAt",
                    deleted_at AS "deletedAt"
                FROM transactions
                WHERE id = ${input.id}::uuid
                  AND deleted_at IS NULL
                FOR UPDATE
            `);

            if (!existing.rows[0]) {
                await client.query('ROLLBACK');
                return this.resolveMutationMiss(input.id);
            }

            const target = existing.rows[0];

            if (target.version !== input.expectedVersion) {
                await client.query('ROLLBACK');
                return { kind: 'version_conflict' };
            }

            if (target.transferGroupId) {
                const legs = await client.query<TransactionRecord>(sql`
                    UPDATE transactions
                    SET
                        version = version + 1,
                        updated_by = ${input.actorUserId}::uuid,
                        updated_at = now(),
                        deleted_by = ${input.actorUserId}::uuid,
                        deleted_at = now()
                    WHERE transfer_group_id = ${target.transferGroupId}::uuid
                      AND deleted_at IS NULL
                    RETURNING
                        id,
                        type,
                        account_id AS "accountId",
                        category_id AS "categoryId",
                        transfer_group_id AS "transferGroupId",
                        amount::text AS amount,
                        currency_code AS "currency",
                        transaction_date::text AS "transactionDate",
                        description,
                        version,
                        created_by AS "createdBy",
                        updated_by AS "updatedBy",
                        deleted_by AS "deletedBy",
                        created_at AS "createdAt",
                        updated_at AS "updatedAt",
                        deleted_at AS "deletedAt"
                `);

                await client.query('COMMIT');

                const deletedTarget = legs.rows.find((row) => row.id === input.id);

                if (!deletedTarget) {
                    return { kind: 'not_found' };
                }

                return { kind: 'ok', transaction: this.toTransactionModel(deletedTarget) };
            }

            const result = await client.query<TransactionRecord>(sql`
                UPDATE transactions
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
                    type,
                    account_id AS "accountId",
                    category_id AS "categoryId",
                    transfer_group_id AS "transferGroupId",
                    amount::text AS amount,
                    currency_code AS "currency",
                    transaction_date::text AS "transactionDate",
                    description,
                    version,
                    created_by AS "createdBy",
                    updated_by AS "updatedBy",
                    deleted_by AS "deletedBy",
                    created_at AS "createdAt",
                    updated_at AS "updatedAt",
                    deleted_at AS "deletedAt"
            `);

            await client.query('COMMIT');

            if (result.rows[0]) {
                return { kind: 'ok', transaction: this.toTransactionModel(result.rows[0]) };
            }

            return this.resolveMutationMiss(input.id);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    private async insertTransferLeg(client: PoolClient, input: TransferLeg): Promise<TransactionModel> {
        const result = await client.query<TransactionRecord>(sql`
            INSERT INTO transactions (
                type,
                account_id,
                category_id,
                transfer_group_id,
                amount,
                currency_code,
                transaction_date,
                description,
                created_by,
                updated_by
            )
            VALUES (
                ${input.type},
                ${input.accountId}::uuid,
                NULL,
                ${input.transferGroupId}::uuid,
                ${input.amount}::numeric,
                ${input.currency},
                ${input.transactionDate}::date,
                ${input.description},
                ${input.actorUserId}::uuid,
                ${input.actorUserId}::uuid
            )
            RETURNING
                id,
                type,
                account_id AS "accountId",
                category_id AS "categoryId",
                transfer_group_id AS "transferGroupId",
                amount::text AS amount,
                currency_code AS "currency",
                transaction_date::text AS "transactionDate",
                description,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
        `);

        return this.toTransactionModel(result.rows[0]);
    }

    private async resolveMutationMiss(id: string): Promise<TransactionMutationResult> {
        const result = await this.database.getPool().query<{ exists: boolean }>(sql`
            SELECT EXISTS(
                SELECT 1
                FROM transactions
                WHERE id = ${id}::uuid
                  AND deleted_at IS NULL
            ) AS exists
        `);

        if (result.rows[0]?.exists) {
            return { kind: 'version_conflict' };
        }

        return { kind: 'not_found' };
    }

    private toTransactionModel(record: TransactionRecord): TransactionModel {
        return {
            id: record.id,
            type: record.type,
            accountId: record.accountId,
            categoryId: record.categoryId,
            transferGroupId: record.transferGroupId,
            amount: record.amount,
            currency: record.currency,
            transactionDate: record.transactionDate,
            description: record.description,
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
