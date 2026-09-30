import { Transaction } from '@balance/contracts/transactions';

/** Loads one active income/expense transaction by id. */
export interface IGetTransactionUseCase {
    execute(transactionId: string): Promise<Transaction>;
}

export const GET_TRANSACTION_USE_CASE = Symbol('GET_TRANSACTION_USE_CASE');
