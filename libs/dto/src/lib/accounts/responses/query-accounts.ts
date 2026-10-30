import { Account } from '../models/account';

/** Active (non-deleted) accounts in the single app space. */
export interface QueryAccountsResponse {
    readonly items: readonly Account[];
}
