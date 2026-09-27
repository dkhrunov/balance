import { ListTransactionsRequest, ListTransactionsResponse } from '@balance/contracts/transactions';

/** Lists active income/expense transactions with attribution filters and cursor pagination. */
export interface IListTransactionsUseCase {
    /**
     * @param actorUserId Authenticated caller (resolves `createdBy.mode = me`).
     * @param request List filters and pagination.
     */
    execute(actorUserId: string, request: ListTransactionsRequest): Promise<ListTransactionsResponse>;
}

export const LIST_TRANSACTIONS_USE_CASE = Symbol('LIST_TRANSACTIONS_USE_CASE');
