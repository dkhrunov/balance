import {
    Account,
    CreateAccountRequest,
    DeleteAccountRequest,
    QueryAccountsResponse,
    UpdateAccountRequest,
} from '@balance/dto/accounts';
import { ApiClient } from '../api-client';

export class AccountsApi {
    private constructor() {
        /* empty constructor */
    }

    /** Queries active accounts in the single financial space. */
    public static queryAccounts(): Promise<QueryAccountsResponse> {
        return ApiClient.get<QueryAccountsResponse>('/accounts');
    }

    /** Loads one active account by id. */
    public static getAccount(accountId: Account['id']): Promise<Account> {
        return ApiClient.get<Account>(`/accounts/${accountId}`);
    }

    /** Creates an account. */
    public static createAccount(request: CreateAccountRequest): Promise<Account> {
        return ApiClient.post<Account>('/accounts', request);
    }

    /** Updates an account name/icon with optimistic concurrency. */
    public static updateAccount(
        accountId: Account['id'],
        request: UpdateAccountRequest,
    ): Promise<Account> {
        return ApiClient.put<Account>(`/accounts/${accountId}`, request);
    }

    /** Soft-deletes an account with optimistic concurrency. */
    public static deleteAccount(
        accountId: Account['id'],
        request: DeleteAccountRequest,
    ): Promise<Account> {
        return ApiClient.delete<Account>(`/accounts/${accountId}`, request);
    }
}
