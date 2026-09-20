import { Account } from './account';

/** Active (non-deleted) accounts in the single app space. */
export interface ListAccountsResponse {
    readonly items: readonly Account[];
}
