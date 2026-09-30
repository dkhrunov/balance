import { DeleteTransactionRequest, Transaction } from '@balance/contracts/transactions';

/** Soft-deletes an active transaction with optimistic concurrency. */
export interface IDeleteTransactionUseCase {
    /**
     * @param actorUserId Authenticated user performing the soft-delete.
     * @param transactionId Transaction id.
     * @param request Expected version.
     */
    execute(actorUserId: string, transactionId: string, request: DeleteTransactionRequest): Promise<Transaction>;
}

export const DELETE_TRANSACTION_USE_CASE = Symbol('DELETE_TRANSACTION_USE_CASE');
