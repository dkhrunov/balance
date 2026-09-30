import { Account, CreateAccountRequest } from '@balance/dto/accounts';

/** Creates a financial account in the single app space. */
export interface ICreateAccountUseCase {
    /**
     * @param actorUserId Authenticated user performing the create (attribution, not ownership).
     * @param request Create payload.
     */
    execute(actorUserId: string, request: CreateAccountRequest): Promise<Account>;
}

export const CREATE_ACCOUNT_USE_CASE = Symbol('CREATE_ACCOUNT_USE_CASE');
