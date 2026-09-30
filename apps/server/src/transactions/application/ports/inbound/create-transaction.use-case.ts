import { CreateTransactionRequest, Transaction } from '@balance/dto/transactions';

/** Creates an income or expense transaction in the single app space. */
export interface ICreateTransactionUseCase {
    /**
     * @param actorUserId Authenticated user performing the create (attribution, not ownership).
     * @param request Create payload.
     */
    execute(actorUserId: string, request: CreateTransactionRequest): Promise<Transaction>;
}

export const CREATE_TRANSACTION_USE_CASE = Symbol('CREATE_TRANSACTION_USE_CASE');
