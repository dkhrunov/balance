import { CursorPageRequest, EntityId } from '../../common';
import { TransactionType } from '../models/transaction-type';

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
