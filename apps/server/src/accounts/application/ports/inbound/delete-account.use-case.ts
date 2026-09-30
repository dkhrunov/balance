import { Account, DeleteAccountRequest } from '@balance/dto/accounts';

/** Soft-deletes an active account with optimistic concurrency. */
export interface IDeleteAccountUseCase {
    /**
     * @param actorUserId Authenticated user performing the soft-delete.
     * @param accountId Account id.
     * @param request Expected version.
     */
    execute(actorUserId: string, accountId: string, request: DeleteAccountRequest): Promise<Account>;
}

export const DELETE_ACCOUNT_USE_CASE = Symbol('DELETE_ACCOUNT_USE_CASE');
