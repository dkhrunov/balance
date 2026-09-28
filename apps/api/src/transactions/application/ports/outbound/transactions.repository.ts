import { CurrencyCode } from '@balance/contracts/currencies';
import { SimpleTransactionType, TransactionType } from '@balance/contracts/transactions';
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

/** Filters and pagination for listing active transactions. */
export type ListTransactionsQuery = {
    readonly createdByUserIds: readonly string[] | null;
    readonly accountId: string | null;
    readonly type: TransactionType | null;
    readonly cursor: TransactionListCursor | null;
    readonly limit: number;
};

/** Input for inserting a new income/expense row. */
export type CreateTransactionRecord = {
    readonly type: SimpleTransactionType;
    readonly accountId: string;
    readonly categoryId: string;
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: string;
    readonly description: string;
    readonly actorUserId: string;
};

/** Input for inserting both legs of a same-currency transfer atomically. */
export type CreateTransferRecord = {
    readonly fromAccountId: string;
    readonly toAccountId: string;
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: string;
    readonly description: string;
    readonly actorUserId: string;
};

/** Both legs returned after an atomic transfer insert. */
export type CreatedTransferPair = {
    readonly transferGroupId: string;
    readonly out: TransactionModel;
    readonly in: TransactionModel;
};

/** Input for soft-deleting an active transaction with optimistic concurrency. */
export type SoftDeleteTransactionRecord = {
    readonly id: string;
    readonly expectedVersion: number;
    readonly actorUserId: string;
};

/**
 * Persistence port for financial transactions (income, expense, transfer legs).
 */
export interface ITransactionsRepository {
    /**
     * Lists active transactions with attribution / account filters and keyset pagination.
     *
     * @param query Filters, cursor, and page size.
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
     * Inserts TRANSFER_OUT and TRANSFER_IN legs in one database transaction.
     *
     * @param input Transfer fields and actor.
     */
    createTransfer(input: CreateTransferRecord): Promise<CreatedTransferPair>;

    /**
     * Soft-deletes an active transaction when `expectedVersion` matches.
     * Transfer legs soft-delete the whole `transferGroup` atomically.
     *
     * @param input Delete target, expected version, and actor.
     */
    softDeleteActive(input: SoftDeleteTransactionRecord): Promise<TransactionMutationResult>;
}

export const TRANSACTIONS_REPOSITORY = Symbol('TRANSACTIONS_REPOSITORY');
