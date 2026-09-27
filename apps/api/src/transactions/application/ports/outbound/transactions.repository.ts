import { CurrencyCode } from '@balance/contracts/currencies';
import { TransactionType } from '@balance/contracts/transactions';
import { TransactionModel } from '../../models/transaction.model';

/** Result of an optimistic-concurrency mutation against the transactions store. */
export type TransactionMutationResult =
    | { readonly kind: 'ok'; readonly transaction: TransactionModel }
    | { readonly kind: 'not_found' }
    | { readonly kind: 'version_conflict' };

/** Cursor key for keyset pagination (newest first). */
export type TransactionListCursor = {
    readonly transactionDate: string;
    readonly createdAt: Date;
    readonly id: string;
};

/** Filters and pagination for listing active income/expense rows. */
export type ListTransactionsQuery = {
    readonly createdByUserIds: readonly string[] | null;
    readonly accountId: string | null;
    readonly type: TransactionType | null;
    readonly cursor: TransactionListCursor | null;
    readonly limit: number;
};

/** Input for inserting a new income/expense row. */
export type CreateTransactionRecord = {
    readonly type: TransactionType;
    readonly accountId: string;
    readonly categoryId: string;
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: string;
    readonly description: string;
    readonly actorUserId: string;
};

/** Input for soft-deleting an active transaction with optimistic concurrency. */
export type SoftDeleteTransactionRecord = {
    readonly id: string;
    readonly expectedVersion: number;
    readonly actorUserId: string;
};

/**
 * Persistence port for income and expense transactions.
 */
export interface ITransactionsRepository {
    /**
     * Lists active transactions with attribution / account filters and keyset pagination.
     *
     * @param query Filters, cursor, and page size (fetches `limit + 1` rows when possible).
     */
    listActive(query: ListTransactionsQuery): Promise<readonly TransactionModel[]>;

    /**
     * Loads an active transaction by id.
     *
     * @param id Transaction id.
     * @returns Transaction or `null` when missing or soft-deleted.
     */
    findActiveById(id: string): Promise<TransactionModel | null>;

    /**
     * Inserts a new income/expense transaction.
     *
     * @param input Create fields and actor.
     */
    create(input: CreateTransactionRecord): Promise<TransactionModel>;

    /**
     * Soft-deletes an active transaction when `expectedVersion` matches.
     *
     * @param input Delete target, expected version, and actor.
     */
    softDeleteActive(input: SoftDeleteTransactionRecord): Promise<TransactionMutationResult>;
}

export const TRANSACTIONS_REPOSITORY = Symbol('TRANSACTIONS_REPOSITORY');
