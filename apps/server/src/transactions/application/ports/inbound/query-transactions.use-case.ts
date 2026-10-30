import { QueryTransactionsRequest, QueryTransactionsResponse } from '@balance/dto/transactions';

/** Queries active income/expense transactions with attribution filters and cursor pagination. */
export interface IQueryTransactionsUseCase {
    /**
     * @param actorUserId Authenticated caller (resolves `createdBy.mode = me`).
     * @param request Query filters and pagination.
     */
    execute(actorUserId: string, request: QueryTransactionsRequest): Promise<QueryTransactionsResponse>;
}

export const QUERY_TRANSACTIONS_USE_CASE = Symbol('QUERY_TRANSACTIONS_USE_CASE');
