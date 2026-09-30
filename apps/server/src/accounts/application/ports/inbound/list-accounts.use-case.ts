import { ListAccountsResponse } from '@balance/dto/accounts';

/** Lists active accounts in the single app space. */
export interface IListAccountsUseCase {
    execute(): Promise<ListAccountsResponse>;
}

export const LIST_ACCOUNTS_USE_CASE = Symbol('LIST_ACCOUNTS_USE_CASE');
