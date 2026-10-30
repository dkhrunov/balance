import {
    CreateTransactionRequest,
    CreateTransferRequest,
    CreateTransferResponse,
    DeleteTransactionRequest,
    QueryTransactionsRequest,
    QueryTransactionsResponse,
    Transaction,
} from '@balance/dto/transactions';
import { ApiClient } from '../api-client';

export class TransactionsApi {
    private constructor() {
        /* empty constructor */
    }

    /** Queries transactions with optional account, type, createdBy, and cursor filters. */
    public static queryTransactions(request: QueryTransactionsRequest = {}): Promise<QueryTransactionsResponse> {
        return ApiClient.get<QueryTransactionsResponse>(`/transactions${this.toQueryTransactionsParams(request)}`);
    }

    /** Loads one transaction by id. */
    public static getTransaction(transactionId: Transaction['id']): Promise<Transaction> {
        return ApiClient.get<Transaction>(`/transactions/${transactionId}`);
    }

    /** Creates an income or expense transaction. */
    public static createTransaction(request: CreateTransactionRequest): Promise<Transaction> {
        return ApiClient.post<Transaction>('/transactions', request);
    }

    /** Creates an atomic transfer between two accounts. */
    public static createTransfer(request: CreateTransferRequest): Promise<CreateTransferResponse> {
        return ApiClient.post<CreateTransferResponse>('/transactions/transfers', request);
    }

    /** Soft-deletes a transaction with optimistic concurrency. */
    public static deleteTransaction(
        transactionId: Transaction['id'],
        request: DeleteTransactionRequest,
    ): Promise<Transaction> {
        return ApiClient.delete<Transaction>(`/transactions/${transactionId}`, request);
    }

    /** Builds the query string for `GET /transactions`. */
    private static toQueryTransactionsParams(request: QueryTransactionsRequest = {}): string {
        const params = new URLSearchParams();

        if (request.accountId) {
            params.set('accountId', request.accountId);
        }

        if (request.type) {
            params.set('type', request.type);
        }

        if (request.cursor) {
            params.set('cursor', request.cursor);
        }

        if (request.limit !== undefined) {
            params.set('limit', String(request.limit));
        }

        if (request.createdBy) {
            if (request.createdBy.mode === 'me') {
                params.set('createdBy', 'me');
            } else if (request.createdBy.mode === 'users') {
                params.set('createdBy', request.createdBy.userIds.join(','));
            } else {
                params.set('createdBy', 'all');
            }
        }

        const query = params.toString();

        return query.length > 0 ? `?${query}` : '';
    }
}
