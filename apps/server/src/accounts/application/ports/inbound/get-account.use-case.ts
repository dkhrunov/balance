import { Account } from '@balance/dto/accounts';

/** Loads one active account by id. */
export interface IGetAccountUseCase {
    execute(accountId: string): Promise<Account>;
}

export const GET_ACCOUNT_USE_CASE = Symbol('GET_ACCOUNT_USE_CASE');
