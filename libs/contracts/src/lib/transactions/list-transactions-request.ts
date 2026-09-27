import { CursorPageRequest, CursorPageResponse, EntityId } from '../common';
import { Transaction } from './transaction';
import { TransactionType } from './transaction-type';

/**
 * Attribution filter for listing transactions.
 * - `all` — every user in the space
 * - `me` — only the authenticated caller
 * - `users` — explicit set of user ids (`createdBy`)
 */
export type TransactionCreatedByFilter =
    | { readonly mode: 'all' }
    | { readonly mode: 'me' }
    | { readonly mode: 'users'; readonly userIds: readonly EntityId[] };

/** Query parameters for `GET /transactions`. */
export interface ListTransactionsRequest extends CursorPageRequest {
    readonly createdBy?: TransactionCreatedByFilter;
    readonly accountId?: EntityId;
    readonly type?: TransactionType;
}

/** Cursor page of active income/expense transactions. */
export type ListTransactionsResponse = CursorPageResponse<Transaction>;
