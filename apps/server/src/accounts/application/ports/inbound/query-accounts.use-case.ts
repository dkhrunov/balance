import { QueryAccountsResponse } from '@balance/dto/accounts';

/** Queries active accounts in the single app space. */
export interface IQueryAccountsUseCase {
    execute(): Promise<QueryAccountsResponse>;
}

export const QUERY_ACCOUNTS_USE_CASE = Symbol('QUERY_ACCOUNTS_USE_CASE');
