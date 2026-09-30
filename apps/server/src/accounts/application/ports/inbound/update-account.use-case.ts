import { Account, UpdateAccountRequest } from '@balance/dto/accounts';

/** Updates name and icon on an active account with optimistic concurrency. */
export interface IUpdateAccountUseCase {
    /**
     * @param actorUserId Authenticated user performing the update.
     * @param accountId Account id.
     * @param request Name and expected version.
     */
    execute(actorUserId: string, accountId: string, request: UpdateAccountRequest): Promise<Account>;
}

export const UPDATE_ACCOUNT_USE_CASE = Symbol('UPDATE_ACCOUNT_USE_CASE');
